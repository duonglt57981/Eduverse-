using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IPhanService _phanService;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDangKyKhoaHocService _dangKyKhoaHocService;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;

        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository,
            IPhanService phanService,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IDangKyKhoaHocService dangKyKhoaHocService,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            IDanhMucRepository danhMucRepository,
        IMapper mapper
        ) : base(khoaHocRepository)
        {
            _phanService = phanService;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _dangKyKhoaHocService = dangKyKhoaHocService;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _danhMucRepository = danhMucRepository;
        }

        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            try
            {
                var query =
                    from kh in GetQueryable()

                    select new KhoaHocDto
                    {
                        Id = kh.Id,
                        TieuDe = kh.TieuDe,
                        MoTa = kh.MoTa,
                        Gia = kh.Gia,
                        GiaGoc = kh.GiaGoc,
                        LoaiKhoaHoc = kh.LoaiKhoaHoc,
                        HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                        URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,
                        CapDo = kh.CapDo,
                        TrangThaiPheDuyet = kh.TrangThaiPheDuyet,
                        TrangThai = kh.TrangThai,
                        NgayTao = kh.NgayTao,


                        TongBaiGiang = (from bg in _baiGiangService.GetQueryable()
                                       join ph in _phanService.GetQueryable() on bg .IdPhan equals ph.Id
                                       where ph.IdKhoaHoc == kh.Id
                                       select bg).Count(),


                        TongThoiLuong = (from bg in _baiGiangService.GetQueryable()
                                        join ph in _phanService.GetQueryable() on bg.IdPhan equals ph.Id
                                        where ph.IdKhoaHoc == kh.Id
                                        select bg.ThoiLuong).Sum(),


                        SoLuongHocVien = _dangKyKhoaHocService
                            .GetQueryable()
                            .Count(dk =>dk.IdDangKi == kh.Id)
                    };

                if (search != null)
                {
                    if (!string.IsNullOrWhiteSpace(search.Keyword))
                    {
                        query = query.Where(x =>
                            x.TieuDe.Contains(search.Keyword) ||
                            x.LoaiKhoaHoc.Contains(search.Keyword));
                    }

                    if (!string.IsNullOrWhiteSpace(search.TieuDe))
                    {
                        query = query.Where(x =>
                            x.TieuDe.Contains(search.TieuDe));
                    }

                    if (!string.IsNullOrWhiteSpace(search.CapDo))
                    {
                        query = query.Where(x =>
                            x.CapDo == search.CapDo);
                    }

                    if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
                    {
                        query = query.Where(x =>
                            x.LoaiKhoaHoc == search.LoaiKhoaHoc);
                    }

                    if (!string.IsNullOrWhiteSpace(search.TrangThai))
                    {
                        query = query.Where(x =>
                            x.TrangThai == search.TrangThai);
                    }

                    if (search.GiaFrom.HasValue)
                    {
                        query = query.Where(x =>
                            x.Gia >= search.GiaFrom.Value);
                    }

                    if (search.GiaTo.HasValue)
                    {
                        query = query.Where(x =>
                            x.Gia <= search.GiaTo.Value);
                    }

                    if (search.IsFree == true)
                    {
                        query = query.Where(x => x.Gia == 0);
                    }

                    // Sort giá
                    if (!string.IsNullOrWhiteSpace(search.SortPrice))
                    {
                        query = search.SortPrice.ToLower() switch
                        {
                            "asc" => query.OrderBy(x => x.Gia),

                            "desc" => query.OrderByDescending(x => x.Gia),

                            _ => query.OrderByDescending(x => x.NgayTao)
                        };
                    }
                    else
                    {
                        query = query.OrderByDescending(x => x.NgayTao);
                    }
                }

                return await PagedList<KhoaHocDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<KhoaHocDto> GetLearning(Guid idKhoaHoc, Guid idNguoiDung)
        {
            try
            {
                var dangKy = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>x.IdDangKi == idKhoaHoc &&x.IdNguoiDangKi == idNguoiDung);

                if (dangKy == null)
                    throw new Exception("Người dùng chưa đăng ký khóa học này");

                var khoaHoc = await (
                    from kh in GetQueryable().AsNoTracking()
                    where kh.Id == idKhoaHoc
                    select new KhoaHocDto
                    {
                        Id = kh.Id,
                        TieuDe = kh.TieuDe,
                        MoTa = kh.MoTa,
                        HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,

                        DanhSachPhanHoc = (
                            from ph in _phanService.GetQueryable().AsNoTracking()
                            where ph.IdKhoaHoc == kh.Id
                            orderby ph.ThuTuSapXep
                            select new PhanHocDto
                            {
                                Id = ph.Id,
                                IdKhoaHoc = ph.IdKhoaHoc,
                                TenPhan = ph.TenPhan,
                                MieuTa = ph.MieuTa,
                                ThuTuSapXep = ph.ThuTuSapXep,

                                DanhSachBaiGiang = (
                                    from bg in _baiGiangService.GetQueryable().AsNoTracking()
                                    where bg.IdPhan == ph.Id
                                    orderby bg.ThuTuSapXep
                                    select new BaiGiangDto
                                    {
                                        Id = bg.Id,
                                        IdPhan = bg.IdPhan,

                                        TieuDe = bg.TieuDe,
                                        LoaiBaiGiang = bg.LoaiBaiGiang,

                                        IdVideoBaiGiang = bg.IdVideoBaiGiang,
                                        URLBaiGiang = bg.URLBaiGiang,

                                        ThuTuSapXep = bg.ThuTuSapXep,
                                        ThoiLuong = bg.ThoiLuong,

                                        LaBaiGiangFree = bg.LaBaiGiangFree,

                                        DanhSachTaiLieu = (
                                            from tl in _taiLieuService.GetQueryable().AsNoTracking()
                                            where tl.IdBaiGiang == bg.Id
                                            select new TaiLieuDto
                                            {
                                                Id = tl.Id,
                                                IdBaiGiang = tl.IdBaiGiang,

                                                TenTaiLieu = tl.TenTaiLieu,
                                                LoaiTaiLieu = tl.LoaiTaiLieu,
                                                URL = tl.URL
                                            }
                                        ).ToList()
                                    }
                                ).ToList()
                            }
                        ).ToList()
                    }
                ).FirstOrDefaultAsync();

                if (khoaHoc == null)throw new Exception("Không tìm thấy khóa học");

                khoaHoc.SoLuongHocVien = await _dangKyKhoaHocService.Where(x => x.IdDangKi == idKhoaHoc).CountAsync();
                    
                khoaHoc.TongBaiGiang = khoaHoc.DanhSachPhanHoc.Sum(x => x.DanhSachBaiGiang.Count);

                khoaHoc.TongThoiLuong = khoaHoc.DanhSachPhanHoc.Sum(x => x.DanhSachBaiGiang.Sum(bg => bg.ThoiLuong ?? 0));

                return khoaHoc;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.TieuDe))
                    throw new Exception("Tên khóa học không được để trống");

                if (request.DanhSachDanhMuc == null || !request.DanhSachDanhMuc.Any())
                    throw new Exception("Vui lòng chọn danh mục");

                if (request.Gia < 0)
                    throw new Exception("Giá không hợp lệ");

                if (request.GiaGoc < request.Gia)
                    throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");


                var listDM =  _danhMucRepository.GetQueryable();
                var listDMChon = request.DanhSachDanhMuc;
                foreach(var item in listDMChon)
                {
                    if ((await listDM.FirstAsync(x => x.Id == item)) == null)
                    {
                        throw new Exception($"danh mục {item} không tồn tại");
                    }
                }


                var upLoadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Img);

                var khoaHoc = new KhoaHoc
                {
                    TieuDe = request.TieuDe,
                    MoTa = request.MoTa,
                    GiaGoc= request.GiaGoc,
                    Gia = request.Gia,
                    LoaiKhoaHoc = request.Gia == null ? "Khóa học miễn phí": "Khóa học trả phí",
                    HinhAnhKhoaHoc = upLoadResult.UrlImg,
                };
                await CreateAsync(khoaHoc);


                var khoaHocDanhMucs = request.DanhSachDanhMuc
                    .Distinct()
                    .Select(danhMucId => new DanhMuc_KhoaHocDto
                    {
                        IdKhoaHoc = khoaHoc.Id,
                        IdDanhMuc = danhMucId
                    }).ToList();

                await _danhMuc_KhoaHocService.CreateRange(khoaHocDanhMucs);
                return _mapper.Map<KhoaHoc,KhoaHocDto>(khoaHoc);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request)
        {
            try
            {
                var entity = await GetByIdAsync(request.Id);
                if (entity == null || entity.IsDeleted)
                    throw new Exception("Không tìm thấy khóa học");

                if (string.IsNullOrWhiteSpace(request.TieuDe))
                    throw new Exception("Tên khóa học không được để trống");

                if (request.Gia < 0)
                    throw new Exception("Giá không hợp lệ");

                if (request.GiaGoc < request.Gia)
                    throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

                if (request.Img != null)
                {
                    var oldHinhAnh = entity.HinhAnhKhoaHoc;

                    var uploadResult = await _cloudinaryService.UploadImageAsync(request.Img);
                    entity.HinhAnhKhoaHoc = uploadResult.UrlImg;

                    if (!string.IsNullOrEmpty(oldHinhAnh))
                        await _cloudinaryService.DeleteImageAsync(oldHinhAnh);
                }
                else
                {
                    entity.HinhAnhKhoaHoc = entity.HinhAnhKhoaHoc;
                }

                entity.TieuDe = request.TieuDe;
                entity.MoTa = request.MoTa;
                entity.Gia = request.Gia;
                entity.GiaGoc = request.GiaGoc;
                entity.LoaiKhoaHoc = request.Gia == null ? "Khóa học miễn phí" : "Khóa học trả phí";

                await UpdateAsync(entity);

                // Xử lý danh mục
                var danhMucCu = await _danhMuc_KhoaHocService
                    .GetQueryable()
                    .Where(x => x.IdKhoaHoc == entity.Id && !x.IsDeleted)
                    .ToListAsync();

                var danhMucMoi = request.DanhSachDanhMuc ?? new List<Guid>();

                // Xóa danh mục không còn trong danh sách mới
                var danhMucCanXoa = danhMucCu
                    .Where(x => !danhMucMoi.Contains(x.IdDanhMuc.Value))
                    .ToList();

                foreach (var item in danhMucCanXoa)
                {
                    item.IsDeleted = true;
                    item.DeletedDate = DateTime.UtcNow;
                    await _danhMuc_KhoaHocService.UpdateAsync(item);
                }

                // Thêm danh mục mới chưa có
                var danhMucCuIds = danhMucCu.Select(x => x.IdDanhMuc).ToList();

                var danhMucCanThem = danhMucMoi
                    .Where(x => !danhMucCuIds.Contains(x))
                    .Distinct()
                    .ToList();

                foreach (var idDanhMuc in danhMucCanThem)
                {
                    await _danhMuc_KhoaHocService.CreateAsync(new DanhMuc_KhoaHoc
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = entity.Id,
                        IdDanhMuc = idDanhMuc,
                        CreatedDate = DateTime.UtcNow,
                        IsDeleted = false
                    });
                }

                await SaveAsync();
                return _mapper.Map<KhoaHoc, KhoaHocDto>(entity);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<bool> DeleteKhoaHoc(Guid id)
        {
            try
            {
                var khoaHoc = await GetByIdAsync(id);
                    

                if (khoaHoc == null)
                    throw new Exception("Không tìm thấy khóa học");

                var phanHocs = await _phanService
                    .GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHoc.Id)
                    .ToListAsync();
                await _phanService.DeleteAsync(phanHocs);


                var phanHocIds = phanHocs.Select(x => x.Id).ToList();
                var baiGiangs = await _baiGiangService
                    .GetQueryable()
                    .Where(x => phanHocIds.Contains(x.IdPhan.Value))
                    .ToListAsync();
                await _baiGiangService.DeleteAsync(baiGiangs);


                var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();
                var taiLieus = await _taiLieuService
                    .GetQueryable()
                    .Where(x => baiGiangIds.Contains(x.IdBaiGiang.Value))
                    .ToListAsync();
                await _taiLieuService.DeleteAsync(taiLieus);


                await DeleteAsync(khoaHoc);
                await SaveAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
