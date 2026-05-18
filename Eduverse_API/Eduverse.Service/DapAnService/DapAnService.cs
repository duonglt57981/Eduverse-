using Eduverse.IRepository.DapAn;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DapAnService
{
    public class DapAnService : Service<Model.Entities.DapAn>, IDapAnService
    {
        public DapAnService(IDapAnRepository dapAnRepository) : base(dapAnRepository)
        {
        }
    }
}
