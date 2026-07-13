using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Reflection;
using System.Text;
using HomeServicesPlatform.API.Extensions;
using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.Mappings;
using HomeServicesPlatform.Application.Services;
using HomeServicesPlatform.Application.Services.Auth;
using HomeServicesPlatform.Application.Services.CurrentUser;
using HomeServicesPlatform.Application.Services.ProfileManagement;
using HomeServicesPlatform.Infrastructure.Data;
using HomeServicesPlatform.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5137",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5137")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddDbContext<HomeServicesPlatform.Infrastructure.Data.AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services and their interfaces
builder.Services.AddScoped<HomeServicesPlatform.Application.Interfaces.IAppDbContext>(provider => provider.GetRequiredService<HomeServicesPlatform.Infrastructure.Data.AppDbContext>());
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
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),

        NameClaimType = System.Security.Claims.ClaimTypes.Name,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Register Payment Service
builder.Services.AddScoped<IPaymentService, HomeServicesPlatform.Infrastructure.Services.PaymentService>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";

    options.IncludeXmlComments(
        Path.Combine(AppContext.BaseDirectory, xmlFilename));

    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("bearer", document)] = []
        });
});

// Register Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();

// Register Provider Management Service
builder.Services.AddScoped<IProviderManagementService, ProviderManagementService>();

// Register Availability Service- mai
builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();

//slot sprint 2
builder.Services.AddHostedService<HomeServicesPlatform.Infrastructure.BackgroundJobs.SlotGenerationBackgroundService>();

// Register the HttpContextAccessor to enable accessing HTTP context outside controllers
builder.Services.AddHttpContextAccessor();

// Register the current user service with a scoped lifetime
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IServiceService, ServiceService>();

//booking
builder.Services.AddScoped<IBookingService, BookingService>();

// Register the review service
builder.Services.AddScoped<IReviewService, ReviewService>();

builder.Services.AddAutoMapper(typeof(MappingProfile));

var app = builder.Build();

// 1.Exception Handling
app.UseGlobalExceptionHandling();

// 2. Routing  
app.UseRouting();

app.UseStaticFiles();

// 3. CORS 
app.UseCors("AllowFrontend");

// 4. Authentication / Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Home Maintenance API is Running!");
app.MapControllers();

app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<HomeServicesPlatform.Infrastructure.Data.AppDbContext>();
    await context.Database.MigrateAsync();
    await HomeServicesPlatform.Infrastructure.Seed.DbSeeder.SeedData(context);
}

app.Run();

namespace HomeServicesPlatform.API
{
    public class Program
    {

    }
}