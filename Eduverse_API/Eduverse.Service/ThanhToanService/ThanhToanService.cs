using Eduverse.IService.Common;
using Eduverse.Repository.ThanhToanRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThanhToanService
{
    public class ThanhToanService : Service<Model.Entities.ThanhToan>, IThanhToanService
    {
        public ThanhToanService(IThanhToanRepository thanhToanRepository) : base(thanhToanRepository)
        {
        }
    }
}
