using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Provider
{
    public class RegisterProviderDto
    {
        public string Bio { get; set; } = string.Empty;
        public int Experience { get; set; } 
        
        // list of services and base price`
        public List<ProviderServiceDto> Services { get; set; } = new List<ProviderServiceDto>();
    }
}
