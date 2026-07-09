namespace HomeServicesPlatform.Application.DTOs.Provider
{
    public class ProviderFilterDto
    {
        public int ServiceId { get; set; }       // required

        public decimal? MinRating { get; set; }  
        public string? PriceType { get; set; }   // optional — e.g. "Fixed" or "Hourly"

        public int Page { get; set; } = 1;       // which page (default: first page)
        public int PageSize { get; set; } = 10;  // how many results per page (default: 10)
    }
}