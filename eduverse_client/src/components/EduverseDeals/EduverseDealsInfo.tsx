// src/components/EduverseDeals/EduverseDealsInfo.tsx
"use client";

import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BRAND } from "@/src/theme/tokens";

// ── Nội dung giải thích Chương trình Eduverse Deals — tách riêng thành
// hằng số để dùng lại ở nhiều nơi (trang sửa khóa học, trang quản lý
// khuyến mãi...) mà không lặp text. Nội dung là bản chuyển thể sang
// thương hiệu Eduverse từ mô tả bạn cung cấp. ──
const NOI_DUNG_EDUVERSE_DEALS = (
  <Box sx={{ maxWidth: 320 }}>
    <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, mb: 1 }}>
      Giảng viên có thể lựa chọn tham gia Chương trình Ưu đãi của Eduverse. Điều
      này cho phép Eduverse sử dụng dữ liệu tiếp thị để tối ưu hóa giá niêm yết
      khóa học của bạn và cung cấp các khóa học với giá ưu đãi tại các thị
      trường khác nhau trên toàn thế giới.
    </Typography>
    <Typography sx={{ fontSize: 12.5, lineHeight: 1.6 }}>
      <strong>Xin lưu ý:</strong> Việc một khóa học được đưa vào các chương
      trình khuyến mãi của Eduverse không được đảm bảo. Các khóa học được đưa
      vào chương trình khuyến mãi dựa trên một số yếu tố bao gồm chủ đề khóa
      học, số lượng học viên đăng ký, tỷ lệ chuyển đổi, xếp hạng, đánh giá và
      hành vi của học viên như thêm vào danh sách yêu thích, v.v. Vì vậy, không
      phải tất cả các khóa học đều sẽ được đưa vào mọi chương trình khuyến mãi
      của Eduverse.
    </Typography>
  </Box>
);

export function EduverseDealsLabel() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
        Eduverse Deals
      </Typography>
      <Tooltip title={NOI_DUNG_EDUVERSE_DEALS} arrow placement="top">
        <IconButton size="small" sx={{ p: 0.25, color: BRAND.main }}>
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
