using AutoMapper;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;


namespace Eduverse.Service.PhanService
{
    public class PhanService : Service<Phan>, IPhanService
    {
        private readonly Service.Core.Mapper.IMapper _mapper;
        private readonly IBaiGiangService _baiGiangService;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IKhoaHocService _khoaHocService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;

        
        public PhanService(
            IPhanRepository phanRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IKhoaHocRepository khoaHocRepository,
            IHttpContextAccessor httpContextAccessor,
            Service.Core.Mapper.IMapper mapper,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            ITienDoHocTapRepository tienDoHocTapRepository,
            IKhoaHocService khoaHocService,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService
            ) : base(phanRepository)
        {
            _mapper = mapper;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _khoaHocRepository = khoaHocRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _tienDoHocTapRepository = tienDoHocTapRepository;
            _khoaHocService = khoaHocService;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            this._httpContextAccessor = httpContextAccessor;
        }

        public async Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request)  
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHoc = await _khoaHocRepository
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdKhoaHoc);

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var maxThuTu = await GetQueryable()
                .Where(x => x.IdKhoaHoc == request.IdKhoaHoc)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;


            //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TenPhan);
            //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.MieuTa);


            var entity = new Phan
            {
                Id = new Guid(),
                IdKhoaHoc = request.IdKhoaHoc,
                TenPhan = request.TenPhan.Trim(),
                MieuTa = request.MieuTa,
                ThuTuSapXep = maxThuTu + 1,
                TrangThai = "HoatDong",
                TrangThaiPheDuyet = "DaDuyet"

            };


            await CreateAsync(entity);
            await SaveAsync();

            return _mapper.Map<Phan,PhanHocDto>(entity);
        }


        public async Task<PhanHocDto> UpdatePhanHoc(UpdatePhanRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            ArgumentNullException.ThrowIfNull(request);

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHocExistsTask = _khoaHocRepository
                .GetQueryable()
                .AnyAsync(x => x.Id == request.IdKhoaHoc);

            var entityTask = GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted);

            await Task.WhenAll(khoaHocExistsTask, entityTask);

            if (!khoaHocExistsTask.Result)
                throw new Exception("Không tìm thấy khóa học");

            var entity = entityTask.Result;
            if (entity.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa phần học này!");

            if (entity == null)
                throw new Exception("Không tìm thấy phần học");

            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.Id &&!x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại trong phần học này");

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TenPhan);
            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.MieuTa);

            entity.IdKhoaHoc = request.IdKhoaHoc;
            entity.TenPhan = request.TenPhan.Trim();
            entity.ThuTuSapXep = request.ThuTuSapXep;
            entity.TrangThai = "HoatDong";
            entity.TrangThaiPheDuyet = "DaDuyet";

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<Phan, PhanHocDto>(entity);
        }


        public async Task<bool> DeletePhanHoc(Guid id)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var phan = await GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (phan.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để xóa phần học này!");
            if (phan == null)
                throw new Exception("Không tim thấy phần học");

            var coNguoiHoc = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == phan.IdKhoaHoc);

            phan.TrangThai = coNguoiHoc == null ? "DaXoa" : "NgungHoatDong";// nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                       //nếu isdele = true + HoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(phan);
            await SaveAsync();
            return true;


        }
    }
}
