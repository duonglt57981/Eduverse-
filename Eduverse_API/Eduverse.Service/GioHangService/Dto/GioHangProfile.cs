using AutoMapper;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GioHangService.Dto
{
    public class GioHangProfile : Profile
    {
        public GioHangProfile()
        {
            CreateMap<GioHangRequest, GioHangChiTiet>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IdGioHang, opt => opt.Ignore())
                .ForMember(dest => dest.DaChon, opt => opt.Ignore())
                .ForMember(dest => dest.DaMua, opt => opt.Ignore())
                .ForMember(dest => dest.ThoiGianThem, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore());
        }
    }
}
