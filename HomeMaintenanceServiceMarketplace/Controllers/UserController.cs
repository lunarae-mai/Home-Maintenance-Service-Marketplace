using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

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
        private readonly IWebHostEnvironment _webHostEnvironment;

        public UserController(
            IProfileManagementService profileManagementService,
            ICurrentUserService currentUserService,
            IWebHostEnvironment webHostEnvironment)
        {
            _profileManagementService = profileManagementService;
            _currentUserService = currentUserService;
            _webHostEnvironment = webHostEnvironment;
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

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

                if (result == null)
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
                    Message = "Profile updated successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPut("me/admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateAdminProfile([FromBody] UpdateProfileDto dto)
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

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var result = await _profileManagementService.UpdateProfileAsync(userId, dto);

                if (result == null)
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
                    Message = "Admin profile updated successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("me/admin/avatar")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UploadAdminProfileImage([FromForm] IFormFile? image)
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

            if (image == null || image.Length == 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Please select an image to upload."
                });
            }

            if (image.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Image size must not exceed 5 MB."
                });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unsupported image format. Use JPG, JPEG, PNG, or WEBP."
                });
            }

            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "profile-images");
            Directory.CreateDirectory(uploadsFolder);

            var currentProfile = await _profileManagementService.GetProfileAsync(userId);
            var oldImagePath = currentProfile?.ProfileImageUrl;
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var relativePath = $"/uploads/profile-images/{fileName}";
            var fullPath = Path.Combine(uploadsFolder, fileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var updatedProfile = await _profileManagementService.UpdateProfileImageAsync(userId, relativePath);

            if (updatedProfile == null)
            {
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Profile image update failed."
                });
            }

            if (!string.IsNullOrWhiteSpace(oldImagePath) && !string.Equals(oldImagePath, relativePath, StringComparison.OrdinalIgnoreCase))
            {
                var oldFullPath = Path.Combine(_webHostEnvironment.WebRootPath, oldImagePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(oldFullPath))
                {
                    System.IO.File.Delete(oldFullPath);
                }
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Profile image updated successfully.",
                Data = updatedProfile
            });
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

            await _profileManagementService.ChangePasswordAsync(userId, dto);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Password updated successfully."
            });
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