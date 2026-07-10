using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace HomeServicesPlatform.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var app = builder.Build();

            app.MapGet("/", () => "Warning: This is the empty placeholder API project! The REAL API is in the HomeMaintenanceServiceMarketplace folder.");

            app.Run();
        }
    }
}
