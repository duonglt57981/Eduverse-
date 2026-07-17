import {
  Box, Typography, Button, LinearProgress, Stack,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import {
  AccessTimeRounded, ChevronLeftRounded, ChevronRightRounded,
  SendRounded, GridViewRounded, CheckCircleRounded,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { CauHoiLamBaiDto } from "../../hooks/useQuiz";

const RED = "#8D1313";
const LABELS = ["A", "B", "C", "D", "E", "F"];

interface QuizViewProps {
  cauHois: CauHoiLamBaiDto[];
  traLois: Record<string, string[]>;
  cauHoiHienTai: number;
  thoiGianConLai: number;
  coGioiHanThoiGian: boolean;
  formatTimer: (s: number) => string;
  loading: boolean;
  onChonDapAn: (idCauHoi: string, idDapAn: string) => void;
  onSetCauHoi: (i: number) => void;
  onNopBai: () => void;
}

export function QuizView({
  cauHois, traLois, cauHoiHienTai, thoiGianConLai,
  coGioiHanThoiGian, formatTimer, loading,
  onChonDapAn, onSetCauHoi, onNopBai,
}: QuizViewProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openOverview, setOpenOverview] = useState(false);

  const cauHoi = cauHois[cauHoiHienTai];
  const tongCau = cauHois.length;
  const soDaTraLoi = cauHois.filter((c) => (traLois[c.id] ?? []).length > 0).length;
  const progress = ((cauHoiHienTai + 1) / tongCau) * 100;

  const sapHetGio = coGioiHanThoiGian && thoiGianConLai <= 60;
  const canhoHetGio = coGioiHanThoiGian && thoiGianConLai <= 180;
  const isMulti = cauHoi?.loaiCauHoi === 2;

  if (!cauHoi) return null;

  const selected = traLois[cauHoi.id] ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 2.5, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fff", flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "rgba(31,41,55,0.5)" }}>
          {cauHoiHienTai + 1} / {tongCau}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {coGioiHanThoiGian && (
            <Chip
              icon={<AccessTimeRounded sx={{ fontSize: "14px !important" }} />}
              label={formatTimer(thoiGianConLai)}
              size="small"
              sx={{ fontWeight: 900, fontFamily: "monospace", fontSize: 13,
                bgcolor: sapHetGio ? "rgba(220,38,38,0.08)" : canhoHetGio ? "rgba(245,158,11,0.08)" : "rgba(0,0,0,0.04)",
                color: sapHetGio ? "#DC2626" : canhoHetGio ? "#D97706" : "#374151",
                animation: sapHetGio ? "blink 1s step-end infinite" : "none",
                "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
                "& .MuiChip-icon": { color: "inherit !important" },
              }}
            />
          )}
          <Tooltip title="Tổng quan">
            <IconButton size="small" onClick={() => setOpenOverview(true)}
              sx={{ bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "rgba(141,19,19,0.08)" } }}>
              <GridViewRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Progress */}
      <LinearProgress variant="determinate" value={progress}
        sx={{ height: 3, bgcolor: "rgba(0,0,0,0.04)",
          "& .MuiLinearProgress-bar": { bgcolor: RED } }} />

      {/* Câu hỏi */}
      <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
        <Box sx={{ mb: 3.5 }}>
          {cauHoi.doKho && (
            <Chip label={cauHoi.doKho} size="small" sx={{ mb: 1.5, fontWeight: 700, fontSize: 11,
              bgcolor: "rgba(0,0,0,0.05)", color: "rgba(31,41,55,0.6)" }} />
          )}
          {isMulti && (
            <Chip label="Nhiều đáp án đúng" size="small" color="info" sx={{ mb: 1.5, ml: 1, fontWeight: 700, fontSize: 11 }} />
          )}
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#1F2937", lineHeight: 1.6, mb: 0.5 }}>
            Câu {cauHoiHienTai + 1}. {cauHoi.tenCauHoi}
          </Typography>
          {cauHoi.noiDungCauHoi && cauHoi.noiDungCauHoi !== cauHoi.tenCauHoi && (
            <Typography sx={{ fontSize: 14, color: "rgba(31,41,55,0.65)", lineHeight: 1.7 }}>
              {cauHoi.noiDungCauHoi}
            </Typography>
          )}
          {cauHoi.diem && (
            <Typography sx={{ fontSize: 11.5, color: "rgba(31,41,55,0.38)", mt: 0.5, fontWeight: 600 }}>
              ({cauHoi.diem} điểm)
            </Typography>
          )}
        </Box>

        {/* Đáp án */}
        <Stack spacing={1.5}>
          {cauHoi.dapAns.map((da, i) => {
            const isSelected = selected.includes(da.id);
            return (
              <Box key={da.id} onClick={() => onChonDapAn(cauHoi.id, da.id)}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2,
                  borderRadius: "12px", cursor: "pointer",
                  border: `2px solid ${isSelected ? RED : "rgba(0,0,0,0.08)"}`,
                  bgcolor: isSelected ? "rgba(141,19,19,0.04)" : "#fff",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: isSelected ? RED : "rgba(141,19,19,0.3)", bgcolor: "rgba(141,19,19,0.02)" } }}>
                {/* Label A/B/C */}
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: isSelected ? RED : "rgba(0,0,0,0.05)",
                  color: isSelected ? "#fff" : "rgba(31,41,55,0.4)",
                  fontWeight: 800, fontSize: 13 }}>
                  {isMulti ? (
                    isSelected
                      ? <CheckCircleRounded sx={{ fontSize: 18 }} />
                      : <Box sx={{ width: 16, height: 16, borderRadius: "3px", border: "2px solid rgba(0,0,0,0.2)" }} />
                  ) : (LABELS[i] ?? (i + 1))}
                </Box>
                <Typography sx={{ fontSize: 14, lineHeight: 1.6, flex: 1,
                  fontWeight: isSelected ? 600 : 400, color: "#1F2937" }}>
                  {da.noiDungDapAn}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fff", flexShrink: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Button variant="outlined" startIcon={<ChevronLeftRounded />}
            disabled={cauHoiHienTai === 0}
            onClick={() => onSetCauHoi(cauHoiHienTai - 1)}
            sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "rgba(0,0,0,0.12)", color: "#374151",
              "&:hover": { borderColor: RED, color: RED } }}>
            Trước
          </Button>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "rgba(31,41,55,0.45)", fontWeight: 600 }}>
              Đã trả lời {soDaTraLoi}/{tongCau}
            </Typography>
          </Box>
          {cauHoiHienTai < tongCau - 1 ? (
            <Button variant="outlined" endIcon={<ChevronRightRounded />}
              onClick={() => onSetCauHoi(cauHoiHienTai + 1)}
              sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "rgba(0,0,0,0.12)", color: "#374151",
                "&:hover": { borderColor: RED, color: RED } }}>
              Tiếp
            </Button>
          ) : (
            <Button variant="contained" endIcon={<SendRounded />}
              onClick={() => setOpenConfirm(true)} disabled={loading}
              sx={{ borderRadius: "10px", fontWeight: 800,
                background: `linear-gradient(135deg, ${RED}, #7C3AED)`, boxShadow: "none" }}>
              Nộp bài
            </Button>
          )}
        </Stack>
      </Box>

      {/* Confirm dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Xác nhận nộp bài?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, mb: 1.5 }}>
            Đã trả lời <strong style={{ color: RED }}>{soDaTraLoi}/{tongCau}</strong> câu.
          </Typography>
          {soDaTraLoi < tongCau && (
            <Box sx={{ p: 2, borderRadius: "10px", bgcolor: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Typography sx={{ fontSize: 13, color: "#D97706", fontWeight: 600 }}>
                ⚠️ Còn {tongCau - soDaTraLoi} câu chưa trả lời, sẽ bị tính 0 điểm.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenConfirm(false)} sx={{ color: "#666", borderRadius: "10px" }}>Quay lại</Button>
          <Button variant="contained" disabled={loading}
            onClick={() => { setOpenConfirm(false); onNopBai(); }}
            sx={{ background: `linear-gradient(135deg, ${RED}, #7C3AED)`, borderRadius: "10px", fontWeight: 800, boxShadow: "none" }}>
            Xác nhận nộp
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overview dialog */}
      <Dialog open={openOverview} onClose={() => setOpenOverview(false)}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 0.5 }}>Tổng quan</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Đã trả lời: <strong>{soDaTraLoi}/{tongCau}</strong> câu
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {cauHois.map((c, i) => {
              const daTraLoi = (traLois[c.id] ?? []).length > 0;
              const isHienTai = i === cauHoiHienTai;
              return (
                <Box key={c.id}
                  onClick={() => { onSetCauHoi(i); setOpenOverview(false); }}
                  sx={{ width: 40, height: 40, borderRadius: "10px", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontWeight: 800, fontSize: 13,
                    border: `2px solid ${isHienTai ? RED : daTraLoi ? "#10B981" : "rgba(0,0,0,0.1)"}`,
                    bgcolor: isHienTai ? RED : daTraLoi ? "rgba(16,185,129,0.07)" : "transparent",
                    color: isHienTai ? "#fff" : daTraLoi ? "#10B981" : "rgba(31,41,55,0.38)",
                    "&:hover": { borderColor: RED } }}>
                  {i + 1}
                </Box>
              );
            })}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
            {[{ c: RED, l: "Đang xem" }, { c: "#10B981", l: "Đã trả lời" }, { c: "rgba(0,0,0,0.1)", l: "Chưa trả lời" }]
              .map((item, i) => (
                <Stack key={i} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: item.c }} />
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{item.l}</Typography>
                </Stack>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpenConfirm(true); setOpenOverview(false); }}
            variant="contained"
            sx={{ background: `linear-gradient(135deg, ${RED}, #7C3AED)`, borderRadius: "10px", fontWeight: 800, boxShadow: "none" }}>
            Nộp bài ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}