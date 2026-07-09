using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
    }
}
