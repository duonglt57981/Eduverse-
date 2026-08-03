import {
  Box, Typography, Button, Stack, Alert, LinearProgress, Chip, Divider,
  CircularProgress,
} from "@mui/material";
import {
  QuizRounded, AccessTimeRounded, EmojiEventsRounded,
  CheckCircleRounded, ReplayRounded, LockRounded,
  InfoOutlined, PlayArrowRounded, HistoryRounded,
} from "@mui/icons-material";
import type { BaiKiemTraInfoDto, LichSuLamBaiDto } from "../../hooks/useQuiz";

const RED = "#8B1313";

interface QuizEntryProps {
  info: BaiKiemTraInfoDto;
  lichSu: LichSuLamBaiDto[];
  canRetake: boolean;
  loading: boolean;
  lanLamDoDang?: LichSuLamBaiDto;
  error?: string;
  onBatDau: () => void;
  onTiepTuc: (id: string) => void;
  onXemLai: (id: string) => void;
}

export function QuizEntry({
  info, lichSu, canRetake, loading, lanLamDoDang,error,
  onBatDau, onTiepTuc, onXemLai,
}: QuizEntryProps) {
  const soLanDaLam = lichSu.length;
  const diemCaoNhat = lichSu.length > 0
    ? Math.max(...lichSu.map((l) => l.tongDiem ?? 0)) : null;
  const daDat = lichSu.some((l) => l.dat);
  const hetLuot = !canRetake && soLanDaLam > 0;

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", py: 3 }}>
      {/* Icon + Tên */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box sx={{ width: 68, height: 68, borderRadius: "18px",
          background: `linear-gradient(135deg, ${RED}, #7C3AED)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 2, boxShadow: `0 8px 24px rgba(141,19,19,0.22)` }}>
          <QuizRounded sx={{ fontSize: 34, color: "#fff" }} />
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)", mb: 0.5 }}>
          {info.tenBaiKiemTra}
        </Typography>
        {info.moTa && (
          <Typography sx={{ fontSize: 13.5, color: "rgba(31,41,55,0.55)", lineHeight: 1.65 }}>
            {info.moTa}
          </Typography>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, mb: 3 }}>
        {[
          { icon: <QuizRounded sx={{ fontSize: 20 }} />, label: "Số câu", value: `${info.soCauHoi ?? "?"} câu` },
          { icon: <AccessTimeRounded sx={{ fontSize: 20 }} />, label: "Thời gian", value: info.gioiHanThoiGian ? `${info.gioiHanThoiGian} phút` : "Không giới hạn" },
          { icon: <EmojiEventsRounded sx={{ fontSize: 20 }} />, label: "Điểm đạt", value: `${info.diemDat ?? 50}%` },
        ].map((s, i) => (
          <Box key={i} sx={{ p: 2, borderRadius: "12px", textAlign: "center",
            border: "1px solid rgba(141,19,19,0.1)", bgcolor: "rgba(141,19,19,0.015)" }}>
            <Box sx={{ color: RED, mb: 0.5 }}>{s.icon}</Box>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)" }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(31,41,55,0.45)", fontWeight: 600 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Bài đang làm dở */}
      {lanLamDoDang && (
        <Alert severity="warning" sx={{ borderRadius: "12px", mb: 2 }}
          action={
            <Button size="small" sx={{ fontWeight: 800, color: "#D97706" }}
              onClick={() => onTiepTuc(lanLamDoDang.idLanLamBaiKiemTra)}>
              Tiếp tục
            </Button>
          }>
          Bạn có bài làm chưa hoàn thành (lần {lanLamDoDang.lamLanThu}).
        </Alert>
      )}

      {/* Kết quả trước đó */}
      {soLanDaLam > 0 && !lanLamDoDang && (
        <Box sx={{ p: 2.5, borderRadius: "14px", mb: 3,
          border: `1.5px solid ${daDat ? "rgba(16,185,129,0.2)" : "rgba(141,19,19,0.15)"}`,
          bgcolor: daDat ? "rgba(16,185,129,0.03)" : "rgba(141,19,19,0.02)" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            {daDat
              ? <CheckCircleRounded sx={{ color: "#10B981" }} />
              : <EmojiEventsRounded sx={{ color: RED }} />}
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: daDat ? "#10B981" : RED }}>
              {daDat ? "Bạn đã đạt bài kiểm tra này!" : "Chưa đạt — Thử lại nhé!"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ mb: diemCaoNhat != null ? 1.5 : 0 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "rgba(31,41,55,0.45)", fontWeight: 600 }}>Số lần đã làm</Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)" }}>{soLanDaLam} lần</Typography>
            </Box>
            {diemCaoNhat != null && (
              <Box>
                <Typography sx={{ fontSize: 11, color: "rgba(31,41,55,0.45)", fontWeight: 600 }}>Điểm cao nhất</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)" }}>{diemCaoNhat.toFixed(1)}</Typography>
              </Box>
            )}
          </Stack>
          {diemCaoNhat != null && (
            <LinearProgress variant="determinate" value={Math.min(100, diemCaoNhat)}
              sx={{ height: 5, borderRadius: 3, bgcolor: "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": { bgcolor: daDat ? "#10B981" : RED, borderRadius: 3 } }} />
          )}
        </Box>
      )}

      {/* Lưu ý */}
      <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: "rgba(59,130,246,0.04)",
        border: "1px solid rgba(59,130,246,0.1)", mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
          <InfoOutlined sx={{ fontSize: 15, color: "#3B82F6" }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "#1E40AF" }}>Lưu ý</Typography>
        </Stack>
        <Stack spacing={0.8}>
          {[
            "Đọc kỹ câu hỏi trước khi chọn",
            info.gioiHanThoiGian ? `Thời gian: ${info.gioiHanThoiGian} phút` : "Không giới hạn thời gian",
            `Điểm đạt: ${info.diemDat ?? 50}% trở lên`,
            info.choLamLai
              ? `Được làm lại${info.soLanLamToiDa ? ` (tối đa ${info.soLanLamToiDa} lần)` : ""}`
              : "Chỉ được làm 1 lần",
            "Hệ thống tự động lưu khi bạn chọn đáp án",
          ].map((note, i) => (
            <Stack key={i} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#3B82F6", mt: 0.85, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12.5, color: "rgba(31,41,55,0.65)" }}>{note}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Buttons */}
      <Stack spacing={1.5}>
        {hetLuot ? (
          <Button fullWidth variant="contained" disabled
            startIcon={<LockRounded />}
            sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800, fontSize: 15 }}>
            Đã hết lượt làm bài
          </Button>
        ) : (
          <Button fullWidth variant="contained" size="large"
            onClick={onBatDau}
            disabled={loading || !!lanLamDoDang}
            startIcon={loading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : soLanDaLam > 0 ? <ReplayRounded /> : <PlayArrowRounded />}
            sx={{ py: 1.5, borderRadius: "12px", fontWeight: 900, fontSize: 15,
              background: `linear-gradient(135deg, ${RED}, #7C3AED)`,
              boxShadow: `0 8px 20px rgba(141,19,19,0.2)` }}>
            {loading ? "Đang chuẩn bị..." : soLanDaLam > 0 ? "Làm lại" : "Bắt đầu làm bài"}
          </Button>
        )}

        {error && (
  <Alert severity="error" sx={{ borderRadius: "12px", mt: 1.5, fontSize: 13 }}>
    {error}
  </Alert>
)}

        {/* Xem lại bài làm cũ */}
        {lichSu.filter((l) => l.thoiGianNop).length > 0 && (
          <>
            <Divider sx={{ opacity: 0.4 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "rgba(31,41,55,0.4)", textAlign: "center" }}>
              Lịch sử làm bài
            </Typography>
            <Stack spacing={1}>
              {lichSu.filter((l) => l.thoiGianNop).slice(0, 3).map((l) => (
                <Box key={l.idLanLamBaiKiemTra}
                  onClick={() => onXemLai(l.idLanLamBaiKiemTra)}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    p: 1.5, borderRadius: "10px", cursor: "pointer",
                    border: "1px solid rgba(0,0,0,0.07)", bgcolor: "var(--ev-paper, #FFFFFF)",
                    "&:hover": { borderColor: RED, bgcolor: "rgba(141,19,19,0.02)" } }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <HistoryRounded sx={{ fontSize: 16, color: "rgba(31,41,55,0.4)" }} />
                    <Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Lần {l.lamLanThu}</Typography>
                      <Typography sx={{ fontSize: 11, color: "rgba(31,41,55,0.45)" }}>
                        {l.thoiGianNop ? new Date(l.thoiGianNop).toLocaleDateString("vi-VN") : ""}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: l.dat ? "#10B981" : RED }}>
                      {l.tongDiem?.toFixed(1) ?? "—"}đ
                    </Typography>
                    <Chip label={l.dat ? "Đạt" : "Chưa đạt"} size="small"
                      color={l.dat ? "success" : "error"} sx={{ fontWeight: 800, height: 20, fontSize: 10 }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}