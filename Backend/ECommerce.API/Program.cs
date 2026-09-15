using ECommerce.API.Interfaces;
using ECommerce.API.Services;
using ECommerce.API.Data;
using ECommerce.API.Configuration;

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using System.Text;

// Stripe.NET ships its own ProductService / CustomerService that
// collide with ECommerce services when both namespaces are pulled
// in. Alias StripeConfiguration so the global ApiKey setup is
// unambiguous.
using StripeConfig = Stripe.StripeConfiguration;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// Add Services
// ==========================================

builder.Services.AddControllers();

// The React development server runs on a different origin (localhost:5173).
// Allow it to call this API from the browser; Swagger is same-origin and does
// not expose this requirement.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================================
// Database
// ==========================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ==========================================
// Authentication & Business Services
// ==========================================

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IDealService, DealService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<StripePaymentService>();
builder.Services.AddScoped<ISellerService, SellerService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IPaymentService, StripePaymentService>();
builder.Services.AddScoped<IStripeWebhookService, StripeWebhookService>();
builder.Services.Configure<StripeSettings>(
    builder.Configuration.GetSection("Stripe"));

// Set the global Stripe API key once at startup so every
// downstream Stripe.net call reuses it.
var stripeSecretKey =
    builder.Configuration["Stripe:SecretKey"];

if (!string.IsNullOrWhiteSpace(stripeSecretKey))
{
    StripeConfig.ApiKey = stripeSecretKey;
}

// ==========================================
// Swagger
// ==========================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName!.Replace('.', '_').Replace('+', '_'));

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: Bearer {your-token}"
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)]
                = new List<string>()
        });
});

// ==========================================
// JWT Authentication
// ==========================================

var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("JWT Key is missing.");
}

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// ==========================================
// Authorization
// ==========================================

builder.Services.AddAuthorization();

// ==========================================
// Build Application
// ==========================================

var app = builder.Build();

// ==========================================
// Middleware
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
