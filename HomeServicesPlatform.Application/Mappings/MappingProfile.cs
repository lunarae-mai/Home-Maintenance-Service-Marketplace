using AutoMapper;
using HomeServicesPlatform.Application.DTOs.Payment;
using HomeServicesPlatform.Application.DTOs.Review;
using HomeServicesPlatform.Domain.Models;

namespace HomeServicesPlatform.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Payments
            CreateMap<Payment, PaymentDto>().ReverseMap();

            CreateMap<CreatePaymentDto, Payment>();

            // Reviews
            CreateMap<Review, ReviewDto>().ReverseMap();

            CreateMap<CreateReviewDto, Review>();

            CreateMap<UpdateReviewDto, Review>();
        }
    }
}