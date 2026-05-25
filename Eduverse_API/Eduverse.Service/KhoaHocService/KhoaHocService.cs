using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        public KhoaHocService(IKhoaHocRepository khoaHocRepository) : base(khoaHocRepository)
        {
        }
    }
}
