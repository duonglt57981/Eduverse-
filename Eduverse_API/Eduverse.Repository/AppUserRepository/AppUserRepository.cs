using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.Common;

namespace Eduverse.Repository.AppUserRepository
{
    public class AppUserRepository : Repository<Model.Entities.AppUser>, IAppUserRepository
    {
        public AppUserRepository(Model.EduverseContext context) : base(context)
        {
        }
    }
}
