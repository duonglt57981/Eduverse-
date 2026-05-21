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
        Task<PagedList<KhoaHocDto>> GetData(KhoaHocSearch search);

        Task<KhoaHocDto> GetDetail(Guid id);

        Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request);

        Task UpdateKhoaHoc(UpdateKhoaHocRequest request, Guid id);

        Task DeleteKhoaHoc(Guid id);
    }
}
