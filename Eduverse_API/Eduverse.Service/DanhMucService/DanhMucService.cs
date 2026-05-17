using Eduverse.IRepository.DanhMuc;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DanhMucService
{
    public class DanhMucService : Service<Model.Entities.DanhMuc>, IDanhMucService
    {
        public DanhMucService(IDanhMucRepository danhMucRepository) : base(danhMucRepository)
        {
        }
    }
}
