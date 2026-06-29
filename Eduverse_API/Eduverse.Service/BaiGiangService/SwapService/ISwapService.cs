using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService.SwapService
{
    public interface ISwapable<T> where T : class, ISwapable<T>
    {
        Guid Id { get; set; }
        Guid? IdBanGhiTruoc { get; set; }
        bool IsBanHienTai { get; set; }
        DateTime CreatedDate { get; set; }

        // Map dữ liệu từ swap
        T MapFromSwap(T swap);

        // Map dữ liệu từ gốc (để hiển thị)
        T MapFromGoc(T goc);
    }
}
