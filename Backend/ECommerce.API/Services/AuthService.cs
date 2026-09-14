using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ECommerce.API.Data;
using ECommerce.API.DTOs.Auth;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // In-memory store for one-time password-reset tokens.
        // Keyed by email, value is (tokenHash, expiresAt).
        // Replace with a DB table + email provider for production.
        private static readonly Dictionary<string, (string TokenHash, DateTime ExpiresAt)> _resetTokens = new();

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existingUser != null)
            {
                throw new Exception("Email already exists.");
            }

            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                throw new Exception("Customer role does not exist.");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Address = dto.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = customerRole.Id
            };

            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            return await CreateLoginResponseAsync(user);
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
            {
                throw new Exception("Invalid email or password.");
            }

            if (!user.IsActive)
            {
                throw new Exception("Your account is inactive.");
            }

            var passwordValid = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash);

            if (!passwordValid)
            {
                throw new Exception("Invalid email or password.");
            }

            return await CreateLoginResponseAsync(user);
        }

        public async Task<ForgotPasswordResultDto> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

            // Always return a generic success-style message so we don't
            // leak which emails are registered. Only generate a token
            // when the account actually exists.
            if (user == null)
            {
                return new ForgotPasswordResultDto
                {
                    Message = "If an account with that email exists, a password reset link has been sent.",
                };
            }

            var token = GenerateOpaqueToken();
            var tokenHash = HashToken(token);
            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            _resetTokens[email] = (tokenHash, expiresAt);

            // In production, send an email with a link like
            //   https://your-app/reset-password?token={token}
            // For this demo, return the token to the client so the user
            // can complete the reset without an email server.
            return new ForgotPasswordResultDto
            {
                Message = "If an account with that email exists, a password reset link has been sent.",
                DevResetToken = token,
            };
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            if (!_resetTokens.TryGetValue(email, out var entry))
            {
                throw new Exception("Invalid or expired reset token.");
            }

            if (entry.ExpiresAt < DateTime.UtcNow)
            {
                _resetTokens.Remove(email);
                throw new Exception("Reset token has expired. Please request a new one.");
            }

            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(HashToken(dto.Token)),
                    Encoding.UTF8.GetBytes(entry.TokenHash)))
            {
                throw new Exception("Invalid reset token.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

            if (user == null)
            {
                throw new Exception("Account not found.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();

            // Burn the token so it can't be reused.
            _resetTokens.Remove(email);
        }

        // ----------------------------------------------------------------
        // helpers
        // ----------------------------------------------------------------

        private async Task<LoginResponseDto> CreateLoginResponseAsync(
            User user)
        {
            var role = await _context.UserRoles
                .Where(x => x.UserId == user.Id)
                .Select(x => x.Role.Name)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(role))
            {
                throw new Exception("User role not found.");
            }

            var token = GenerateJwtToken(user, role);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = role
            };
        }

        private string GenerateJwtToken(User user, string role)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = jwtSettings["Key"];

            if (string.IsNullOrEmpty(key))
            {
                throw new Exception("JWT Key is not configured.");
            }

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName),

                new Claim(
                    ClaimTypes.Email,
                    user.Email),

                new Claim(
                    ClaimTypes.Role,
                    role)
            };

            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key));

            var credentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(
                    jwtSettings["DurationInMinutes"] ?? "60"));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }

        private static string GenerateOpaqueToken()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static string HashToken(string token)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}
