using Eduverse.Repository.AppUserRepository;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.AppUser
{
    public class AppUserService : Service<Model.Entities.AppUser>, IAppUserService
    {
        public AppUserService(IAppUserRepository appUserRepository) : base(appUserRepository)
        {
        }
    }
}
