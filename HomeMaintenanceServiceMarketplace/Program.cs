using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Services;
using HomeServicesPlatform.Application.Services.Auth;
using HomeServicesPlatform.Application.Services.ProfileManagement;
using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<HomeServicesPlatform.Infrastructure.Data.AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services and their interfaces
builder.Services.AddScoped<HomeServicesPlatform.Application.Interfaces.IAppDbContext, HomeServicesPlatform.Infrastructure.Data.AppDbContext>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileManagementService, ProfileManagementService>();

// Add Authentication with JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();

// Register Provider Management Service
builder.Services.AddScoped<IProviderManagementService, ProviderManagementService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseRouting();

// Add Authentication and Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Home Maintenance API is Running!");
app.MapControllers();

// Use Swagger
app.UseSwagger();
app.UseSwaggerUI();

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