using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DapAn_NguoiDungRepository
{
    public class DapAn_NguoiDungRepository : Repository<Model.Entities.DapAn_NguoiDung>, IDapAn_NguoiDungRepository
    {
        public DapAn_NguoiDungRepository(EduverseContext context) : base(context)
        {
        }
    }
}
