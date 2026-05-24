using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using Eduverse.Repository.RoleRopository;
namespace Eduverse.IService.RoleService
{
    public class RoleService : Service<Role>, IRoleService
    {
        public RoleService(IRoleRepository roleRepository) : base(roleRepository)
        {
        }

    }
}
