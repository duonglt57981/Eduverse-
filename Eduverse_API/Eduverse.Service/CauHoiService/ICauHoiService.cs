using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Service.Common;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;

namespace Eduverse.IService.CauHoi
{
    public interface ICauHoiService : IService<Model.Entities.CauHoi>
    {
        public Task<PagedList<CauHoiDto>> GetData(CauHoiSearch search);
    }
}
