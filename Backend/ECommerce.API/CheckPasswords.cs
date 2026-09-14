using System;
using System.Linq;
using ECommerce.API.Data;

namespace ECommerce.API
{
    public static class CheckPasswords
    {
        public static void Run(ApplicationDbContext context)
        {
            var usman = context.Users.FirstOrDefault(x => x.Email == "usman@example.com");
            if (usman != null)
            {
                // Set password to 123456 hashed with BCrypt
                usman.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
                context.SaveChanges();
                Console.WriteLine("UPDATED_USMAN_PASSWORD_TO_123456");
            }
        }
    }
}
