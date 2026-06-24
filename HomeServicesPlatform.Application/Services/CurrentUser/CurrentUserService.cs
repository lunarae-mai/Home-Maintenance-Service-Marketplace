using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HomeServicesPlatform.Application.Services.CurrentUser
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        // Constructor to inject IHttpContextAccessor for accessing the current HTTP request
        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // Retrieves the authenticated user's ID from the NameIdentifier claim
        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        // Retrieves the authenticated user's role from the Role claim
        public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
    }
}
