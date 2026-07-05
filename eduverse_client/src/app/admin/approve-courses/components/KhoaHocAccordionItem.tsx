/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Stack,
  Avatar,
  Typography,
  alpha,
  Skeleton,
  Collapse,
  Chip, // added
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FolderIcon from "@mui/icons-material/Folder";
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
        <StatusChip trangThai={baiGiang.trangThaiPheDuyet} size="small" />
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
        <StatusChip trangThai={taiLieu.trangThaiPheDuyet} size="small" />
      </Stack>
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

  const phanHocs: any[] = detail?.phanHocs ?? [];
  const allBaiGiang: any[] =
    detail?.baiGiangs ?? detail?.baiGiangChoDuyet ?? [];
  const allTaiLieu: any[] = detail?.taiLieus ?? detail?.taiLieuChoDuyet ?? [];

  const sortPending = (arr: any[]) =>
    [...arr].sort((x, y) => {
      const px = isTrangThaiCho(x.trangThaiPheDuyet) ? 0 : 1;
      const py = isTrangThaiCho(y.trangThaiPheDuyet) ? 0 : 1;
      return px - py;
    });

  const taiLieuOfBaiGiang = (idBaiGiang: string) =>
    sortPending(allTaiLieu.filter((tl) => tl.idBaiGiang === idBaiGiang));

  const renderBaiGiangWithTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg.idBaiGiang);
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

  if (allBaiGiang.length === 0 && allTaiLieu.length === 0) {
    return (
      <Typography
        variant="caption"
        sx={{ color: COLORS.inkSoft, px: 2, pb: 1.5, display: "block" }}
      >
        Không có nội dung.
      </Typography>
    );
  }

  if (phanHocs.length > 0) {
    const idsCoPhan = new Set(phanHocs.map((p) => p.id || p.idPhan));
    const baiGiangKhongCoPhan = allBaiGiang.filter(
      (bg) => !idsCoPhan.has(bg.idPhan),
    );

    return (
      <Stack spacing={1} sx={{ p: 1.5 }}>
        {phanHocs.map((phan: any) => {
          const id = phan.id || phan.idPhan;
          const baiGiangs = sortPending(
            allBaiGiang.filter((bg) => bg.idPhan === id),
          );
          if (baiGiangs.length === 0) return null;
          const soLuongCho = baiGiangs.filter((bg) =>
            isTrangThaiCho(bg.trangThaiPheDuyet),
          ).length;
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
                  {baiGiangs.length}
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
      {sortPending(allBaiGiang).map((bg: any) => renderBaiGiangWithTaiLieu(bg))}
    </Stack>
  );
}
