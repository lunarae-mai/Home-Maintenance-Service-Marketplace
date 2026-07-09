using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.UserProfile
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }
    }
}
