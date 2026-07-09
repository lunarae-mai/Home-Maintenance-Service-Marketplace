using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Domain.Common
{
    public class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
