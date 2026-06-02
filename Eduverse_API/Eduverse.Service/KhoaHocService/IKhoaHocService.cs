using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService
{
    public interface IKhoaHocService : IService<KhoaHoc>
    {
        Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search, Guid userId);

        Task<PagedList<KhoaHocDto>> GetListDangKi(KhoaHocDangKiSearch search, Guid userId);

        Task<KhoaHocDto> GetLearning(Guid idDangKy);

        Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request);

        Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request);

        Task<bool> DeleteKhoaHoc(Guid id);


    }
}
