using HomeServicesPlatform.Application.DTOs.UserProfile;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IProfileManagementService
    {
        Task<UserProfileDto> GetProfileAsync(string userId);
        Task<bool> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    }
}
