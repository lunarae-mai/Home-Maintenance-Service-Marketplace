using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.UserProfile
{
    public class IdentityResultStatusDto
    {
        public bool Succeeded { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
