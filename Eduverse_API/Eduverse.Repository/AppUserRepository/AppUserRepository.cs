using Eduverse.IRepository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.AppUser
{
    public class AppUserRepository : Repository<Model.Entities.AppUser>, IAppUserRepository
    {
        public AppUserRepository(Model.EduverseContext context) : base(context)
        {
        }
    }
}
