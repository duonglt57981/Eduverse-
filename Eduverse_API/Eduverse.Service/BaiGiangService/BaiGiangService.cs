using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.TaiLieuService;
using Microsoft.EntityFrameworkCore;


namespace Eduverse.Service.BaiGiangService
{
    public class BaiGiangService : Service<Model.Entities.BaiGiang>, IBaiGiangService
    {
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IPhanRepository _phanRepository;
        private readonly IMapper _mapper; 
        
        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository,
            ICloudinaryService cloudinaryService,
            ITaiLieuService taiLieuService,
            IPhanRepository phanRepository,
            IMapper mapper) : base(baiGiangRepository)
        {
            _cloudinaryService = cloudinaryService;
            _taiLieuService = taiLieuService;
            _phanRepository = phanRepository;
            _mapper = mapper;
        }


        public async Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.IdPhan == null)
                throw new Exception("Id phần học không hợp lệ");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
            if (phanHoc == null)
                throw new Exception("Không tìm thấy phần học");

            var uploadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)uploadResult.ThoiLuong;

            var maxThuTu = await GetQueryable()
                .Where(x => x.IdPhan == request.IdPhan.Value)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            var entity = new BaiGiang
            {
                IdPhan = request.IdPhan.Value,
                TieuDe = request.TieuDe.Trim(),
                LoaiBaiGiang = request.Video == null ? "Bài giảng tài liệu" : "Bài giảng video",
                IdVideoBaiGiang = uploadResult.IdVideoBaiGiang,
                URLBaiGiang = uploadResult.URLBaiGiang,
                ThuTuSapXep = maxThuTu + 1,
                ThoiLuong = thoiLuongBaiGiang,
                LaBaiGiangFree = request.LaBaiGiangFree,
                TrangThai = "HDI",
                CreatedDate = DateTime.UtcNow
            };

            await CreateAsync(entity);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        //public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        //{
        //    if (request == null)
        //        throw new ArgumentNullException(nameof(request));

        //    if (string.IsNullOrWhiteSpace(request.TieuDe))
        //        throw new Exception("Tên bài giảng không được để trống");

        //    if (request.IdPhan == null)
        //        throw new Exception("Id phần học không hợp lệ");

        //    // Kiểm tra bài giảng cũ còn tồn tại không
        //    var baiGiangCu = await GetByIdAsync(request.Id!.Value);
        //    if (baiGiangCu == null)
        //        throw new Exception("Không tìm thấy bài giảng");

        //    // Không cho phép update nếu bài cũ đang chờ swap khác
        //    if (baiGiangCu.IsPendingSwap)
        //        throw new Exception("Bài giảng này đang có phiên bản cập nhật chờ được duyệt");

        //    var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
        //    if (phanHoc == null)
        //        throw new Exception("Không tìm thấy phần học");

        //    var thuTuDaTon = await GetQueryable()
        //        .AnyAsync(x =>
        //            x.IdPhan == request.IdPhan &&
        //            x.ThuTuSapXep == request.ThuTuSapXep &&
        //            x.Id != request.Id &&
        //            !x.IsDeleted);

        //    if (thuTuDaTon)
        //        throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại");

        //    // ── Tạo bản ghi BaiGiang MỚI ──────────────────────────────────
        //    var baiGiangMoi = new BaiGiang
        //    {
        //        Id = Guid.NewGuid(),
        //        IdPhan = request.IdPhan.Value,
        //        TieuDe = request.TieuDe.Trim(),
        //        ThuTuSapXep = request.ThuTuSapXep,
        //        LaBaiGiangFree = request.LaBaiGiangFree,
        //        TrangThai = "ChoDuyet",   // bài mới chưa active, đợi swap
        //        IsPendingSwap = false,
        //        IdBaiGiangMoi = null
        //    };

        //    if (request.Video != null)
        //    {
        //        // Upload video mới — không động vào video cũ
        //        var (publicId, url, thoiLuong) =
        //            await _cloudinaryService.UploadVideoAsync(request.Video);

        //        baiGiangMoi.IdVideoBaiGiang = publicId;
        //        baiGiangMoi.URLBaiGiang = url;
        //        baiGiangMoi.ThoiLuong = (int)thoiLuong;
        //        baiGiangMoi.LoaiBaiGiang = "Bài giảng video";
        //    }
        //    else
        //    {
        //        // Giữ nguyên video cũ
        //        baiGiangMoi.IdVideoBaiGiang = baiGiangCu.IdVideoBaiGiang;
        //        baiGiangMoi.URLBaiGiang = baiGiangCu.URLBaiGiang;
        //        baiGiangMoi.ThoiLuong = baiGiangCu.ThoiLuong;
        //        baiGiangMoi.LoaiBaiGiang = baiGiangCu.LoaiBaiGiang;
        //    }

        //    await AddAsync(baiGiangMoi);

        //    // ── Đánh dấu bài CŨ đang chờ swap ────────────────────────────
        //    baiGiangCu.IsPendingSwap = true;
        //    baiGiangCu.IdBaiGiangMoi = baiGiangMoi.Id;

        //    await UpdateAsync(baiGiangCu);
        //    await SaveAsync();

        //    return _mapper.Map<BaiGiang, BaiGiangDto>(baiGiangMoi);
        //}


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var baiGiang = await GetByIdAsync(id);
            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            baiGiang.TrangThai = "KDI";

            await DeleteAsync(baiGiang);
            await SaveAsync();
            return true;
        }
    }
}
