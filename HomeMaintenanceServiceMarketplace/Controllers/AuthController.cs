using HomeServicesPlatform.Application.DTOs.Auth;
using HomeServicesPlatform.Application.DTOs.Common;

using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AuthController : ControllerBase
    {/// <summary>
/// Provides endpoints for user authentication and account management.
/// </summary>

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
/// <summary>
/// Registers a new user account.
/// </summary>
/// <param name="request">The user registration information.</param>
/// <returns>Returns the created user details if registration is successful.</returns>
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
/// <summary>
/// Registers a new user account.
/// </summary>
/// <param name="request">The user registration information.</param>
/// <returns>Returns the created user details if registration is successful.</returns>
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
           
            return Created(string.Empty, new ApiResponse<object>
            {
                Success = true,
                Message = "User registered successfully.",
                Data = result
            });
        }
/// <summary>
/// Authenticates a user and returns a JWT access token.
/// </summary>
/// <param name="request">The user's login credentials.</param>
/// <returns>A JWT token for authenticated access.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
/// <summary>
/// Authenticates a user and returns a JWT access token.
/// </summary>
/// <param name="request">The user's login credentials.</param>
/// <returns>A JWT token for authenticated access.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
           return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Login successful.",
                Data = result
            });
        }
/// <summary>
/// Refreshes an expired JWT access token using a valid refresh token.
/// </summary>
/// <param name="dto">The refresh token request.</param>
/// <returns>A new JWT access token.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Token refreshed successfully.",
                Data = result
            });
        }

    }
}