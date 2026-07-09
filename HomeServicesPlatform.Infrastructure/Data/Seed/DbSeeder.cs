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

            // Seed Default Admin Account
            if (!context.ApplicationUsers.Any(u => u.Role == "Admin"))
            {
                var hasher = new PasswordHasher<ApplicationUser>();

                var adminUser = new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "System Admin",
                    Email = "admin@homeservices.com",
                    Phone = "+1234567890",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };

                // Hash the default password: Admin@123
                adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

                // Generate refresh token
                adminUser.RefreshToken = GenerateRefreshToken();
                adminUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await context.ApplicationUsers.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
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