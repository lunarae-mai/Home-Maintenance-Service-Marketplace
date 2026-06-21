using HomeServicesPlatform.Application.DTOs.UserProfile;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Services.ProfileManagement
{
    public class ProfileManagementService : IProfileManagementService
    {
        private readonly IAppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileManagementService(IAppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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


        //Function to change user passwords
        public async Task<IdentityResultStatusDto> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var response = new IdentityResultStatusDto();

            // Fetch the current user instance from Identity store
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                response.Errors.Add("User record not found within the system context.");
                return response;
            }

            // Perform secure password modification via built-in UserManager logic
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (result.Succeeded)
            {
                response.Succeeded = true;
            }
            else
            {
                response.Errors.AddRange(result.Errors.Select(e => e.Description));
            }

            return response;
        }

    }
}
