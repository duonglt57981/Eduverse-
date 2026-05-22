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
        public KhoaHocService(IKhoaHocRepository khoaHocRepository, IPhanRepository phanRepository, IBaiGiangRepository baiGiangRepository, ITaiLieuRepository _taiLieuRepository) : base(khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository;
        }

        public Task<PagedList<KhoaHocDto>> GetKhoaHoc(KhoaHocSearch search)
        {
            var query = from q in GetQueryable()
                        select new KhoaHocDto
                        {
                            Id = q.Id,
                            TieuDe = q.TieuDe,
                            MoTa = q.MoTa,
                            Gia = q.Gia,
                            GiaGoc = q.GiaGoc,
                            LoaiKhoaHoc = q.LoaiKhoaHoc,
                            HinhAnhKhoaHoc = q.HinhAnhKhoaHoc,
                            URLViewPreviewKhoaHoc = q.URLViewPreviewKhoaHoc,
                            CapDo = q.CapDo,
                            TongThoiLuong = q.TongThoiLuong,
                            TongBaiGiang = q.TongBaiGiang,
                            NgayTao = q.NgayTao,
                            NgayCapNhat = q.NgayCapNhat,
                            SoLuongHocVien = q.SoLuongHocVien,
                            TrangThaiPheDuyet = q.TrangThaiPheDuyet,
                            TrangThai = q.TrangThai
                        };
            if (!string.IsNullOrEmpty(search.TieuDe))
            {
                query = query.Where(x => x.TieuDe.Contains(search.TieuDe));
            }
            var resulrt = PagedList<KhoaHocDto>.CreateAsync(query, search);
            return resulrt;

        }


        public async Task<KhoaHocDetailDto?> GetDto(Guid id)
        {
            var data = await (
                from kh in _khoaHocRepository.GetQueryable().AsNoTracking()

                join ph in _phanRepository.GetQueryable().AsNoTracking()
                    on kh.Id equals ph.IdKhoaHoc into phGroup
                from ph in phGroup.DefaultIfEmpty()

                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan into bgGroup
                from bg in bgGroup.DefaultIfEmpty()

                join tl in _taiLieuRepository.GetQueryable().AsNoTracking()
                    on bg.Id equals tl.IdBaiGiang into tlGroup
                from tl in tlGroup.DefaultIfEmpty()

                where kh.Id == id

                select new
                {
                    KhoaHoc = kh,
                    PhanHoc = ph,
                    BaiGiang = bg,
                    TaiLieu = tl
                }

            ).ToListAsync();

            if (!data.Any())
                return null;

            var khoaHoc = data.First().KhoaHoc;

            var result = new KhoaHocDto
            {
                Id = khoaHoc.Id,
                TieuDe = khoaHoc.TieuDe,
                MoTa = khoaHoc.MoTa,
                Gia = khoaHoc.Gia,
                GiaGoc = khoaHoc.GiaGoc,
                AnhKhoaHoc = khoaHoc.AnhKhoaHoc,
                TrangThai = khoaHoc.TrangThai,

                DanhSachPhanHoc = data
                    .Where(x => x.PhanHoc != null)
                    .GroupBy(x => x.PhanHoc.Id)
                    .Select(phanGroup =>
                    {
                        var phan = phanGroup.First().PhanHoc;

                        return new PhanHocDto
                        {
                            Id = phan.Id,
                            TieuDe = phan.TieuDe,
                            MoTa = phan.MoTa,
                            ThuTuSapXep = phan.ThuTuSapXep,

                            DanhSachBaiGiang = phanGroup
                                .Where(x => x.BaiGiang != null)
                                .GroupBy(x => x.BaiGiang.Id)
                                .Select(baiGiangGroup =>
                                {
                                    var baiGiang = baiGiangGroup.First().BaiGiang;

                                    return new BaiGiangDto
                                    {
                                        Id = baiGiang.Id,
                                        TieuDe = baiGiang.TieuDe,
                                        MoTa = baiGiang.MoTa,
                                        VideoUrl = baiGiang.VideoUrl,
                                        ThuTuSapXep = baiGiang.ThuTuSapXep,
                                        ThoiLuong = baiGiang.ThoiLuong,

                                        DanhSachTaiLieu = baiGiangGroup
                                            .Where(x => x.TaiLieu != null)
                                            .GroupBy(x => x.TaiLieu.Id)
                                            .Select(taiLieuGroup =>
                                            {
                                                var taiLieu = taiLieuGroup.First().TaiLieu;

                                                return new TaiLieuDto
                                                {
                                                    Id = taiLieu.Id,
                                                    TenTaiLieu = taiLieu.TenTaiLieu,
                                                    DuongDan = taiLieu.DuongDan
                                                };
                                            })
                                            .ToList()
                                    };
                                })
                                .OrderBy(x => x.ThuTuSapXep)
                                .ToList()
                        };
                    })
                    .OrderBy(x => x.ThuTuSapXep)
                    .ToList()
            };

            return result;
        }



    }
}
