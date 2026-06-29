using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Services;
using HomeServicesPlatform.Application.Services.Auth;
using HomeServicesPlatform.Application.Services.CurrentUser;
using HomeServicesPlatform.Application.Services.ProfileManagement;
using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.API.Extensions; // Import extension for middleware

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
// Register Payment Service
builder.Services.AddScoped<IPaymentService, HomeServicesPlatform.Infrastructure.Services.PaymentService>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();

// Register Provider Management Service
builder.Services.AddScoped<IProviderManagementService, ProviderManagementService>();

// Register Availability Service- mai
builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();


// Register the HttpContextAccessor to enable accessing HTTP context outside controllers
builder.Services.AddHttpContextAccessor();

// Register the current user service with a scoped lifetime
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddScoped<IServiceService, ServiceService>();

//booking
builder.Services.AddScoped<IBookingService, BookingService>();

var app = builder.Build();

// ===== GLOBAL EXCEPTION HANDLING MIDDLEWARE =====
// This must be FIRST in the pipeline to catch all exceptions
app.UseGlobalExceptionHandling();

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