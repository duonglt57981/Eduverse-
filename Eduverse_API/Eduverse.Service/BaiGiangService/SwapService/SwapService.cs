//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Eduverse.Service.BaiGiangService.SwapService
//{
//    /// <summary>
//    /// Service xử lý swap cho tất cả entity
//    /// </summary>
//    public class SwapService
//    {
//        /// <summary>
//        /// Lấy bản hiển thị phù hợp cho người học
//        /// </summary>
//        public T GetDisplayVersion<T>(
//            T goc,                    // Bản gốc
//            List<T> swaps,            // Tất cả bản swap
//            DateTime ngayDangKy,      // Ngày đăng ký của học viên
//            bool daHoanThanh = false  // Đã hoàn thành 100% chưa
//        ) where T : class, ISwapable<T>
//        {
//            if (swaps == null || !swaps.Any())
//                return goc;

//            //  Lấy swap mới nhất
//            var swapMoiNhat = swaps.OrderByDescending(x => x.CreatedDate).First();

//            // Quyết định dùng swap hay gốc
//            if (ShouldUseSwap(swapMoiNhat, ngayDangKy, daHoanThanh))
//            {
//                return swapMoiNhat.MapFromSwap(swapMoiNhat);
//            }

//            return goc;
//        }

//        /// <summary>
//        /// Quyết định có nên dùng swap không
//        /// </summary>
//        private bool ShouldUseSwap(ISwapable swap, DateTime ngayDangKy, bool daHoanThanh)
//        {
//            // Nếu swap tạo TRƯỚC ngày đăng ký → học viên MỚI → dùng swap luôn
//            if (swap.CreatedDate <= ngayDangKy)
//                return true;

//            // Nếu swap tạo SAU ngày đăng ký → học viên CŨ
//            // → Chỉ dùng swap nếu đã hoàn thành 100%
//            if (swap.CreatedDate > ngayDangKy && daHoanThanh)
//                return true;

//            // Mặc định: dùng gốc
//            return false;
//        }

//        /// <summary>
//        /// Lấy danh sách swap mới nhất theo từng gốc
//        /// </summary>
//        public Dictionary<Guid, T> GetSwapMoiNhatByGoc<T>(
//            List<T> allSwaps,
//            List<Guid> gocIds
//        ) where T : class, ISwapable<T>
//        {
//            return allSwaps
//                .Where(x => x.IdBanGhiTruoc.HasValue && gocIds.Contains(x.IdBanGhiTruoc.Value))
//                .GroupBy(x => x.IdBanGhiTruoc!.Value)
//                .ToDictionary(
//                    g => g.Key,
//                    g => g.OrderByDescending(x => x.CreatedDate).First()
//                );
//        }
//    }
//}
