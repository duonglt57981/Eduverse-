using Eduverse.IRepository.Common;
using Eduverse.Model;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.VaiTro_NguoiDungRepository
{
    public class VaiTro_NguoiDungRepository : Repository<VaiTro_NguoiDung>, IVaiTro_NguoiDungRepository
    {
        public VaiTro_NguoiDungRepository(EduverseContext context) : base(context)
        {
        }
        }
}
