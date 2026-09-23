using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Middleware
{
    // Catches exceptions thrown anywhere downstream of the pipeline and
    // translates them into predictable JSON envelopes so the React UI can
    // show a friendly toast instead of a generic 500.
    //
    // Two cases we explicitly handle:
    //   1. DbUpdateConcurrencyException — thrown when [ConcurrencyCheck] on
    //      Product.Stock detects that another transaction changed the row
    //      between our read and write. Surfaced as 409 so the frontend can
    //      prompt the user to retry (e.g. "stock just changed").
    //   2. Generic Exception — wrapped as 500 with a sanitised message.
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex,
                    "Concurrency conflict on {Path}",
                    context.Request.Path);

                await WriteJsonAsync(
                    context,
                    HttpStatusCode.Conflict,
                    new
                    {
                        success = false,
                        message =
                            "This record was updated by someone else. " +
                            "Please refresh and try again."
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unhandled exception on {Path}",
                    context.Request.Path);

                await WriteJsonAsync(
                    context,
                    HttpStatusCode.InternalServerError,
                    new
                    {
                        success = false,
                        message = "Something went wrong. Please try again."
                    });
            }
        }

        private static Task WriteJsonAsync(
            HttpContext context,
            HttpStatusCode statusCode,
            object body)
        {
            // Skip if the response has already started writing — we can't
            // safely change headers at that point.
            if (context.Response.HasStarted)
            {
                return Task.CompletedTask;
            }

            context.Response.Clear();
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(
                body,
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase
                });

            return context.Response.WriteAsync(payload);
        }
    }
}
