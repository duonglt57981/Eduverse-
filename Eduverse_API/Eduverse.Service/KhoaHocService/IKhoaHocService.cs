using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Eduverse.Service.KhoaHocService.KhoaHocService;

namespace Eduverse.Service.KhoaHocService
{
    public interface IKhoaHocService : IService<KhoaHoc>
    {
        Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search);

        Task<PagedList<KhoaHocDto>> GetListByUser(KhoaHocSearch search);

        Task<PagedList<GetDangKiKhoaHocDto>> GetListDangKi(KhoaHocDangKiSearch search);

        Task<KhoaHocDto> GetKhoaHocPreview(Guid idKhoaHoc);

        Task<KhoaHocDto> GetLearning(Guid idDangKy);

        Task<List<KhoaHocDto>> ChuyenTrangThaiDangSua(BatchIdsRequest request);

        Task<KhoaHocDto> ChuyenTrangThaiChoDuyet(Guid idKhoaHoc);

        Task<GetToUpdateKhoaHoc> GetToUpdateKhoaHoc(Guid IdKhoaHoc);

        Task<PagedList<KhoaHocDto>> GetListForManager(GetListSearch search);

        Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request);

        Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request);

        Task<KhoaHocDraftResultDto> CreateFullKhoaHocDraft(Guid IdKhoaHoc);

        Task<bool> DeleteKhoaHoc(Guid id);

        //
        Task<double> TinhPhanTramHoanThanh(Guid? idDangKy, DateTime? ngayDangKy = null);
        Task SwapPendingBaiGiang(Guid idDangKy, List<Guid> phanIds);


    }
}
