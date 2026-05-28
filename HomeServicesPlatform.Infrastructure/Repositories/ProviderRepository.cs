using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Infrastructure.Data;

namespace HomeServicesPlatform.Infrastructure.Repositories
{
    public class ProviderRepository : GenericRepository<ProviderProfile>, IProviderRepository
    {
        public ProviderRepository(AppDbContext context) : base(context)
        {
        }
    }
}