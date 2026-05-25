using Eduverse.Repository.AppUserRepository;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.AppUserService
{
    public class AppUserService : Service<Model.Entities.AppUser>, IAppUserService
    {
        public AppUserService(IAppUserRepository appUserRepository) : base(appUserRepository)
        {
        }
    }
}
