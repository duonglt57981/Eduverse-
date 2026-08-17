"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Stack,
  Avatar,
  Typography,
  alpha,
  Skeleton,
  Collapse,
  Chip,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FolderIcon from "@mui/icons-material/Folder";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { COLORS, isTrangThaiCho } from "../types/constants";
import StatusChip from "./StatusChip";
import { useState } from "react";

// --- Row components ---
function BaiGiangRow({ baiGiang, active, onClick }: any) {
  const isPending = isTrangThaiCho(baiGiang.trangThaiPheDuyet);
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        border: `1.5px solid ${active ? COLORS.primary : isPending ? COLORS.gold : COLORS.line}`,
        bgcolor: active
          ? COLORS.primarySoft
          : isPending
            ? COLORS.goldSoft
            : COLORS.paperRaised,
        cursor: "pointer",
        transition: "border-color .12s ease, background-color .12s ease",
        "&:hover": { borderColor: COLORS.primary },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <PlayCircleIcon
          sx={{ color: isPending ? COLORS.gold : COLORS.primary, fontSize: 17 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: COLORS.ink,
            fontWeight: active || isPending ? 600 : 400,
          }}
          noWrap
        >
          {baiGiang.tenBaiGiang || baiGiang.tieuDe}
        </Typography>
        <StatusChip trangThai={baiGiang.trangThaiPheDuyet} size="small" hidePending />
      </Stack>
    </Box>
  );
}

function TaiLieuRow({ taiLieu, active, onClick, nested = false }: any) {
  const isPending = isTrangThaiCho(taiLieu.trangThaiPheDuyet);
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 0.85,
        ml: nested ? 2.5 : 0,
        borderRadius: 1.5,
        border: `1.5px solid ${active ? COLORS.primary : isPending ? COLORS.gold : COLORS.line}`,
        bgcolor: active
          ? COLORS.primarySoft
          : isPending
            ? COLORS.goldSoft
            : COLORS.paperRaised,
        cursor: "pointer",
        transition: "border-color .12s ease, background-color .12s ease",
        "&:hover": { borderColor: COLORS.primary },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <AttachFileIcon
          sx={{ color: isPending ? COLORS.gold : COLORS.primary, fontSize: 15 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: COLORS.ink,
            fontWeight: active || isPending ? 600 : 400,
          }}
          noWrap
        >
          {taiLieu.tenTaiLieu || taiLieu.tieuDe}
        </Typography>
        <StatusChip trangThai={taiLieu.trangThaiPheDuyet} size="small" hidePending />
      </Stack>
    </Box>
  );
}

// --- Bài kiểm tra row (có thể mở rộng để xem câu hỏi/đáp án) ---
function BaiKiemTraRow({ baiKiemTra, active, onClick }: any) {
  const [expanded, setExpanded] = useState(false);
  const isPending = isTrangThaiCho(baiKiemTra.trangThaiPheDuyet);
  const cauHois: any[] = baiKiemTra.cauHois ?? [];

  return (
    <Box>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          border: `1.5px solid ${active ? COLORS.primary : isPending ? COLORS.gold : COLORS.line}`,
          bgcolor: active
            ? COLORS.primarySoft
            : isPending
              ? COLORS.goldSoft
              : COLORS.paperRaised,
          cursor: "pointer",
          transition: "border-color .12s ease, background-color .12s ease",
          "&:hover": { borderColor: COLORS.primary },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <QuizRoundedIcon
            sx={{
              color: isPending ? COLORS.gold : COLORS.primary,
              fontSize: 17,
            }}
            onClick={onClick}
          />
          <Typography
            variant="body2"
            onClick={onClick}
            sx={{
              flex: 1,
              color: COLORS.ink,
              fontWeight: active || isPending ? 600 : 400,
            }}
            noWrap
          >
            {baiKiemTra.tenBaiKiemTra || baiKiemTra.tieuDe}
          </Typography>
          <StatusChip trangThai={baiKiemTra.trangThaiPheDuyet} size="small" hidePending />
          {cauHois.length > 0 && (
            <ExpandMoreIcon
              onClick={(e: any) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              sx={{
                fontSize: 18,
                color: COLORS.inkSoft,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .15s",
                cursor: "pointer",
              }}
            />
          )}
        </Stack>
      </Box>
      {cauHois.length > 0 && (
        <Collapse in={expanded}>
          <Stack spacing={0.75} sx={{ mt: 0.75, ml: 2.5 }}>
            {cauHois.map((ch: any, chIndex: number) => (
              <CauHoiRow key={ch.idCauHoi ?? `ch-${chIndex}`} cauHoi={ch} />
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}

// --- Câu hỏi (nested trong bài kiểm tra) ---
function CauHoiRow({ cauHoi }: any) {
  const [expanded, setExpanded] = useState(false);
  const dapAns: any[] = cauHoi.dapAns ?? [];

  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: `1.5px solid ${COLORS.line}`,
        bgcolor: COLORS.paper,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setExpanded((v) => !v)}
        sx={{
          alignItems: "center",
          cursor: dapAns.length > 0 ? "pointer" : "default",
        }}
      >
        <HelpOutlineRoundedIcon sx={{ color: COLORS.inkSoft, fontSize: 14 }} />
        <Typography
          variant="body2"
          sx={{ flex: 1, color: COLORS.ink, fontSize: 13 }}
          noWrap
        >
          {cauHoi.noiDungCauHoi || cauHoi.tieuDe}
        </Typography>
        {dapAns.length > 0 && (
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: COLORS.inkSoft,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .15s",
            }}
          />
        )}
      </Stack>
      {dapAns.length > 0 && (
        <Collapse in={expanded}>
          <Stack spacing={0.5} sx={{ mt: 0.75, ml: 2.25 }}>
            {dapAns.map((da: any, daIndex: number) => (
              <Stack
                key={da.idDapAn ?? `da-${daIndex}`}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                {da.dapAnDung || da.isDung ? (
                  <CheckCircleIcon
                    sx={{ color: COLORS.primary, fontSize: 14 }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ color: COLORS.inkSoft, fontSize: 14 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      da.dapAnDung || da.isDung ? COLORS.ink : COLORS.inkSoft,
                    fontWeight: da.dapAnDung || da.isDung ? 600 : 400,
                  }}
                  noWrap
                >
                  {da.noiDungDapAn || da.tieuDe}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}

// --- Main Accordion Item ---
export default function KhoaHocAccordionItem({
  item,
  isSelectedCourse,
  isExpanded,
  detail,
  detailLoading,
  selectedContent,
  onToggleExpand,
  onSelectContent,
}: any) {
  const id = item.idKhoaHoc ?? item.id;
  const imageSrc = item.anhDaiDien ?? item.hinhAnh ?? item.hinhAnhKhoaHoc;

  return (
    <Box
      sx={{
        border: `1px solid ${isSelectedCourse ? COLORS.primary : COLORS.line}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: COLORS.paperRaised,
        transition: "border-color .15s ease",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        onClick={() => onToggleExpand(id)}
        sx={{
          p: 1.5,
          cursor: "pointer",
          alignItems: "center",
          bgcolor: isSelectedCourse ? COLORS.primarySoft : "transparent",
          "&:hover": {
            bgcolor: isSelectedCourse ? COLORS.primarySoft : "#F9F5F2",
          },
        }}
      >
        <Avatar
          variant="rounded"
          src={imageSrc}
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha(COLORS.primary, 0.1),
            color: COLORS.primary,
            borderRadius: 1.5,
          }}
        >
          <SchoolRoundedIcon fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}
            noWrap
          >
            {item.tieuDe || "Tên khóa học"}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.inkSoft }} noWrap>
            {item.createBy || "Không xác định"}
          </Typography>
        </Box>
        <StatusChip trangThai={item.trangThai} size="small" />
        <ExpandMoreIcon
          sx={{
            fontSize: 20,
            color: COLORS.inkSoft,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .15s",
            flexShrink: 0,
          }}
        />
      </Stack>
      <Collapse in={isExpanded}>
        <Box sx={{ borderTop: `1px solid ${COLORS.line}` }}>
          {detailLoading ? (
            <Stack spacing={1} sx={{ p: 1.5 }}>
              <Skeleton variant="rounded" height={32} />
              <Skeleton variant="rounded" height={32} />
            </Stack>
          ) : (
            <KhoaHocNoiDungList
              detail={detail}
              selected={selectedContent}
              onSelectContent={onSelectContent}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// --- Danh sách nội dung khóa học ---
function KhoaHocNoiDungList({ detail, selected, onSelectContent }: any) {
  const [expandedPhan, setExpandedPhan] = useState<Record<string, boolean>>({});
  const togglePhan = (id: string) =>
    setExpandedPhan((p) => ({ ...p, [id]: !p[id] }));

  const isActive = (loai: string, item: any) => {
    if (!selected || selected.loai !== loai) return false;
    const key = loai === "baiGiang" ? "idBaiGiang" : "idTaiLieu";
    return selected.item[key] === item[key];
  };

  // API thực tế trả về "phans" (mỗi phần đã chứa sẵn baiGiangs/baiKiemTras
  // bên trong), không phải "phanHocs" + danh sách phẳng lọc theo idPhan. Vẫn
  // giữ fallback sang "phanHocs" + danh sách phẳng để tương thích ngược nếu
  // có nơi khác trả dữ liệu theo format cũ.
  const phans: any[] = detail?.phans ?? detail?.phanHocs ?? [];
  const flatBaiGiang: any[] =
    detail?.baiGiangs ?? detail?.baiGiangChoDuyet ?? [];
  const flatTaiLieu: any[] = detail?.taiLieus ?? detail?.taiLieuChoDuyet ?? [];
  const flatBaiKiemTra: any[] =
    detail?.baiKiemTras ?? detail?.baiKiemTraChoDuyet ?? [];

  const sortPending = (arr: any[]) =>
    [...arr].sort((x, y) => {
      const px = isTrangThaiCho(x.trangThaiPheDuyet) ? 0 : 1;
      const py = isTrangThaiCho(y.trangThaiPheDuyet) ? 0 : 1;
      return px - py;
    });

  // Tài liệu của 1 bài giảng: ưu tiên lấy từ bg.taiLieus (API thật, đã lồng
  // sẵn); nếu không có thì fallback lọc từ danh sách phẳng theo idBaiGiang
  // (format cũ).
  const taiLieuOfBaiGiang = (bg: any) => {
    if (Array.isArray(bg.taiLieus) && bg.taiLieus.length > 0) {
      return sortPending(bg.taiLieus);
    }
    return sortPending(
      flatTaiLieu.filter((tl) => tl.idBaiGiang === bg.idBaiGiang),
    );
  };

  // Bài kiểm tra của 1 phần: ưu tiên lấy từ phan.baiKiemTras (API thật, đã
  // lồng sẵn câu hỏi/đáp án bên trong); fallback lọc từ danh sách phẳng theo
  // idPhan (format cũ).
  const baiKiemTraOfPhan = (phan: any, phanId: any) => {
    if (Array.isArray(phan.baiKiemTras) && phan.baiKiemTras.length > 0) {
      return sortPending(phan.baiKiemTras);
    }
    return sortPending(flatBaiKiemTra.filter((bkt) => bkt.idPhan === phanId));
  };

  const renderBaiGiangWithTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg);
    return (
      <Box key={bg.idBaiGiang}>
        <BaiGiangRow
          baiGiang={bg}
          active={isActive("baiGiang", bg)}
          onClick={() => onSelectContent("baiGiang", bg)}
        />
        {taiLieus.length > 0 && (
          <Stack spacing={0.75} sx={{ mt: 0.75 }}>
            {taiLieus.map((tl: any) => (
              <TaiLieuRow
                key={tl.idTaiLieu}
                taiLieu={tl}
                active={isActive("taiLieu", tl)}
                onClick={() => onSelectContent("taiLieu", tl)}
                nested
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  const tongSoBaiGiangTrongPhan = phans.reduce(
    (sum, p) => sum + (p.baiGiangs?.length ?? 0),
    0,
  );
  const tongSoBaiKiemTraTrongPhan = phans.reduce(
    (sum, p) => sum + (p.baiKiemTras?.length ?? 0),
    0,
  );

  if (
    tongSoBaiGiangTrongPhan === 0 &&
    tongSoBaiKiemTraTrongPhan === 0 &&
    flatBaiGiang.length === 0 &&
    flatTaiLieu.length === 0 &&
    flatBaiKiemTra.length === 0
  ) {
    return (
      <Typography
        variant="caption"
        sx={{ color: COLORS.inkSoft, px: 2, pb: 1.5, display: "block" }}
      >
        Không có nội dung.
      </Typography>
    );
  }

  if (phans.length > 0) {
    // Bài giảng/bài kiểm tra thuộc "phần" không có trong danh sách phans
    // (chỉ áp dụng khi dùng danh sách phẳng ở format cũ; API thật đã lồng
    // sẵn baiGiangs/baiKiemTras trong từng phan nên trường hợp này thường sẽ
    // rỗng).
    const idsCoPhan = new Set(
      phans.map((p) => p.id ?? p.idPhan).filter(Boolean),
    );
    const baiGiangKhongCoPhan = flatBaiGiang.filter(
      (bg) => bg.idPhan && !idsCoPhan.has(bg.idPhan),
    );

    return (
      <Stack spacing={1} sx={{ p: 1.5 }}>
        {phans.map((phan: any, phanIndex: number) => {
          // Phan trả về từ API thật không có field id/idPhan riêng, nên
          // dùng chỉ số làm khoá dự phòng.
          const id = phan.id ?? phan.idPhan ?? `phan-${phanIndex}`;
          // Ưu tiên bài giảng lồng sẵn trong phan (API thật); fallback lọc
          // từ danh sách phẳng theo idPhan (format cũ).
          const baiGiangs = sortPending(
            Array.isArray(phan.baiGiangs) && phan.baiGiangs.length > 0
              ? phan.baiGiangs
              : flatBaiGiang.filter((bg) => bg.idPhan === id),
          );
          const baiKiemTras = baiKiemTraOfPhan(phan, id);
          if (baiGiangs.length === 0 && baiKiemTras.length === 0) return null;

          const soLuongChoBaiGiang = baiGiangs.filter((bg) =>
            isTrangThaiCho(bg.trangThaiPheDuyet),
          ).length;
          const soLuongChoBaiKiemTra = baiKiemTras.filter((bkt) =>
            isTrangThaiCho(bkt.trangThaiPheDuyet),
          ).length;
          const soLuongCho = soLuongChoBaiGiang + soLuongChoBaiKiemTra;
          const isExpanded = expandedPhan[id] !== false;

          return (
            <Box
              key={id}
              sx={{
                border: `1px dashed ${soLuongCho > 0 ? COLORS.gold : COLORS.line}`,
                borderRadius: 1.5,
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                onClick={() => togglePhan(id)}
                sx={{
                  py: 0.75,
                  px: 1.25,
                  cursor: "pointer",
                  alignItems: "center",
                  bgcolor: soLuongCho > 0 ? COLORS.goldSoft : COLORS.paper,
                  "&:hover": { bgcolor: "#F1EBE8" },
                }}
              >
                <FolderIcon sx={{ color: COLORS.gold, fontSize: 16 }} />
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    flex: 1,
                    color: COLORS.ink,
                  }}
                  noWrap
                >
                  {phan.tenPhan}
                </Typography>
                {soLuongCho > 0 && (
                  <Chip
                    label={`${soLuongCho} chờ duyệt`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10.5,
                      fontWeight: 700,
                      bgcolor: COLORS.gold,
                      color: "#fff",
                    }}
                  />
                )}
                <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
                  {baiGiangs.length + baiKiemTras.length}
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    fontSize: 16,
                    color: COLORS.inkSoft,
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .15s",
                  }}
                />
              </Stack>
              <Collapse in={isExpanded}>
                <Stack spacing={1} sx={{ p: 1 }}>
                  {baiGiangs.map((bg: any) => renderBaiGiangWithTaiLieu(bg))}
                  {baiKiemTras.map((bkt: any, bktIndex: number) => (
                    <BaiKiemTraRow
                      key={bkt.idBaiKiemTra ?? `bkt-${bktIndex}`}
                      baiKiemTra={bkt}
                      active={isActive("baiKiemTra", bkt)}
                      onClick={() => onSelectContent("baiKiemTra", bkt)}
                    />
                  ))}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
        {baiGiangKhongCoPhan.length > 0 && (
          <Stack spacing={1}>
            {sortPending(baiGiangKhongCoPhan).map((bg: any) =>
              renderBaiGiangWithTaiLieu(bg),
            )}
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 1.5 }}>
      {sortPending(flatBaiGiang).map((bg: any) =>
        renderBaiGiangWithTaiLieu(bg),
      )}
      {sortPending(flatBaiKiemTra).map((bkt: any, bktIndex: number) => (
        <BaiKiemTraRow
          key={bkt.idBaiKiemTra ?? `bkt-${bktIndex}`}
          baiKiemTra={bkt}
          active={isActive("baiKiemTra", bkt)}
          onClick={() => onSelectContent("baiKiemTra", bkt)}
        />
      ))}
    </Stack>
  );
}
