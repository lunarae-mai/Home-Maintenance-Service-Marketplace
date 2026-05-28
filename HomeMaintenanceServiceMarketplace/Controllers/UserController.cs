using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IProfileManagementService _profileManagementService;

        public UserController(IProfileManagementService profileManagementService)
        {
            _profileManagementService = profileManagementService;
        }

        // GET PROFILE
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _profileManagementService.GetProfileAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // UPDATE PROFILE
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

            if (!result)
                return BadRequest("Update failed");

            return Ok("Profile updated successfully");
        }
    }
}