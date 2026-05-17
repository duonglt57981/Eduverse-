using Eduverse.IService.Common;
using Eduverse.Repository.ThanhToan;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThanhToanService
{
    public class ThanhToanService : Service<Model.Entities.ThanhToan>, IThanhToanService
    {
        public ThanhToanService(ThanhToanRepository thanhToanRepository) : base(thanhToanRepository)
        {
        }
    }
}
