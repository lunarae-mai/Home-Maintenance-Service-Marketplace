using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.DTOs.Provider
{
    public class RegisterProviderDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public string Bio { get; set; } = string.Empty;
        public int Experience { get; set; } 
        public string Status { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        
        // list of services and base price`
        public List<ProviderServiceDto> Services { get; set; } = new List<ProviderServiceDto>();
    }
}
