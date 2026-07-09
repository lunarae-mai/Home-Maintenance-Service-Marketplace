using System.Net;
using System.Text.Json;

namespace HomeServicesPlatform.API.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var errorResponse = exception switch
            {
                // Handle specific exception types
                KeyNotFoundException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Message = "Resource not found",
                    Details = exception.Message
                },

                InvalidOperationException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = "Invalid operation",
                    Details = exception.Message
                },

                UnauthorizedAccessException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    Message = "Unauthorized access",
                    Details = exception.Message
                },

                ArgumentException or ArgumentNullException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = "Invalid argument",
                    Details = exception.Message
                },

                // Default handler for unhandled exceptions
                _ => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "An internal server error occurred",
                    Details = "Please contact support if the problem persists"
                }
            };

            context.Response.StatusCode = errorResponse.StatusCode;

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(errorResponse, jsonOptions));
        }
    }

    // Standardized error response model
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
