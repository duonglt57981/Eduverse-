using Eduverse.IRepository.BaiGiang;
using Eduverse.IRepository.CauHoi;
using Eduverse.IRepository.KhoaHocRepository;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.Phan;
using Eduverse.Repository.TaiLieu;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.Common;
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
        public KhoaHocService(IKhoaHocRepository khoaHocRepository, IPhanRepository phanRepository, IBaiGiangRepository baiGiangRepository, ITaiLieuRepository taiLieuRepository) : base(khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository;
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
            _taiLieuRepository = taiLieuRepository;
        }

        public async Task<PagedList<KhoaHocDto>> GetListDetail(KhoaHocSearch search)
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

            var result = await PagedList<KhoaHocDto>
                .CreateAsync(query, search);

            return result;
        }


        public async Task<KhoaHocDetailDto?> GetDto(Guid id)
        {
            var data = await (
                from kh in _khoaHocRepository.GetQueryable()

                join ph in _phanRepository.GetQueryable()
                    on kh.Id equals ph.IdKhoaHoc into phGroup
                from ph in phGroup.DefaultIfEmpty()

                join bg in _baiGiangRepository.GetQueryable()
                    on ph.Id equals bg.IdPhan into bgGroup
                from bg in bgGroup.DefaultIfEmpty()

                join tl in _taiLieuRepository.GetQueryable()
                    on bg.Id equals tl.IdBaiGiang into tlGroup
                from tl in tlGroup.DefaultIfEmpty()

                where kh.Id == id

                select new KhoaHocDetailDto
                {
                    // Khóa học
                    TieuDeKhoaHoc = kh.TieuDe,
                    MoTa = kh.MoTa,
                    Gia = kh.Gia,
                    GiaGoc = kh.GiaGoc,
                    LoaiKhoaHoc = kh.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,
                    CapDo = kh.CapDo,
                    TongThoiLuong = kh.TongThoiLuong,
                    TongBaiGiang = kh.TongBaiGiang,

                    // Phần học
                    TenPhan = ph != null ? ph.TenPhan : null,
                    MieuTa = ph != null ? ph.MieuTa : null,
                    ThuTuSapXepPhanHoc = ph != null ? ph.ThuTuSapXep : null,

                    // Bài giảng
                    TieuDeBaiGiang = bg != null ? bg.TieuDe : null,
                    LoaiBaiGiang = bg != null ? bg.LoaiBaiGiang : null,
                    IdVideoBaiGiang = bg != null ? bg.IdVideoBaiGiang : null,
                    URLBaiGiang = bg != null ? bg.URLBaiGiang : null,
                    ThuTuSapXepBaiGiang = bg != null ? bg.ThuTuSapXep : null,
                    ThoiLuong = bg != null ? bg.ThoiLuong : null,
                    LaBaiGiangFree = bg != null ? bg.LaBaiGiangFree : null,

                    // Tài liệu
                    LoaiTaiLieu = tl != null ? tl.LoaiTaiLieu : null,
                    TenTaiLieu = tl != null ? tl.TenTaiLieu : null,
                    URL = tl != null ? tl.URL : null
                }

            ).FirstOrDefaultAsync();

            return data;
        }



    }
}
