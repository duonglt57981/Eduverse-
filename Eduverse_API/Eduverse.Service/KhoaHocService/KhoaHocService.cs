using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository,
            IPhanService phanService,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IDangKyKhoaHocService dangKyKhoaHocService,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IHttpContextAccessor httpContextAccessor,
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
                            x.MoTa.Contains(search.Keyword));
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
                var dangKy = await _dangKyKhoaHocService.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdDangKi == idKhoaHoc && x.IdNguoiDangKi == idNguoiDung);
                if (dangKy == null) throw new Exception("Người dùng chưa đăng ký khóa học này");


                var khoaHoc = await (from kh in GetQueryable()
                                     where kh.Id == idKhoaHoc
                                     select new KhoaHocDto
                                     {
                                         Id = kh.Id,
                                         TieuDe = kh.TieuDe,
                                         MoTa = kh.MoTa,
                                         HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                                         DanhSachPhanHoc = (
                                         from ph in _phanService.GetQueryable()
                                         where ph.IdKhoaHoc == kh.Id
                                         orderby ph.ThuTuSapXep
                                         select new PhanHocDto
                                         {
                                             Id = ph.Id,
                                             TenPhan = ph.TenPhan,
                                             MieuTa = ph.MieuTa,
                                             ThuTuSapXep = ph.ThuTuSapXep,

                                             DanhSachBaiGiang = (
                                             from bg in _baiGiangService.GetQueryable()
                                             where bg.IdPhan == ph.Id
                                             orderby bg.ThuTuSapXep
                                             select new BaiGiangDto
                                             {
                                                 Id = bg.Id,
                                                 TieuDe = bg.TieuDe,
                                                 IdVideoBaiGiang = bg.IdVideoBaiGiang,
                                                 URLBaiGiang = bg.URLBaiGiang,
                                                 ThuTuSapXep = bg.ThuTuSapXep,
                                                 ThoiLuong = bg.ThoiLuong,
                                                 LaBaiGiangFree = false,

                                                 DanhSachTaiLieu = (
                                                 from tl in _taiLieuService.GetQueryable()
                                                 where tl.IdBaiGiang == bg.Id
                                                 select new TaiLieuDto
                                                 {
                                                     LoaiTaiLieu = tl.LoaiTaiLieu,
                                                     TenTaiLieu = tl.TenTaiLieu,
                                                     URL = tl.URL
                                                 }
                                                 ).ToList()
                                             }
                                             ).ToList()
                                         }
                                         ).ToList()

                                     }
                                     ).FirstOrDefaultAsync();

                return khoaHoc;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
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

                var khoaHoc = new KhoaHoc
                {
                    TieuDe = request.TieuDe,
                    MoTa = request.MoTa,
                    GiaGoc= request.GiaGoc,
                    Gia = request.Gia,
                    LoaiKhoaHoc = request.Gia == null ? "Khóa học miễn phí": "Khóa học trả phí",
                    URLViewPreviewKhoaHoc = request.URLViewPreviewKhoaHoc,
                    HinhAnhKhoaHoc = request.HinhAnhKhoaHoc,
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

                if (entity == null || entity.IsDeleted)throw new Exception("Không tìm thấy khóa học");

                if (string.IsNullOrWhiteSpace(request.TieuDe))throw new Exception("Tên khóa học không được để trống");

                if (request.Gia < 0)throw new Exception("Giá không hợp lệ");

                if (request.GiaGoc < request.Gia)throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

                entity.TieuDe = request.TieuDe;
                entity.MoTa = request.MoTa;
                entity.Gia = request.Gia;
                entity.GiaGoc = request.GiaGoc;
                entity.LoaiKhoaHoc = request.Gia == null ? "Khóa học miễn phí" : "Khóa học trả phí";
                entity.HinhAnhKhoaHoc = request.HinhAnhKhoaHoc;
                entity.URLViewPreviewKhoaHoc = request.URLViewPreviewKhoaHoc;

                await UpdateAsync(entity);


                var danhMucCu = await _danhMuc_KhoaHocService
                    .GetQueryable()
                    .Where(x =>
                        x.IdKhoaHoc == entity.Id &&
                        !x.IsDeleted)
                    .ToListAsync();

                var danhMucMoi = request.DanhSachDanhMuc
                    ?? new List<Guid>();

                // Danh mục cần xóa
                var danhMucCanXoa = danhMucCu
                    .Where(x => !danhMucMoi.Contains(x.IdDanhMuc.Value)).ToList();

                foreach (var item in danhMucCanXoa)
                {
                    item.IsDeleted = true;
                    item.DeletedDate = DateTime.UtcNow;
                    //item.DeletedId = userId;

                    await _danhMuc_KhoaHocService.UpdateAsync(item);
                }

                // Id danh mục cũ
                var danhMucCuIds = danhMucCu
                    .Select(x => x.IdDanhMuc)
                    .ToList();

                // Danh mục cần thêm
                var danhMucCanThem = danhMucMoi
                    .Where(x => !danhMucCuIds.Contains(x))
                    .Distinct()
                    .ToList();

                foreach (var idDanhMuc in danhMucCanThem)
                {
                    var khoaHocDanhMuc = new DanhMuc_KhoaHoc
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = entity.Id,
                        IdDanhMuc = idDanhMuc,
                        CreatedDate = DateTime.UtcNow,
                        //CreatedBy = userId,
                        IsDeleted = false
                    };

                    await _danhMuc_KhoaHocService.CreateAsync(khoaHocDanhMuc);
                }

                await SaveAsync();
                return _mapper.Map<KhoaHoc,KhoaHocDto>(entity);
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
