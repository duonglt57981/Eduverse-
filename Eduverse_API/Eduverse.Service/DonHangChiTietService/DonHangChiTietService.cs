using Eduverse.IService.Common;
using Eduverse.Repository.DonHangChiTietRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DonHangChiTietService
{
    public class DonHangChiTietService : Service<Model.Entities.DonHangChiTiet>, IDonHangChiTietService
    {
        public DonHangChiTietService(IDonHangChiTietRepository donHangChiTietRepository) : base(donHangChiTietRepository)
        {
        }
    }
}
