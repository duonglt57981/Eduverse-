using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.ChungChiRepository
{
    public class ChungChiRepository : Repository<Model.Entities.ChungChi>, IChungChiRepository
    {
        public ChungChiRepository(EduverseContext context) : base(context)
        {
        }
    }
}
