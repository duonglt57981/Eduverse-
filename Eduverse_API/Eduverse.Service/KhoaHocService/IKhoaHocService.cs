using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KhoaHocService
{
    public interface IKhoaHocService : IService<KhoaHoc>
    {
        Task<PagedList<KhoaHocDto>> GetListDetail(KhoaHocSearch search);

        Task<KhoaHocDetailDto> GetDto(Guid id);


    }
}
