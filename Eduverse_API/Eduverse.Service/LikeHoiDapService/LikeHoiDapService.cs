using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LikeHoiDapRepository;
using Eduverse.Repository.LoiMoiGiangVienRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.Common;
using Eduverse.Service.ThongBaoService;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LikeHoiDapService
{
    public class LikeHoiDapService : Service<Model.Entities.LikeHoiDap>, ILikeHoiDapService
    {
        public LikeHoiDapService(ILikeHoiDapRepository likeHoiDapRepository) : base(likeHoiDapRepository)
        {
        }
    }
}
