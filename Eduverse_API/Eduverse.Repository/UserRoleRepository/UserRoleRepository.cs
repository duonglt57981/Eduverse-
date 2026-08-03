using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Repository.TienDoHocTapRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.UserRoleRepository
{
    public class UserRoleRepository : Repository<Model.Entities.UserRole>, IUserRoleRepository
    {
        public UserRoleRepository(EduverseContext context) : base(context)
        { }
    }
}
