using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Services.ProfileManagement
{
    public class ProfileManagementService : IProfileManagementService
    {
        private readonly IAppDbContext _context;

        public ProfileManagementService(IAppDbContext context)
        {
            _context = context;
        }

        // Function to view the user's profile
        public async Task<UserProfileDto> GetProfileAsync(string userId)
        {
            var user = await _context.ApplicationUsers
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role
            };
        }

        //Function to edit/update the user's profile
        public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _context.ApplicationUsers
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null) return false;

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            user.Email = dto.Email;

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
