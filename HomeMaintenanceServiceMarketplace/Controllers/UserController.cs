using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IProfileManagementService _profileManagementService;
        private readonly ICurrentUserService _currentUserService;
       
        public UserController(IProfileManagementService profileManagementService , ICurrentUserService currentUserService)
        {
            _profileManagementService = profileManagementService;
            _currentUserService = currentUserService;
        }

        // GET PROFILE
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _profileManagementService.GetProfileAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        
        // UPDATE PROFILE
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

            if (!result)
                return BadRequest("Update failed");

            return Ok("Profile updated successfully");
        }

        
        // CHANGE PASSWORD
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _profileManagementService.ChangePasswordAsync(userId, dto);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return Ok(new { message = "Password updated successfully." });
        }

    }
}