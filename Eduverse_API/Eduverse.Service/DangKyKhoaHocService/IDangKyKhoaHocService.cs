using Eduverse.Service.Common;
using Eduverse.Service.DangKyKhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService
{
    public interface IDangKyKhoaHocService : IService<Model.Entities.DangKyKhoaHoc>
    {
        Task<DangKyKhoaHocMienPhiDto> DangKyKhoaHocMienPhi(Guid idKhoaHoc);
        Task<Model.Entities.DangKyKhoaHoc?> GetByKhoaHocAndUser(Guid idKhoaHoc, Guid userId);

        Task ExpireDangKyKhoaHocAsync();
    }
}

