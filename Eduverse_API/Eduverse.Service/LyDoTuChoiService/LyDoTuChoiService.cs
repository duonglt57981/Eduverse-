using Eduverse.Model.Entities;
using Eduverse.Repository.LyDoTuChoiRepository;
using Eduverse.Repository.NganHangRepository;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.LyDoTuChoiService.Dto;
using Eduverse.Service.LyDoTuChoiService.Request;
using Eduverse.Service.NganHangService;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LyDoTuChoiService
{
    public class LyDoTuChoiService : Service<LyDoTuChoi>, ILyDoTuChoiService
    {
        private readonly IMapper _mapper;
        public LyDoTuChoiService(ILyDoTuChoiRepository lyDoTuChoiRepository, IMapper mapper) : base(lyDoTuChoiRepository)
        {
            _mapper = mapper;
        }

        public async Task<LyDoTuChoiDto> CreateLyDoTuChoi(LyDoTuChoiRequest request)
        {
            var lyDoTuChoi = new LyDoTuChoi
            {
                IdDoiTuong = request.IdDoiTuong,
                LoaiDoiTuong = request.LoaiDoiTuong,
                LyDo = request.LyDo,
                TrangThai = "HoatDong",
            };
            await CreateAsync(lyDoTuChoi);
            await SaveAsync();
            return _mapper.Map<LyDoTuChoi,LyDoTuChoiDto>(lyDoTuChoi);
        }

        public async Task<LyDoTuChoiDto> UpdateLyDoTuChoi(LyDoTuChoiRequest request)
        {
            var lyDo = await GetQueryable().Where(x => x.Id == request.Id).FirstOrDefaultAsync();

            if (lyDo == null)
                throw new Exception("Không tìm thấy lý do ");

            lyDo.LyDo = request.LyDo;
            
            await UpdateAsync(lyDo);
            await SaveAsync();
            return _mapper.Map<LyDoTuChoi, LyDoTuChoiDto>(lyDo);
        }

    }
}
