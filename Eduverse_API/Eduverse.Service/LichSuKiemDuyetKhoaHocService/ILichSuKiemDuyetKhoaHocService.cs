using Eduverse.Service.Common;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public interface ILichSuKiemDuyetKhoaHocService : IService<Model.Entities.LichSuKiemDuyetKhoaHoc>
    {
        Task<PagedList<GetListKiemDuyetDto>> GetListKhoaHocKiemDuyet(KhoaHocKiemDuyetSearchDto search);
        //Task<KiemDuyetDetailDto> GetDetailKhoaHocKiemDuyet(Guid idKhoaHoc);
        Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request);
        Task<List<LichSuKiemDuyetDto>> GetLichSuKiemDuyet(Guid idKhoaHoc);


        Task KiemTraVaNemExceptionAsync(string noiDung);
    }
}
