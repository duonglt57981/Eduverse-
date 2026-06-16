using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService.Dto;
using Eduverse.Service.DanhGiaService;
using Eduverse.Service.KhoaHocService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService
{
    public class DangKyKhoaHocService : Service<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocService
    {
        //private readonly IKhoaHocService _khoaHocService;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        public DangKyKhoaHocService(
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            //IKhoaHocService khoaHocService,
            IKhoaHocRepository khoaHocRepository,
            IMapper mapper,
            IHttpContextAccessor? httpContextAccessor = null) : base(dangKyKhoaHocRepository)
        {
            //_khoaHocService = khoaHocService;
            _mapper = mapper;
            _khoaHocRepository = khoaHocRepository;
            this._httpContextAccessor = httpContextAccessor;
        }


        public async Task<DangKyKhoaHocMienPhiDto> DangKyKhoaHocMienPhi(Guid idKhoaHoc)
        {
            if (idKhoaHoc == Guid.Empty)
                throw new ArgumentException("Id khóa học không hợp lệ");

            var khoaHoc = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc
                                       && !x.IsDeleted
                                       && x.TrangThai == "HoatDong");

            var giaKhoaHoc = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
                .Select(x => x.Gia)
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (khoaHoc.Gia > 0)
                throw new Exception("Khóa học này yêu cầu thanh toán");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDangKi);

            var daDangKy = await GetQueryable()
                .AnyAsync(x => x.IdNguoiDangKi == idNguoiDangKi
                            && x.IdKhoaHoc == idKhoaHoc
                            && !x.IsDeleted
                            && x.IsDangKy == true);

            if (daDangKy)
                throw new Exception("Bạn đã đăng ký khóa học này");

            var dangKy = new DangKyKhoaHoc
            {
                IdNguoiDangKi = idNguoiDangKi,
                IdKhoaHoc = idKhoaHoc,
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
