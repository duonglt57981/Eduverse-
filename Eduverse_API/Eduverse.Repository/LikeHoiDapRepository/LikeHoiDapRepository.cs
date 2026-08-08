using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LikeHoiDapRepository
{
    public class LikeHoiDapRepository : Repository<Model.Entities.LikeHoiDap>, ILikeHoiDapRepository
    {
        public LikeHoiDapRepository(EduverseContext context) : base(context)
        {
        }
    }
}
