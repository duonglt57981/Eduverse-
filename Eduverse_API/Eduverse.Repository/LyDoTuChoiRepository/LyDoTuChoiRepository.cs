using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LyDoTuChoiRepository
{
    public class LyDoTuChoiRepository : Repository<LyDoTuChoi>, ILyDoTuChoiRepository
    {
        public LyDoTuChoiRepository(EduverseContext context) : base(context)
        { }
    }
}
