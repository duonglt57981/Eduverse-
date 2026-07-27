using AutoMapper;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


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
        private readonly IBaiKiemTraRepository _baiKiemTraRepository;
        
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
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IBaiKiemTraRepository baiKiemTraRepository
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
            _baiKiemTraRepository = baiKiemTraRepository;
            this._httpContextAccessor = httpContextAccessor;
        }

        public async Task<GetToUpdatePhanDto> GetToUpdatePhan(Guid IdPhan)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var nguoiTao);

            var Phan = await GetQueryable()
                .Where(x => x.Id == IdPhan
                         && !x.IsDeleted
                         && x.CreatedId == nguoiTao)
                .Select(x => new GetToUpdatePhanDto
                {
                   Id = x.Id,
                   TenPhan = x.TenPhan,
                   MieuTa = x.MieuTa,
                   ThuTuSapXep = x.ThuTuSapXep
                  
                })
                .FirstOrDefaultAsync();

            if (Phan == null)
                throw new Exception("Không tìm thấy phần học hoặc bạn không có quyền.");

            return Phan;
        }


        public async Task<List<PhanHocDto>> GetListForManager(Guid IdKhoaHoc)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }

            var query = GetAll()
                .Where(x => x.CreatedId == userId
                            && x.IdKhoaHoc == IdKhoaHoc
                            && x.IsDeleted == false)
                .AsNoTracking() 
                .OrderBy(x => x.ThuTuSapXep ?? 0) 
                .Select(x => new PhanHocDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdKhoaHoc, 
                    TenPhan = x.TenPhan,
                    TrangThai = x.TrangThai,
                    ThuTuSapXep = x.ThuTuSapXep,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    IsBanHienTai = x.IsBanHienTai,
                    IdBanGhiTruoc = x.IdBanGhiTruoc
                });

            return await query.ToListAsync();
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


            var content = $"{request.TenPhan} {request.MieuTa}";
            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(content);


            var entity = new Phan
            {
                Id = new Guid(),
                IdKhoaHoc = request.IdKhoaHoc,
                TenPhan = request.TenPhan.Trim(),
                MieuTa = request.MieuTa,
                ThuTuSapXep = request.ThuTuSapXep,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua"

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

            //var khoaHocExists = await _khoaHocRepository
            //    .GetQueryable()
            //    .AnyAsync(x => x.Id == request.IdKhoaHoc);

            //if (!khoaHocExists)
            //    throw new Exception("Không tìm thấy khóa học");

            var entity = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted);

            if (entity == null)
                throw new Exception("Không tìm thấy phần học");

            if (entity.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa phần học này!");

            if (entity.TrangThaiPheDuyet == "DaDuyet")
                throw new Exception("Khóa học đang ở chế độ Đã Duyệt không thể sửa");

            //var thuTuDaTon = await GetQueryable()
            //    .AnyAsync(x =>
            //        x.IdKhoaHoc == request.IdKhoaHoc &&
            //        x.ThuTuSapXep == request.ThuTuSapXep &&
            //        x.Id != request.Id && !x.IsDeleted);

            //if (thuTuDaTon)
            //    throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại trong phần học này");

            var content = $"{request.TenPhan} {request.MieuTa}";
            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(content);

            
            entity.TenPhan = request.TenPhan.Trim();
            entity.ThuTuSapXep = request.ThuTuSapXep;
            entity.TrangThai = "DangSua";
            entity.TrangThaiPheDuyet = "DangSua";

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

            if (phan.TrangThaiPheDuyet == "ChoDuyet" || phan.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception("Đang gửi duyệt không thể xóa");


            var coNguoiHoc = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == phan.IdKhoaHoc);

            phan.TrangThai = coNguoiHoc == false ? "DaXoa" : "NgungHoatDong";// nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                       //nếu isdele = true + HoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(phan);
            await SaveAsync();
            return true;


        }


        public async Task UpdateStructure(UpdateCourseStructureRequest request)
        {
            var phans = await
                GetQueryable()
                .Where(x =>
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.IsBanHienTai)
                .ToListAsync();

            var phanIds = phans.Select(x => x.Id).ToList();

            var baiGiangs = await _baiGiangService
                .GetQueryable()
                .Where(x =>
                    x.IsBanHienTai &&
                    phanIds.Contains(x.IdPhan))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository
                .GetQueryable()
                .Where(x =>
                    x.IsBanHienTai &&
                    x.IdPhan.HasValue &&
                    phanIds.Contains(x.IdPhan.Value))
                .ToListAsync();

            var phanDict = phans.ToDictionary(x => x.Id);
            var baiGiangDict = baiGiangs.ToDictionary(x => x.Id);
            var baiKiemTraDict = baiKiemTras.ToDictionary(x => x.Id);

            foreach (var section in request.Sections)
            {
                if (!phanDict.TryGetValue(section.IdPhan, out var phan))
                    continue;

                phan.ThuTuSapXep = section.ThuTuSapXep;

                foreach (var item in section.Items)
                {
                    if (item.Loai == "BaiGiang")
                    {
                        if (!baiGiangDict.TryGetValue(item.Id, out var baiGiang))
                            continue;

                        baiGiang.IdPhan = section.IdPhan;

                        baiGiang.ThuTuSapXep = item.ThuTuSapXep;
                    }
                    else if (item.Loai == "BaiKiemTra")
                    {
                        if (!baiKiemTraDict.TryGetValue(item.Id, out var baiKiemTra))
                            continue;

                        baiKiemTra.IdPhan = section.IdPhan;

                        baiKiemTra.ThuTuSapXep = item.ThuTuSapXep;
                    }
                }
            }

            await SaveAsync();
        }
    }
}
