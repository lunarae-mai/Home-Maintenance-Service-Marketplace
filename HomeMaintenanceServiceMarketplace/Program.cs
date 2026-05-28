using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Registering the Provider Management Service for Dependency Injection
// لو لقيت حد بيطلب الانترفيس ده -> ابعتله نسخه من الكلاس ده
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
