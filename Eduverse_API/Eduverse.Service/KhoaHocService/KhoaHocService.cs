using AutoMapper;
using Eduverse.IRepository.BaiGiang;
using Eduverse.IRepository.CauHoi;
using Eduverse.IRepository.DangKyKhoaHoc;
using Eduverse.IRepository.KhoaHocRepository;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.Phan;
using Eduverse.Repository.TaiLieu;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly IMapper _mapper;

        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository, 
            IPhanRepository phanRepository, 
            IBaiGiangRepository baiGiangRepository, 
            ITaiLieuRepository taiLieuRepository, 
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            IMapper mapper
        ) : base(khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository ?? throw new ArgumentNullException(nameof(khoaHocRepository));
            _phanRepository = phanRepository ?? throw new ArgumentNullException(nameof(phanRepository));
            _baiGiangRepository = baiGiangRepository ?? throw new ArgumentNullException(nameof(baiGiangRepository));
            _taiLieuRepository = taiLieuRepository ?? throw new ArgumentNullException(nameof(taiLieuRepository));
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository ?? throw new ArgumentNullException(nameof(danhMuc_KhoaHocRepository));
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository ?? throw new ArgumentNullException(nameof(dangKyKhoaHocRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            try
            {
                var query = from kh in _khoaHocRepository.GetQueryable().AsNoTracking()
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
                                TongThoiLuong = kh.TongThoiLuong,
                                TongBaiGiang = kh.TongBaiGiang,
                                SoLuongHocVien = kh.SoLuongHocVien,
                                TrangThaiPheDuyet = kh.TrangThaiPheDuyet,
                                TrangThai = kh.TrangThai,
                                NgayTao = kh.NgayTao
                            };

                if (search != null)
                {
                    if (!string.IsNullOrWhiteSpace(search.Keyword))
                    {
                        query = query.Where(x =>
                            x.TieuDe!.Contains(search.Keyword) ||
                            x.MoTa!.Contains(search.Keyword));
                    }

                    if (!string.IsNullOrWhiteSpace(search.TieuDe))
                    {
                        query = query.Where(x =>
                            x.TieuDe!.Contains(search.TieuDe));
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

                    // giá từ
                    if (search.GiaFrom.HasValue)
                    {
                        query = query.Where(x =>
                            x.Gia >= search.GiaFrom);
                    }

                    // giá đến
                    if (search.GiaTo.HasValue)
                    {
                        query = query.Where(x =>
                            x.Gia <= search.GiaTo);
                    }

                    if (search.IsFree.HasValue)
                    {
                        if (search.IsFree.Value)
                        {
                            query = query.Where(x => x.Gia == 0);
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(search.SortPrice))
                    {
                        if (search.SortPrice == "asc")
                        {
                            query = query.OrderBy(x => x.Gia);
                        }
                        else if (search.SortPrice == "desc")
                        {
                            query = query.OrderByDescending(x => x.Gia);
                        }
                    }
                    else
                    {
                        query = query.OrderByDescending(x => x.NgayTao);
                    }
                }

                var result = await PagedList<KhoaHocDto>.CreateAsync(query, search);

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy danh sách khóa học: {ex.Message}");
                return null;
            }
        }


        public async Task<KhoaHocDto> GetLearning(Guid idKhoaHoc, Guid idNguoiDung)
        {
            try
            {
                var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdDangKi == idKhoaHoc && x.IdNguoiDangKi == idNguoiDung);
                if(dangKy == null) throw new Exception("Người dùng chưa đăng ký khóa học này");


                var khoaHoc = await (from kh in _khoaHocRepository.GetQueryable()
                                     where kh.Id == idKhoaHoc
                                     select new KhoaHocDto
                                     {
                                         Id = kh.Id,
                                         TieuDe = kh.TieuDe,
                                         MoTa = kh.MoTa,
                                         HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                                         TongBaiGiang = kh.TongBaiGiang,
                                         TongThoiLuong = kh.TongThoiLuong,

                                         DanhSachPhanHoc = (
                                         from ph in _phanRepository.GetQueryable()
                                         where ph.IdKhoaHoc == kh.Id
                                         orderby ph.ThuTuSapXep
                                         select new PhanHocDto
                                         {
                                             Id = ph.Id,
                                             TenPhan = ph.TenPhan,
                                             MieuTa = ph.MieuTa,
                                             ThuTuSapXep = ph.ThuTuSapXep,

                                             DanhSachBaiGiang = (
                                             from bg in _baiGiangRepository.GetQueryable()
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
                                                 from tl in _taiLieuRepository.GetQueryable()
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
                string loaiKhoaHoc = request.Gia == 0 ? "Miễn phí" : "Trả phí";
                var khoaHoc = new KhoaHocDto
                {
                    Id = Guid.NewGuid(),
                    TieuDe = request.TieuDe,
                    MoTa = request.MoTa,
                    Gia = request.Gia,
                    GiaGoc = request.GiaGoc,
                    LoaiKhoaHoc = loaiKhoaHoc,
                    HinhAnhKhoaHoc = request.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = request.URLViewPreviewKhoaHoc,
                    CapDo = request.CapDo,

                    TongBaiGiang = 0,
                    TongThoiLuong = 0,
                    SoLuongHocVien = 0,

                    NgayTao = DateTime.Now,
                };

                _khoaHocRepository.Add(khoaHoc);
                await _khoaHocRepository.SaveAsync();

                if(request.DanhSachDanhMuc != null && request.DanhSachDanhMuc.Any())
                {
                    foreach(var idDanhMuc in request.DanhSachDanhMuc)
                    {
                        var khoaHocDanhMuc = new DanhMuc_KhoaHocDto
                        {
                            Id = Guid.NewGuid(),
                            IdKhoaHoc = khoaHoc.Id,
                            IdDanhMuc = idDanhMuc
                        };
                        _danhMuc_KhoaHocRepository.Add(khoaHocDanhMuc);
                    }
                    await _danhMuc_KhoaHocRepository.SaveAsync();
                }
                return khoaHoc;
            } catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
    }
}
