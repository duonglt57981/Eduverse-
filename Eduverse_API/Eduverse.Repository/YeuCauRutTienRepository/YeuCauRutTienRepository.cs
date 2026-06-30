using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Repository.ThanhToanRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.YeuCauRutTienRepository
{
    public class YeuCauRutTienRepository : Repository<Model.Entities.YeuCauRutTien>, IYeuCauRutTienRepository
    {
        public YeuCauRutTienRepository(EduverseContext context) : base(context)
        { }
    }
}
