using Eduverse.Model.Entities;
using Eduverse.Repository.UserRoleRepository;
using Eduverse.Service.Common;
using Eduverse.Service.TienDoHocTapService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.UserRoleService
{
    public class UserRoleService : Service<UserRole>, IUserRoleService
    {
        public UserRoleService(IUserRoleRepository userRoleRepository ) : base(userRoleRepository)
        {

        }
    }
}
