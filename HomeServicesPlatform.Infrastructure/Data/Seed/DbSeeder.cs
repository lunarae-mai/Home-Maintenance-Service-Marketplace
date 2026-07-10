using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;

namespace HomeServicesPlatform.Infrastructure.Seed
{
    public static class DbSeeder
    {
        public static async Task SeedData(AppDbContext context)
        {
            // Seed Service Categories
            if (!context.ServiceCategories.Any())
            {
                var categories = new[]
                {
                    new ServiceCategory 
                    { 
                        Name = "Home Maintenance", 
                        Description = "General home repairs and maintenance", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "Plumbing", 
                        Description = "Pipes, water systems, and drainage issues", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "Electrical", 
                        Description = "Wiring, lighting, and electrical systems", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "Carpentry", 
                        Description = "Woodwork, furniture repair, and installation", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "Painting", 
                        Description = "Interior and exterior painting services", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "HVAC", 
                        Description = "Heating, ventilation, and air conditioning", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory 
                    { 
                        Name = "Cleaning", 
                        Description = "House cleaning and sanitization services", 
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.ServiceCategories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // Seed Requested Admin Accounts
            var adminEmails = new[]
            {
                "adhamshaheen282@gmail.com",
                "maimaged357@gmail.com",
                "malak.mohamed141azmy@gmail.com",
                "mariam22khalid22@gmail.com",
                "nada.baki54@gmail.com",
                "ffathy2244@gmail.com"
            };

            foreach (var email in adminEmails)
            {
                if (!context.ApplicationUsers.Any(u => u.Email == email))
                {
                    var hasher = new PasswordHasher<ApplicationUser>();

                    var adminUser = new ApplicationUser
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = email.Split('@')[0],
                        Email = email,
                        Phone = "+1234567890",
                        Role = "Admin",
                        CreatedAt = DateTime.UtcNow
                    };

                    adminUser.PasswordHash = hasher.HashPassword(adminUser, "12345abcd");

                    adminUser.RefreshToken = GenerateRefreshToken();
                    adminUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                    await context.ApplicationUsers.AddAsync(adminUser);
                }
            }
            await context.SaveChangesAsync();
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}