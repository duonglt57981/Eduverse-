using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.Common;

namespace Eduverse.Repository.RoleRopository
{
    public class RoleRepository : Repository<Model.Entities.Role>, IRoleRepository
    {
        public RoleRepository(Model.EduverseContext context) : base(context)
        {
        }
    }
}
