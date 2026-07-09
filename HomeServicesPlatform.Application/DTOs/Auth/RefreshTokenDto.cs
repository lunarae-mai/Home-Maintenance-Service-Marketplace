using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Auth
{
    public class RefreshTokenDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
    }
}
