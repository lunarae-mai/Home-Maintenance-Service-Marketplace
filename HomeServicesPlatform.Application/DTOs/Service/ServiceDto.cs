namespace HomeServicesPlatform.Application.DTOs.Service
{
    public class ServiceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }       // minutes
        public string PriceModel { get; set; } = string.Empty;
        public int ServiceCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}