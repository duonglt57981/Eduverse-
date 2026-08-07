using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.LyDoTuChoiService.Dto;
using Eduverse.Service.LyDoTuChoiService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LyDoTuChoiService
{
    public interface ILyDoTuChoiService : IService<LyDoTuChoi>
    {
        Task<LyDoTuChoiDto> CreateLyDoTuChoi(LyDoTuChoiRequest request);
        Task<LyDoTuChoiDto> UpdateLyDoTuChoi(LyDoTuChoiRequest request);
    }
}
