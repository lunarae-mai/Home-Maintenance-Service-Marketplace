using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Provider
{
    public class UpdateProviderServiceDto
    {
        public decimal BasePrice { get; set; }
        public string? PriceType { get; set; }
    }
}
