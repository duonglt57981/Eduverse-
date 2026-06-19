using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GeminiService
{
    public interface IGeminiService
    {
        Task<KetQuaKiemDuyetInput> KiemTraAsync(string noiDung);
    }
}
