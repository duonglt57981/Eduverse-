using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DapAnRepositoryRepository
{
    public class DapAnRepository : Repository<Model.Entities.DapAn>, IDapAnRepository
    {
        public DapAnRepository(EduverseContext context) : base(context)
        {
        }
    }
}
