using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService.Dto;
using Eduverse.Service.DanhGiaService;
using Eduverse.Service.KhoaHocService;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService
{
    public class DangKyKhoaHocService : Service<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocService
    {
        private readonly IKhoaHocService _khoaHocService;
        private readonly IMapper _mapper;
        public DangKyKhoaHocService(
            IDangKyKhoaHocRepository dangKyKhoaHocRepository, 
            IKhoaHocService khoaHocService,
            IMapper mapper) : base(dangKyKhoaHocRepository)
        {
            _khoaHocService = khoaHocService;
            _mapper = mapper;
        }


        public async Task<DangKyKhoaHocMienPhiDto> DangKyKhoaHocMienPhi(Guid idKhoaHoc, Guid userId)
        {
            if (idKhoaHoc == Guid.Empty)
                throw new ArgumentException("Id khóa học không hợp lệ");

            if (userId == Guid.Empty)
                throw new ArgumentException("Id người dùng không hợp lệ");

            var khoaHoc = await _khoaHocService.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc
                                       && !x.IsDeleted
                                       && x.TrangThai == "HoatDong");

            var giaKhoaHoc = await _khoaHocService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
                .Select(x => x.Gia)
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (khoaHoc.Gia > 0)
                throw new Exception("Khóa học này yêu cầu thanh toán");

            var daDangKy = await GetQueryable()
                .AnyAsync(x => x.IdNguoiDangKi == userId
                            && x.IdDangKi == idKhoaHoc
                            && !x.IsDeleted
                            && x.IsDangKy == true);

            if (daDangKy)
                throw new Exception("Bạn đã đăng ký khóa học này");

            var dangKy = new DangKyKhoaHoc
            {
                IdNguoiDangKi = userId,
                IdDangKi = idKhoaHoc,
                GiaDangKy = giaKhoaHoc,
                TrangThai = "HoatDong",
                IsDangKy = true,    
            };

            await CreateAsync(dangKy);
            await SaveAsync();

            return _mapper.Map<DangKyKhoaHoc,DangKyKhoaHocMienPhiDto>(dangKy);
        }
    }
}
