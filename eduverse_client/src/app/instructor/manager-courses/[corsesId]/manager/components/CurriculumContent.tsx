/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  TextField,
  Menu,
  MenuItem,
  Switch,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { MAU, tinhTongThoiLuongGiay } from "./courseEditCore";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import PhanService from "@/src/services/PhanService";
import BaiGiangService from "@/src/services/BaiGiangService";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";
import TaiLieuService from "@/src/services/TaiLieuService";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";

interface Props {
  phans: PhanHocType[];
  onDoiPhans: (phansMoi: PhanHocType[]) => void;
  idKhoaHoc: string;
  onQuanLyCauHoi?: (idBaiKiemTra: string) => void;
  onTaiLenHangLoat?: () => void;
}

type MucHienThi =
  | { kind: "BaiGiang"; data: BaiGiangType }
  | { kind: "BaiKiemTra"; data: BaiKiemTraDto };

function dinhDangThoiLuong(giay: number) {
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${p}:${String(g).padStart(2, "0")}`;
}

function layDanhSachMucHienThi(phan: PhanHocType): MucHienThi[] {
  const baiGiangs: MucHienThi[] = (phan.DanhSachBaiGiang ?? []).map((bg) => ({
    kind: "BaiGiang",
    data: bg,
  }));
  const baiKiemTras: MucHienThi[] = (phan.DanhDachBaiKiemTra ?? []).map(
    (kt) => ({ kind: "BaiKiemTra", data: kt }),
  );
  return [...baiGiangs, ...baiKiemTras].sort((a, b) => {
    // Chỉ bài giảng có thuTuSapXep, bài kiểm tra mặc định 0
    const aOrder = a.kind === "BaiGiang" ? (a.data.thuTuSapXep ?? 0) : 0;
    const bOrder = b.kind === "BaiGiang" ? (b.data.thuTuSapXep ?? 0) : 0;
    return aOrder - bOrder;
  });
}

// Mục đã có nội dung (video với bài giảng, có câu hỏi với bài kiểm tra) hay chưa
function mucDaCoNoiDung(muc: MucHienThi) {
  if (muc.kind === "BaiGiang") return !!muc.data.urlBaiGiang;
  return ((muc.data as any).soCauHoi ?? 0) > 0;
}

export default function CurriculumContent({
  phans,
  onDoiPhans,
  idKhoaHoc,
  onQuanLyCauHoi,
  onTaiLenHangLoat,
}: Props) {
  const [phanMoRong, setPhanMoRong] = useState<Record<string, boolean>>(
    Object.fromEntries(phans.map((p) => [p.id as string, true])),
  );
  const [mucMoRong, setMucMoRong] = useState<Record<string, boolean>>({});
  const [anchorThemMuc, setAnchorThemMuc] = useState<{
    el: HTMLElement;
    phanId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const phanService = new PhanService();
  const baiGiangService = new BaiGiangService();
  const baiKiemTraService = new BaiKiemTraService();
  const taiLieuService = new TaiLieuService();

  const themPhanTuDong = async () => {
    setLoading(true);
    try {
      const res = await phanService.CreatePhanHoc({
        idKhoaHoc,
        tenPhan: "Giới thiệu",
        mieuTa: "",
      });
      if (res.status !== false && res.data) {
        const phanMoi: PhanHocType = {
          ...res.data,
          DanhSachBaiGiang: [],
          DanhDachBaiKiemTra: [],
        };
        onDoiPhans([...phans, phanMoi]);
        setPhanMoRong((prev) => ({ ...prev, [phanMoi.id as string]: true }));
      }
    } catch (error) {
      console.error("Lỗi tạo phần tự động:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phans.length === 0 && idKhoaHoc) {
      themPhanTuDong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phans.length, idKhoaHoc]);

  const capNhatPhan = (phanId: string, thayDoi: Partial<PhanHocType>) => {
    onDoiPhans(phans.map((p) => (p.id === phanId ? { ...p, ...thayDoi } : p)));
  };

  const capNhatBaiGiang = (
    phanId: string,
    baiGiangId: string,
    thayDoi: Partial<BaiGiangType>,
  ) => {
    onDoiPhans(
      phans.map((p) =>
        p.id !== phanId
          ? p
          : {
              ...p,
              DanhSachBaiGiang: (p.DanhSachBaiGiang ?? []).map((bg) =>
                bg.id === baiGiangId ? { ...bg, ...thayDoi } : bg,
              ),
            },
      ),
    );
  };

  const capNhatBaiKiemTra = (
    phanId: string,
    baiKiemTraId: string,
    thayDoi: Partial<BaiKiemTraDto>,
  ) => {
    onDoiPhans(
      phans.map((p) =>
        p.id !== phanId
          ? p
          : {
              ...p,
              DanhDachBaiKiemTra: (p.DanhDachBaiKiemTra ?? []).map((kt) =>
                kt.id === baiKiemTraId ? { ...kt, ...thayDoi } : kt,
              ),
            },
      ),
    );
  };

  const capNhatTaiLieu = (
    phanId: string,
    baiGiangId: string,
    taiLieuMoi: TaiLieuType,
  ) => {
    onDoiPhans(
      phans.map((p) =>
        p.id !== phanId
          ? p
          : {
              ...p,
              DanhSachBaiGiang: (p.DanhSachBaiGiang ?? []).map((bg) =>
                bg.id === baiGiangId
                  ? {
                      ...bg,
                      danhSachTaiLieu: [
                        ...(bg.danhSachTaiLieu ?? []),
                        taiLieuMoi,
                      ],
                    }
                  : bg,
              ),
            },
      ),
    );
  };

  const xoaTaiLieu = (
    phanId: string,
    baiGiangId: string,
    taiLieuId: string,
  ) => {
    onDoiPhans(
      phans.map((p) =>
        p.id !== phanId
          ? p
          : {
              ...p,
              DanhSachBaiGiang: (p.DanhSachBaiGiang ?? []).map((bg) =>
                bg.id === baiGiangId
                  ? {
                      ...bg,
                      danhSachTaiLieu: (bg.danhSachTaiLieu ?? []).filter(
                        (tl) => tl.id !== taiLieuId,
                      ),
                    }
                  : bg,
              ),
            },
      ),
    );
  };

  const themPhan = async () => {
    setLoading(true);
    try {
      const res = await phanService.CreatePhanHoc({
        idKhoaHoc,
        tenPhan: "Phần mới",
        mieuTa: "",
      });
      if (res.status !== false && res.data) {
        const phanMoi: PhanHocType = {
          ...res.data,
          DanhSachBaiGiang: [],
          DanhDachBaiKiemTra: [],
        };
        onDoiPhans([...phans, phanMoi]);
        setPhanMoRong((prev) => ({ ...prev, [phanMoi.id as string]: true }));
      }
    } catch (error) {
      console.error("Lỗi tạo phần:", error);
    } finally {
      setLoading(false);
    }
  };

  const xoaPhan = async (phanId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phần học này?")) return;
    setLoading(true);
    try {
      const res = await phanService.DeletePhanHoc(phanId);
      if (res.status !== false) {
        onDoiPhans(phans.filter((p) => p.id !== phanId));
      }
    } catch (error) {
      console.error("Lỗi xóa phần:", error);
    } finally {
      setLoading(false);
    }
  };

  const themBaiGiang = async (phanId: string) => {
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const soMucHienCo = layDanhSachMucHienThi(phan).length;
    try {
      const res = await baiGiangService.CreateBaiGiang({
        idPhan: phanId,
        tieuDe: "Bài giảng mới",
        thuTuSapXep: soMucHienCo + 1,
      } as any);
      if (res.status !== false && res.data) {
        const baiGiangMoi: BaiGiangType = {
          id: res.data.id,
          tieuDe: res.data.tieuDe || "Bài giảng mới",
          thuTuSapXep: soMucHienCo + 1,
          urlBaiGiang: "",
          thoiLuong: 0,
          danhSachTaiLieu: [],
        };
        capNhatPhan(phanId, {
          DanhSachBaiGiang: [...(phan.DanhSachBaiGiang ?? []), baiGiangMoi],
        });
        setMucMoRong((prev) => ({ ...prev, [baiGiangMoi.id as string]: true }));
      }
    } catch (error) {
      console.error("Lỗi tạo bài giảng:", error);
    }
    setAnchorThemMuc(null);
  };

  const themBaiKiemTra = async (phanId: string) => {
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const soMucHienCo = layDanhSachMucHienThi(phan).length;
    try {
      const res = await baiKiemTraService.CreateBaiKiemTra({
        idPhan: phanId,
        tenBaiKiemTra: "Bài kiểm tra mới",
        danhSachCauHoi: [],
        diemDat: 70,
        gioiHanThoiGian: 10,
        choLamLai: false,
        soLanLamToiDa: 1,
      } as any);
      if (res.status !== false && res.data) {
        const baiKiemTraMoi: any = {
          id: res.data.id,
          tenBaiKiemTra: res.data.tenBaiKiemTra || "Bài kiểm tra mới",
          soCauHoi: 0,
          cauHois: [],
        };
        // Không gán thuTuSapXep cho bài kiểm tra
        capNhatPhan(phanId, {
          DanhDachBaiKiemTra: [
            ...(phan.DanhDachBaiKiemTra ?? []),
            baiKiemTraMoi,
          ],
        });
        setMucMoRong((prev) => ({
          ...prev,
          [baiKiemTraMoi.id as string]: true,
        }));
      }
    } catch (error) {
      console.error("Lỗi tạo bài kiểm tra:", error);
    }
    setAnchorThemMuc(null);
  };

  const xoaBaiGiang = async (phanId: string, baiGiangId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài giảng này?")) return;
    try {
      const res = await baiGiangService.DeleteBaiGiang(baiGiangId);
      if (res.status !== false) {
        const phan = phans.find((p) => p.id === phanId);
        if (phan) {
          capNhatPhan(phanId, {
            DanhSachBaiGiang: (phan.DanhSachBaiGiang ?? []).filter(
              (bg) => bg.id !== baiGiangId,
            ),
          });
        }
      }
    } catch (error) {
      console.error("Lỗi xóa bài giảng:", error);
    }
  };

  const xoaBaiKiemTra = async (phanId: string, baiKiemTraId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài kiểm tra này?")) return;
    try {
      const res = await baiKiemTraService.DeleteBaiKiemTra(baiKiemTraId);
      if (res.status !== false) {
        const phan = phans.find((p) => p.id === phanId);
        if (phan) {
          capNhatPhan(phanId, {
            DanhDachBaiKiemTra: (phan.DanhDachBaiKiemTra ?? []).filter(
              (kt) => kt.id !== baiKiemTraId,
            ),
          });
        }
      }
    } catch (error) {
      console.error("Lỗi xóa bài kiểm tra:", error);
    }
  };

  const uploadVideo = async (
    phanId: string,
    baiGiangId: string,
    file: File,
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      formData.append("video", file);
      const res = await baiGiangService.UpdateBaiGiang(formData as any);
      if (res.status !== false && res.data) {
        capNhatBaiGiang(phanId, baiGiangId, {
          urlBaiGiang: res.data.urlBaiGiang || "",
          thoiLuong: res.data.thoiLuong || 0,
          idVideoBaiGiang: res.data.idVideoBaiGiang,
        });
      }
    } catch (error) {
      console.error("Lỗi upload video:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadTaiLieu = async (
    phanId: string,
    baiGiangId: string,
    file: File,
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      formData.append("tenTaiLieu", file.name);
      formData.append("document", file);
      const res = await taiLieuService.CreateTaiLieu(formData as any);
      if (res.status !== false && res.data) {
        capNhatTaiLieu(phanId, baiGiangId, res.data);
      }
    } catch (error) {
      console.error("Lỗi upload tài liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const xoaTaiLieuHandler = async (
    phanId: string,
    baiGiangId: string,
    taiLieuId: string,
  ) => {
    if (!confirm("Xóa tài liệu này?")) return;
    try {
      const res = await taiLieuService.DeleteTaiLieu(taiLieuId);
      if (res.status !== false) {
        xoaTaiLieu(phanId, baiGiangId, taiLieuId);
      }
    } catch (error) {
      console.error("Lỗi xóa tài liệu:", error);
    }
  };

  const toggleMuc = (mucId: string) => {
    setMucMoRong((prev) => ({ ...prev, [mucId]: !prev[mucId] }));
  };

  const moMuc = (mucId: string) => {
    setMucMoRong((prev) => ({ ...prev, [mucId]: true }));
  };

  const tongThoiLuong = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongThoiLuong / 60);

  const nutPillSx = {
    textTransform: "none",
    fontWeight: 700,
    color: MAU.chinh,
    border: `1px solid ${MAU.chinh}`,
    borderRadius: "8px",
    px: 1.5,
    py: 0.25,
    fontSize: 12.5,
    lineHeight: 1.6,
    bgcolor: "#fff",
    whiteSpace: "nowrap",
    "&:hover": { bgcolor: `${MAU.chinh}0F` },
  } as const;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", pb: 12, bgcolor: "#FBFBFD" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 24, color: "#1F2937" }}>
          Chương trình giảng dạy
        </Typography>
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon fontSize="small" />}
          onClick={onTaiLenHangLoat}
          sx={{
            flexShrink: 0,
            textTransform: "none",
            fontWeight: 700,
            color: MAU.chinh,
            borderColor: MAU.chinh,
            borderRadius: "10px",
            "&:hover": { bgcolor: `${MAU.chinh}0F`, borderColor: MAU.chinh },
          }}
        >
          Trình tải lên hàng loạt
        </Button>
      </Box>
      <Box sx={{ borderBottom: "1px solid #EDEFF3", mb: 3 }} />

      <Typography
        sx={{ fontSize: 13.5, color: "#8A93A3", mb: 1, lineHeight: 1.7 }}
      >
        Hãy thiết kế khóa học của bạn theo từng phần, mỗi phần tập trung vào một
        mục tiêu học tập duy nhất. Sau đó, thêm nội dung, hoạt động thực hành và
        bài kiểm tra.
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#8A93A3", mb: 3 }}>
        Tổng thời lượng: {tongPhut} phút
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress sx={{ color: MAU.chinh }} />
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {phans.map((phan, idx) => {
          const phanId = phan.id as string;
          const dsMuc = layDanhSachMucHienThi(phan);
          return (
            <Box
              key={phanId}
              sx={{
                border: "1px solid #EDEFF3",
                borderRadius: "16px",
                overflow: "hidden",
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(16,24,40,0.02)",
                transition: "box-shadow .2s ease, border-color .2s ease",
                "&:hover": {
                  borderColor: MAU.chinh + "40",
                  boxShadow: "0 4px 16px rgba(16,24,40,0.05)",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${MAU.chinh}0F`,
                    color: MAU.chinh,
                    flexShrink: 0,
                  }}
                >
                  <ArticleOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#1F2937",
                    flexShrink: 0,
                  }}
                >
                  Phần {idx + 1}:
                </Typography>
                <TextField
                  variant="standard"
                  value={phan.tenPhan ?? ""}
                  onChange={(e) =>
                    capNhatPhan(phanId, { tenPhan: e.target.value })
                  }
                  sx={{
                    flex: 1,
                    "& .MuiInputBase-input": { fontWeight: 700, fontSize: 15 },
                    "& .MuiInput-underline:before": { display: "none" },
                    "& .MuiInput-underline:after": { borderColor: MAU.chinh },
                  }}
                />
                <IconButton size="small" onClick={() => xoaPhan(phanId)}>
                  <DeleteIcon fontSize="small" sx={{ color: "#8A93A3" }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    setPhanMoRong((prev) => ({
                      ...prev,
                      [phanId]: !prev[phanId],
                    }))
                  }
                >
                  {phanMoRong[phanId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={phanMoRong[phanId]}>
                <Box
                  sx={{
                    mx: 2,
                    mb: 2,
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#FBFBFC",
                    border: "1px solid #EDEFF3",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                  }}
                >
                  {dsMuc.map((muc, mucIdx) => {
                    const mucId = muc.data.id as string;
                    const daCoNoiDung = mucDaCoNoiDung(muc);
                    const dangMoRong = !!mucMoRong[mucId];
                    return (
                      <Box
                        key={mucId}
                        sx={{
                          bgcolor: "#fff",
                          border: "1px solid #E3E6EB",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Hàng tiêu đề - luôn hiển thị, thu gọn theo mặc định */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.75,
                            py: 1.25,
                          }}
                        >
                          {daCoNoiDung ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: MAU.chinh }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              sx={{ fontSize: 18, color: "#8A93A3" }}
                            />
                          )}
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: "#8A93A3",
                              flexShrink: 0,
                            }}
                          >
                            {muc.kind === "BaiGiang"
                              ? "Bài giảng"
                              : "Bài kiểm tra"}{" "}
                            {mucIdx + 1}:
                          </Typography>
                          {muc.kind === "BaiGiang" ? (
                            <PlayCircleIcon
                              sx={{
                                fontSize: 16,
                                color: MAU.chinh,
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <QuizOutlinedIcon
                              sx={{
                                fontSize: 16,
                                color: MAU.chinh,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {muc.kind === "BaiGiang" ? (
                            <TextField
                              variant="standard"
                              value={muc.data.tieuDe ?? ""}
                              onChange={(e) =>
                                capNhatBaiGiang(phanId, mucId, {
                                  tieuDe: e.target.value,
                                })
                              }
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                "& .MuiInputBase-input": {
                                  fontWeight: 600,
                                  fontSize: 14,
                                },
                                "& .MuiInput-underline:before": {
                                  display: "none",
                                },
                                "& .MuiInput-underline:after": {
                                  borderColor: MAU.chinh,
                                },
                              }}
                            />
                          ) : (
                            <TextField
                              variant="standard"
                              value={muc.data.tenBaiKiemTra ?? ""}
                              onChange={(e) =>
                                capNhatBaiKiemTra(phanId, mucId, {
                                  tenBaiKiemTra: e.target.value,
                                })
                              }
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                "& .MuiInputBase-input": {
                                  fontWeight: 600,
                                  fontSize: 14,
                                },
                                "& .MuiInput-underline:before": {
                                  display: "none",
                                },
                                "& .MuiInput-underline:after": {
                                  borderColor: MAU.chinh,
                                },
                              }}
                            />
                          )}

                          {!daCoNoiDung && (
                            <Button
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                              onClick={() => moMuc(mucId)}
                              sx={nutPillSx}
                            >
                              Nội dung
                            </Button>
                          )}

                          <IconButton
                            size="small"
                            onClick={() =>
                              muc.kind === "BaiGiang"
                                ? xoaBaiGiang(phanId, mucId)
                                : xoaBaiKiemTra(phanId, mucId)
                            }
                          >
                            <DeleteIcon
                              fontSize="small"
                              sx={{ color: "#8A93A3" }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => toggleMuc(mucId)}
                          >
                            {dangMoRong ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Box>

                        {/* Nội dung chi tiết - thu gọn theo mặc định, mở khi bấm mũi tên hoặc "+ Nội dung" */}
                        <Collapse in={dangMoRong}>
                          <Box
                            sx={{
                              px: 1.75,
                              pb: 1.75,
                              pt: 0.5,
                              borderTop: "1px solid #E3E6EB",
                            }}
                          >
                            {muc.kind === "BaiGiang" && (
                              <>
                                {muc.data.urlBaiGiang ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      flexWrap: "wrap",
                                      pt: 1.5,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 88,
                                        height: 56,
                                        borderRadius: "8px",
                                        bgcolor: `${MAU.chinh}0F`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <PlayCircleIcon
                                        sx={{ color: MAU.chinh }}
                                      />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: 600,
                                          fontSize: 13.5,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Video đã tải lên
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontSize: 12.5,
                                          color: "#8A93A3",
                                        }}
                                      >
                                        {dinhDangThoiLuong(
                                          muc.data.thoiLuong ?? 0,
                                        )}
                                      </Typography>
                                    </Box>
                                    <Button
                                      component="label"
                                      size="small"
                                      startIcon={
                                        <EditOutlinedIcon fontSize="small" />
                                      }
                                      sx={{
                                        textTransform: "none",
                                        color: MAU.chinh,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Thay video
                                      <input
                                        type="file"
                                        accept="video/*"
                                        hidden
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            uploadVideo(phanId, mucId, file);
                                        }}
                                      />
                                    </Button>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: 12.5,
                                          color: "#8A93A3",
                                        }}
                                      >
                                        Miễn phí xem thử:
                                      </Typography>
                                      <Switch
                                        size="small"
                                        checked={!!muc.data.laBaiGiangFree}
                                        onChange={(e) =>
                                          capNhatBaiGiang(phanId, mucId, {
                                            laBaiGiangFree: e.target.checked,
                                          })
                                        }
                                      />
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    component="label"
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                      py: 3,
                                      mt: 1.5,
                                      border: "1px dashed #E3E6EB",
                                      borderRadius: "10px",
                                      cursor: "pointer",
                                      "&:hover": {
                                        borderColor: MAU.chinh,
                                        bgcolor: `${MAU.chinh}0F`,
                                      },
                                    }}
                                  >
                                    <PlayCircleIcon
                                      sx={{ color: MAU.chinh, opacity: 0.6 }}
                                    />
                                    <Typography
                                      sx={{ fontSize: 13, fontWeight: 600 }}
                                    >
                                      Tải lên video cho bài giảng này
                                    </Typography>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      hidden
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file)
                                          uploadVideo(phanId, mucId, file);
                                      }}
                                    />
                                  </Box>
                                )}

                                <Box sx={{ mt: 2 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: 13,
                                      color: "#8A93A3",
                                      mb: 1,
                                    }}
                                  >
                                    Tài liệu kèm theo
                                  </Typography>
                                  <List dense disablePadding>
                                    {(muc.data.danhSachTaiLieu ?? []).map(
                                      (tl: TaiLieuType) => (
                                        <ListItem
                                          key={tl.id}
                                          secondaryAction={
                                            <IconButton
                                              edge="end"
                                              size="small"
                                              onClick={() =>
                                                xoaTaiLieuHandler(
                                                  phanId,
                                                  mucId,
                                                  tl.id as string,
                                                )
                                              }
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          }
                                        >
                                          <ListItemIcon>
                                            <AttachFileIcon fontSize="small" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={tl.tenTaiLieu}
                                            secondary={tl.loaiTaiLieu}
                                          />
                                        </ListItem>
                                      ),
                                    )}
                                  </List>
                                  <Button
                                    component="label"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    sx={{
                                      textTransform: "none",
                                      color: MAU.chinh,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Thêm tài liệu
                                    <input
                                      type="file"
                                      hidden
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file)
                                          uploadTaiLieu(phanId, mucId, file);
                                      }}
                                    />
                                  </Button>
                                </Box>
                              </>
                            )}

                            {muc.kind === "BaiKiemTra" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1.5,
                                  pt: 1.5,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={`${(muc.data as any).soCauHoi ?? 0} câu hỏi`}
                                  sx={{
                                    bgcolor:
                                      ((muc.data as any).soCauHoi ?? 0) === 0
                                        ? MAU.canhBaoNen
                                        : MAU.thanhCongNen,
                                    color:
                                      ((muc.data as any).soCauHoi ?? 0) === 0
                                        ? MAU.canhBaoChu
                                        : MAU.thanhCongChu,
                                    fontWeight: 700,
                                  }}
                                />
                                <Button
                                  size="small"
                                  onClick={() => onQuanLyCauHoi?.(mucId)}
                                  sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    color: MAU.chinh,
                                  }}
                                >
                                  Quản lý câu hỏi
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={(e) =>
                      setAnchorThemMuc({
                        el: e.currentTarget,
                        phanId,
                      })
                    }
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      fontWeight: 700,
                      color: MAU.chinh,
                      border: `1px solid ${MAU.chinh}`,
                      borderRadius: "10px",
                      px: 2,
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: `${MAU.chinh}0F` },
                    }}
                  >
                    Mục trong chương trình giảng dạy
                  </Button>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Button
        startIcon={<AddIcon />}
        onClick={themPhan}
        disabled={loading}
        sx={{
          mt: 2.5,
          textTransform: "none",
          fontWeight: 700,
          color: MAU.chinh,
          border: `1px solid ${MAU.chinh}`,
          borderRadius: "10px",
          px: 2,
          bgcolor: "#fff",
          "&:hover": { bgcolor: `${MAU.chinh}0F` },
        }}
      >
        Phần
      </Button>

      <Menu
        anchorEl={anchorThemMuc?.el ?? null}
        open={Boolean(anchorThemMuc)}
        onClose={() => setAnchorThemMuc(null)}
      >
        <MenuItem
          onClick={() => anchorThemMuc && themBaiGiang(anchorThemMuc.phanId)}
        >
          <PlayCircleIcon sx={{ fontSize: 18, mr: 1, color: MAU.chinh }} />
          Bài giảng
        </MenuItem>
        <MenuItem
          onClick={() => anchorThemMuc && themBaiKiemTra(anchorThemMuc.phanId)}
        >
          <QuizOutlinedIcon sx={{ fontSize: 18, mr: 1, color: MAU.chinh }} />
          Bài kiểm tra
        </MenuItem>
      </Menu>
    </Box>
  );
}
