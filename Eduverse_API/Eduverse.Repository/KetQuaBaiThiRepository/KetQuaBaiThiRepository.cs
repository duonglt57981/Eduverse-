using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.KetQuaBaiThiRepository
{
    public class KetQuaBaiThiRepository : Repository<Model.Entities.KetQuaBaiThi>, IKetQuaBaiThiRepository
    {
        public KetQuaBaiThiRepository(EduverseContext context) : base(context)
        {
        }
    }

}