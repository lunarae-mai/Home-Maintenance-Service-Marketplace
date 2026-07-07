using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for viewing and updating the authenticated user's profile.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IProfileManagementService _profileManagementService;
        private readonly ICurrentUserService _currentUserService;

        public UserController(
            IProfileManagementService profileManagementService,
            ICurrentUserService currentUserService)
        {
            _profileManagementService = profileManagementService;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Retrieves the authenticated user's profile information.
        /// </summary>
        /// <returns>The current user's profile.</returns>
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            var user = await _profileManagementService.GetProfileAsync(userId);

            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User profile not found."
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Profile retrieved successfully.",
                Data = user
            });
        }

        /// <summary>
        /// Updates the authenticated user's profile information.
        /// </summary>
        /// <param name="dto">The updated profile information.</param>
        /// <returns>The updated user profile.</returns>
        [HttpPut("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            try
            {
                var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

                if (!result)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Profile update failed."
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Profile updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Profile update failed.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Changes the authenticated user's password.
        /// </summary>
        /// <param name="dto">The password change request.</param>
        /// <returns>A confirmation that the password was updated.</returns>
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            try
            {
                await _profileManagementService.ChangePasswordAsync(userId, dto);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Password updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Password update failed.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Retrieves all users, optionally filtered by role.
        /// </summary>
        /// <param name="role">Optional role filter.</param>
        /// <returns>A list of users.</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role)
        {
            var users = await _profileManagementService.GetAllUsersAsync(role);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Users retrieved successfully.",
                Data = users
            });
        }
    }
}