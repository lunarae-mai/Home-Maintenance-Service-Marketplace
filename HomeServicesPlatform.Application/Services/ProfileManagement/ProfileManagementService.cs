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

            // Check if email is already used by another user
            var emailExists = await _context.ApplicationUsers
                .AnyAsync(x => x.Email.ToLower() == dto.Email.ToLower()
                            && x.Id != userId);

            if (emailExists)
                throw new Exception("Email is already in use.");

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            user.Email = dto.Email;

            return await _context.SaveChangesAsync() > 0;
        }


        //Function to change user passwords
        public async Task ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _context.ApplicationUsers
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new Exception("User not found.");

            var hasher = new PasswordHasher<ApplicationUser>();

            // Check the current password
            var verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);

            if (verificationResult == PasswordVerificationResult.Failed)
                throw new Exception("The current password you entered is incorrect.");

            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);

            await _context.SaveChangesAsync();
        }


        //Function for Admin to view all users and optionally filter by role
        public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync(string? role = null)
        {
            var query = _context.ApplicationUsers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(x => x.Role == role);
            }

            return await query
                .Select(user => new UserProfileDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role
                })
                .ToListAsync();
        }

    }
}
