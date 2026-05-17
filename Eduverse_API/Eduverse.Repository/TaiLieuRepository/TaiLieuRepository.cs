using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.TaiLieu
{
    public class TaiLieuRepository : Repository<Model.Entities.TaiLieu>, ITaiLieuRepository
    {
        public TaiLieuRepository(EduverseContext context) : base(context)
        { }
    }
}
