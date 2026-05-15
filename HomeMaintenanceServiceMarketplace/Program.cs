using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Register Provider Management Service 
builder.Services.AddScoped<IProviderManagementService, ProviderManagementService>();

var app = builder.Build();

app.MapGet("/", () => "Home Maintenance API is Running!");

app.Run();

namespace HomeServicesPlatform.API
{
    public class Program
    {

    }
}
