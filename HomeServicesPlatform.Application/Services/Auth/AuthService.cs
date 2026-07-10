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
            var existingUser = await _context.ApplicationUsers
                 .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existingUser != null)
                throw new ArgumentException("User already exists");

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

            // Generate and assign refresh token 
            var initialRefreshToken = GenerateRefreshToken();
            user.RefreshToken = initialRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _context.ApplicationUsers.Add(user);
            await _context.SaveChangesAsync();

            var Token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                AccessToken = Token,
                RefreshToken = user.RefreshToken,
                Email = user.Email,
                Role = user.Role
            };
        }

        // ---------------- LOGIN ----------------
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.ApplicationUsers
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            var hasher = new PasswordHasher<ApplicationUser>();

            var result = hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid email or password");

            // Generate and assign refresh token 
            var newRefreshToken = GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); 

            await _context.SaveChangesAsync();

            var Token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                AccessToken = Token,
                RefreshToken = user.RefreshToken, 
                Email = user.Email,
                Role = user.Role
            };
        }


        // ---------------- REFRESH TOKEN LOGIC ----------------
        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.RefreshToken))
                throw new ArgumentException("Invalid client request");

            // 1. Get the user from database who owns this refresh token
            var user = await _context.ApplicationUsers
                .FirstOrDefaultAsync(x => x.RefreshToken == dto.RefreshToken);

            // 2. Validate if user exists
            if (user == null)
                throw new UnauthorizedAccessException("Invalid refresh token");

            // 3. Validate if the refresh token has expired
            if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                throw new UnauthorizedAccessException("Refresh token has expired, please login again");

            // 4. Everything is valid! Generate brand new tokens
            var newAccessToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            // 5. Update the database with the new refresh token and extend its life
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();

            // 6. Return the fresh package to the frontend
            return new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = user.RefreshToken,
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


        // ---------------- REFRESH TOKEN GENERATION ----------------
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        
    }
}