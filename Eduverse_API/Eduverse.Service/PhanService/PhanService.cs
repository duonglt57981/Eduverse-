using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.PhanRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.PhanService
{
    public class PhanService : Service<Phan>, IPhanService
    {
        public PhanService(IPhanRepository phanRepository) : base(phanRepository)
        {
        }
    }
}
