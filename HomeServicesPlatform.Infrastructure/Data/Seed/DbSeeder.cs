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

            // Seed Services
            if (!context.Services.Any())
            {
                var categories = context.ServiceCategories.ToList();
                var services = new List<Service>();

                var catHomeMaintenance = categories.FirstOrDefault(c => c.Name == "Home Maintenance");
                if (catHomeMaintenance != null)
                {
                    services.Add(new Service { Name = "General Repair", Duration = 60, PriceModel = "Hourly", ServiceCategoryId = catHomeMaintenance.Id });
                    services.Add(new Service { Name = "Furniture Assembly", Duration = 90, PriceModel = "Fixed", ServiceCategoryId = catHomeMaintenance.Id });
                }

                var catPlumbing = categories.FirstOrDefault(c => c.Name == "Plumbing");
                if (catPlumbing != null)
                {
                    services.Add(new Service { Name = "Leak Repair", Duration = 45, PriceModel = "Hourly", ServiceCategoryId = catPlumbing.Id });
                    services.Add(new Service { Name = "Drain Cleaning", Duration = 60, PriceModel = "Fixed", ServiceCategoryId = catPlumbing.Id });
                }

                var catElectrical = categories.FirstOrDefault(c => c.Name == "Electrical");
                if (catElectrical != null)
                {
                    services.Add(new Service { Name = "Outlet Installation", Duration = 30, PriceModel = "Fixed", ServiceCategoryId = catElectrical.Id });
                    services.Add(new Service { Name = "Light Fixture Replacement", Duration = 60, PriceModel = "Hourly", ServiceCategoryId = catElectrical.Id });
                }

                var catPainting = categories.FirstOrDefault(c => c.Name == "Painting");
                if (catPainting != null)
                {
                    services.Add(new Service { Name = "Room Wall Painting", Duration = 180, PriceModel = "Fixed", ServiceCategoryId = catPainting.Id });
                }

                var catCleaning = categories.FirstOrDefault(c => c.Name == "Cleaning");
                if (catCleaning != null)
                {
                    services.Add(new Service { Name = "Deep House Cleaning", Duration = 240, PriceModel = "Fixed", ServiceCategoryId = catCleaning.Id });
                }

                await context.Services.AddRangeAsync(services);
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