using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.DanhMucRepository;

namespace Eduverse.Service.DanhMucService
{
    public class DanhMucService : Service<Model.Entities.DanhMuc>, IDanhMucService
    {
        public DanhMucService(IDanhMucRepository danhMucRepository) : base(danhMucRepository)
        {
        }
    }
}
