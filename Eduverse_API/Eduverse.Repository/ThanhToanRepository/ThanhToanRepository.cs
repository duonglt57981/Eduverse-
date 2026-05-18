using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.ThanhToan
{
    public class ThanhToanRepository : Repository<Model.Entities.ThanhToan>, IThanhToanRepository
    {
        public ThanhToanRepository(EduverseContext context) : base(context)
        { }
        }
}
