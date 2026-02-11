using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class UserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
        public string KnownAs { get; set; } = string.Empty;
    }
}