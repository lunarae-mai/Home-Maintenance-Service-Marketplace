using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Domain.Models;
using System.Linq;
using System.Threading.Tasks;

namespace HomeServicesPlatform.Infrastructure.Seed
{
    public static class DbSeeder
    {
        public static async Task SeedData(AppDbContext context)
        {
            if (context.ServiceCategories.Any()) return;

            var categories = new[]
            {
                new ServiceCategory { Name = "Home Maintenance", Description = "General home repairs", IsActive = true },
                new ServiceCategory { Name = "Plumbing", Description = "Pipes and water issues", IsActive = true },
                new ServiceCategory { Name = "Electrical", Description = "Wiring and lighting", IsActive = true }
            };

            await context.ServiceCategories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }
}