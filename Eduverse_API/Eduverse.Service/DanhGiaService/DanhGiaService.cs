using Eduverse.IRepository.DanhGia;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DanhGiaService
{
    public class DanhGiaService : Service<Model.Entities.DanhGia>, IDanhGiaService
    {
        public DanhGiaService(IDanhGiaRepository danhGiaRepository) : base(danhGiaRepository)
        {
        }
    }
}
