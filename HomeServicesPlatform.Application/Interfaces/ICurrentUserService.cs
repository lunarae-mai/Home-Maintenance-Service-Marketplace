using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface ICurrentUserService
    {
        // Holds the unique identifier of the authenticated user
        string? UserId { get; }

        // Holds the role of the authenticated user 
        string? Role { get; }
    }
}
