namespace HomeServicesPlatform.Application.DTOs.Provider
{
    public class ProviderSearchResultDto
    {
        public int ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public int Experience { get; set; }
        public decimal AvgRating { get; set; }
        public decimal BasePrice { get; set; }
        public string PriceType { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
    }
}