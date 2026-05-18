using Eduverse.IRepository.DapAn_NguoiDung;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DapAn_NguoiDungService
{
    public class DapAn_NguoiDungService : Service<Model.Entities.DapAn_NguoiDung>, IDapAn_NguoiDungService
    {
        public DapAn_NguoiDungService(IDapAn_NguoiDungRepository dapAn_NguoiDungRepository) : base(dapAn_NguoiDungRepository)
        {
        }
    }
}
