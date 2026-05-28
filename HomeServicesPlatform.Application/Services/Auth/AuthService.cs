using System;
using System.Collections.Generic;
using System.Text;

using HomeServicesPlatform.Application.DTOs.Auth;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Application.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IAppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(
            IAppDbContext context,
            IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ---------------- REGISTER ----------------
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var users = await _context.ApplicationUsers.ToListAsync();
            var existingUser = users.FirstOrDefault(x => x.Email == dto.Email);

            if (existingUser != null)
                throw new Exception("User already exists");

            var user = new ApplicationUser
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = dto.Role
            };

            // PASSWORD HASHING (IMPORTANT)
            var hasher = new PasswordHasher<ApplicationUser>();
            user.PasswordHash = hasher.HashPassword(user, dto.Password);

            _context.ApplicationUsers.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role
            };
        }

        // ---------------- LOGIN ----------------
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var users = await _context.ApplicationUsers.ToListAsync();

            var user = users.FirstOrDefault(x => x.Email == dto.Email);

            if (user == null)
                throw new Exception("Invalid email or password");

            var hasher = new PasswordHasher<ApplicationUser>();

            var result = hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

            if (result == PasswordVerificationResult.Failed)
                throw new Exception("Invalid email or password");

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role
            };
        }

        // ---------------- JWT GENERATION ----------------
        private string GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["JWT:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JWT:Issuer"],
                audience: _config["JWT:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}