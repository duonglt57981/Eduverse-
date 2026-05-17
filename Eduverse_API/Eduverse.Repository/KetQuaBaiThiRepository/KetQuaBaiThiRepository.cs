using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.KetQuaBaiThi
{
    public class KetQuaBaiThiRepository : Repository<Model.Entities.KetQuaBaiThi>, IKetQuaBaiThiRepository
    {
        public KetQuaBaiThiRepository(EduverseContext context) : base(context)
        {
        }
    }

}