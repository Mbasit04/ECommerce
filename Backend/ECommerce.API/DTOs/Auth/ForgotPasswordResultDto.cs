namespace ECommerce.API.DTOs.Auth
{
    public class ForgotPasswordResultDto
    {
        public string Message { get; set; } = string.Empty;

        // Only populated in non-production. Lets the demo frontend
        // route the user to the reset screen without an email server.
        public string? DevResetToken { get; set; }
    }
}
