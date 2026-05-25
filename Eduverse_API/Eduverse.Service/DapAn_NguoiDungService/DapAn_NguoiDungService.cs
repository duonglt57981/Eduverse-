using Eduverse.Repository.DapAn_NguoiDungRepository;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DapAn_NguoiDungService
{
    public class DapAn_NguoiDungService : Service<Model.Entities.DapAn_NguoiDung>, IDapAn_NguoiDungService
    {
        public DapAn_NguoiDungService(IDapAn_NguoiDungRepository dapAn_NguoiDungRepository) : base(dapAn_NguoiDungRepository)
        {
        }
    }
}
