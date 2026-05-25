using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DapAnService
{
    public class DapAnService : Service<Model.Entities.DapAn>, IDapAnService
    {
        public DapAnService(IDapAnRepository dapAnRepository) : base(dapAnRepository)
        {
        }
    }
}
