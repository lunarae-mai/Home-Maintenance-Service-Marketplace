using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Review
{
    public class CreateReviewDto
    {
        public int BookingId { get; set; }

        // Rating from 1 to 5
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }
}
