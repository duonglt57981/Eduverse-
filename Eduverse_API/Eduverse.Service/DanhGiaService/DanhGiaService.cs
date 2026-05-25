using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhGiaService
{
    public class DanhGiaService : Service<Model.Entities.DanhGia>, IDanhGiaService
    {
        public DanhGiaService(IDanhGiaRepository danhGiaRepository) : base(danhGiaRepository)
        {
        }
    }
}
