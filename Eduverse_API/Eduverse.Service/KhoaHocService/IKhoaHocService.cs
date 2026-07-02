using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;

namespace Eduverse.Service.KhoaHocService
{
    public interface IKhoaHocService : IService<KhoaHoc>
    {
        Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search);

        Task<PagedList<KhoaHocDto>> GetListByUser(KhoaHocSearch search);

        Task<PagedList<GetDangKiKhoaHocDto>> GetListDangKi(KhoaHocDangKiSearch search);

        Task<KhoaHocDto> GetKhoaHocPreview(Guid idKhoaHoc);

        Task<KhoaHocDto> GetLearning(Guid idDangKy);

        Task<KhoaHocDto> ChuyenTrangThaiDangSua(Guid IdKhoaHoc);

        Task<KhoaHocDto> ChuyenTrangThaiChoDuyet(Guid IdKhoaHoc);

        Task<GetToUpdateKhoaHoc> GetToUpdateKhoaHoc(Guid IdKhoaHoc);

        Task<PagedList<KhoaHocDto>> GetListForManager(GetListSearch search);

        Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request);

        Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request);

        Task<bool> DeleteKhoaHoc(Guid id);

        //
        Task<double> TinhPhanTramHoanThanh(Guid? idDangKy, DateTime? ngayDangKy = null);
        Task SwapPendingBaiGiang(Guid idDangKy, List<Guid> phanIds);


    }
}
