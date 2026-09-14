using ECommerce.API.DTOs.Auth;

namespace ECommerce.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(RegisterDto dto);

        Task<LoginResponseDto> LoginAsync(LoginDto dto);

        // Forgot password — generates a one-time reset token and
        // (in production) emails a link. Here we return the token so
        // the frontend can complete the flow without an email server.
        Task<ForgotPasswordResultDto> ForgotPasswordAsync(ForgotPasswordDto dto);

        // Reset password — consumes the token, hashes and stores the new password.
        Task ResetPasswordAsync(ResetPasswordDto dto);
    }
}
