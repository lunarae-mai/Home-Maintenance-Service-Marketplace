using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Services;
using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<HomeServicesPlatform.Infrastructure.Data.AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<HomeServicesPlatform.Application.Interfaces.IAppDbContext, HomeServicesPlatform.Infrastructure.Data.AppDbContext>();

// Register Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
// Register Provider Management Service 

var app = builder.Build();
app.MapGet("/", () => "Home Maintenance API is Running!");


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<HomeServicesPlatform.Infrastructure.Data.AppDbContext>();
    await HomeServicesPlatform.Infrastructure.Seed.DbSeeder.SeedData(context);
}

app.Run();

namespace HomeServicesPlatform.API
{
    public class Program
    {

    }
}
