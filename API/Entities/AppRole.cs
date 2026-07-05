using System.Collections.Generic;

namespace API.Entities
{
    public class AppRole
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
    }
}
