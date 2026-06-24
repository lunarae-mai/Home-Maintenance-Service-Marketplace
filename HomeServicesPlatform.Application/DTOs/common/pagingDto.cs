namespace HomeServicesPlatform.Application.DTOs.Common
{
    public class PagedResultDto<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }   // total matching records in the DB
        public int Page { get; set; }         // current page number
        public int PageSize { get; set; }     // how many per page
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}