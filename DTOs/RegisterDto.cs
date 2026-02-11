using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required] public string KnownAs { get; set; } = string.Empty;
        [Required] public string Gender { get; set; } = string.Empty;
        [Required] public DateOnly? DateOfBirth { get; set; } // optional to make required work!
        [Required] public string City { get; set; } = string.Empty;
        [Required] public string Country { get; set; } = string.Empty;

        [Required]
        [StringLength(8, MinimumLength = 4)]
        public string Password { get; set; } = string.Empty;
    }
}