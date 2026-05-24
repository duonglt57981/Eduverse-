using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.KetQuaBaiThiRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KetQuaBaiThiService
{
    public class KetQuaBaiThiService : Service<KetQuaBaiThi>, IKetQuaBaiThiService
    {
        public KetQuaBaiThiService(IKetQuaBaiThiRepository ketQuaBaiThRepository) : base(ketQuaBaiThRepository)
        {
        }
    }
}
