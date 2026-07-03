using System;
using System.Collections.Generic;
using System.Text;
using HomeServicesPlatform.Application.DTOs.Review;


namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IReviewService
    {
        Task AddReviewAsync(string currentUserId, CreateReviewDto dto);

        Task<IEnumerable<Domain.Models.Review>> GetProviderReviewsAsync(int providerId);

        Task<IEnumerable<Domain.Models.Review>> GetMyReviewsAsync(string currentUserId);
    }
}
