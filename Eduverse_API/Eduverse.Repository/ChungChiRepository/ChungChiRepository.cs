using Eduverse.Model;
using Eduverse.IRepository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.ChungChi
{
    public class ChungChiRepository : Repository<Model.Entities.ChungChi>, IChungChiRepository
    {
        public ChungChiRepository(EduverseContext context) : base(context)
        {
        }
    }
}
