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
    {/// <summary>
/// Provides endpoints for viewing and updating the authenticated user's profile.
/// </summary>
        private readonly IProfileManagementService _profileManagementService;
        private readonly ICurrentUserService _currentUserService;
       
        public UserController(IProfileManagementService profileManagementService , ICurrentUserService currentUserService)
        {
            _profileManagementService = profileManagementService;
            _currentUserService = currentUserService;
        }
/// <summary>
/// Retrieves the authenticated user's profile information.
/// </summary>
/// <returns>The current user's profile.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
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


        /// <summary>
/// Updates the authenticated user's profile information.
/// </summary>
/// <param name="request">The updated profile information.</param>
/// <returns>The updated user profile.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]

        // UPDATE PROFILE
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

                if (!result)
                    return BadRequest("Update failed");

                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        // CHANGE PASSWORD
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                await _profileManagementService.ChangePasswordAsync(userId, dto);

                return Ok(new { message = "Password updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        // GET ALL USERS 
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role)
        {
            var users = await _profileManagementService.GetAllUsersAsync(role);
           
            return Ok(users);
        }

    }
}