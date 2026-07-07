using HomeServicesPlatform.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto);
    }
}
