import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, PageBreak,
  Header, Footer, PageNumber, NumberFormat, ShadingType,
  TableLayoutType, VerticalAlign, convertInchesToTwip
} from "docx";
import fs from "fs";

// ============================================================
// COLOR PALETTE & STYLES
// ============================================================
const COLORS = {
  PRIMARY: "1B4F72",
  PRIMARY_LIGHT: "2E86C1",
  ACCENT: "E74C3C",
  HEADING: "1B4F72",
  HEADING_BG: "D4E6F1",
  TABLE_HEADER: "1B4F72",
  TABLE_HEADER_TEXT: "FFFFFF",
  TABLE_ALT_ROW: "EBF5FB",
  TABLE_BORDER: "85929E",
  TEXT: "2C3E50",
  SUBTEXT: "566573",
  WHITE: "FFFFFF",
  STUDENT_BG: "D5F5E3",
  STUDENT_HEADER: "1E8449",
  INSTRUCTOR_BG: "D6EAF8",
  INSTRUCTOR_HEADER: "2874A6",
  ADMIN_BG: "FADBD8",
  ADMIN_HEADER: "C0392B",
  NOTE_BG: "FEF9E7",
  NOTE_BORDER: "F39C12",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 52,
        color: COLORS.PRIMARY,
        font: "Times New Roman",
      }),
    ],
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: text,
        size: 28,
        color: COLORS.SUBTEXT,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.PRIMARY },
    },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 36,
        color: COLORS.HEADING,
        font: "Times New Roman",
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 30,
        color: COLORS.PRIMARY_LIGHT,
        font: "Times New Roman",
      }),
    ],
  });
}

function createHeading3(text, color = COLORS.TEXT) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26,
        color: color,
        font: "Times New Roman",
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    alignment: options.align || AlignmentType.JUSTIFIED,
    indent: options.indent ? { left: convertInchesToTwip(0.3) } : undefined,
    children: [
      new TextRun({
        text: text,
        size: options.size || 24,
        color: options.color || COLORS.TEXT,
        font: "Times New Roman",
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function createBullet(text, level = 0) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: convertInchesToTwip(0.3 + level * 0.3) },
    children: [
      new TextRun({ text: "• ", bold: true, size: 24, color: COLORS.PRIMARY, font: "Times New Roman" }),
      new TextRun({ text: text, size: 24, color: COLORS.TEXT, font: "Times New Roman" }),
    ],
  });
}

function emptyParagraph() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function createTableCell(text, options = {}) {
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options.shading ? { type: ShadingType.SOLID, color: options.shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: options.align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            size: options.size || 22,
            color: options.color || COLORS.TEXT,
            font: "Times New Roman",
            bold: options.bold || false,
          }),
        ],
      }),
    ],
  });
}

function createHeaderCell(text, width) {
  return createTableCell(text, {
    width,
    shading: COLORS.TABLE_HEADER,
    color: COLORS.TABLE_HEADER_TEXT,
    bold: true,
    align: AlignmentType.CENTER,
  });
}

function tableBorders() {
  const b = { style: BorderStyle.SINGLE, size: 1, color: COLORS.TABLE_BORDER };
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}

// ============================================================
// USE CASE DETAIL SECTION BUILDER
// ============================================================
function buildUseCaseDetail(uc, actorColor) {
  const sections = [];
  const rows = [];
  
  // Helper for text
  const formatTextAsParagraphs = (text) => {
    if (!text || text === "—") return [new Paragraph({ children: [new TextRun({ text: "—", size: 22, font: "Times New Roman" })] })];
    return String(text).split('\n').map(t => new Paragraph({
      children: [new TextRun({ text: t, size: 22, font: "Times New Roman" })]
    }));
  };

  const addRow = (label, contentParas) => {
    rows.push(new TableRow({
      children: [
        createTableCell(label, { width: 30, bold: true }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: contentParas
        })
      ]
    }));
  };

  const addSimpleRow = (label, text) => {
    addRow(label, formatTextAsParagraphs(text));
  };

  // Row 1: Thành phần | Tên UC
  rows.push(new TableRow({
    children: [
      createTableCell("Thành phần", { width: 30, bold: true, shading: "1B4F72", color: "FFFFFF" }),
      createTableCell(uc.nameVi, { width: 70, bold: true, shading: "1B4F72", color: "FFFFFF" })
    ]
  }));

  addSimpleRow("ID", uc.id);
  addSimpleRow("Tên UC", uc.nameVi);
  addSimpleRow("Độ ưu tiên", "Cao");
  addSimpleRow("Tác nhân chính (actors)", uc.primaryActor);
  addSimpleRow("Tác nhân phụ", uc.secondaryActor);
  addSimpleRow("Mô tả", uc.goal);
  
  // Format precondition
  let preCondText = uc.precondition;
  if (preCondText && preCondText !== "—") {
    preCondText = preCondText.split('\n').map(l => {
      // replace "1. " or "2. " with "- " to match image format roughly, or just keep as is
      return l.replace(/^\d+\.\s*/, '- ');
    }).join('\n');
  }
  addSimpleRow("Điều kiện trước (Pre)", preCondText);

  // Main flow formatting
  let mainFlowParas = [];
  if (uc.mainFlow && uc.mainFlow.length > 0) {
    mainFlowParas = uc.mainFlow.map(s => {
      let text = "";
      if (s.actor && s.actor !== "—" && s.system && s.system !== "—") {
        text = `${s.step}. Người dùng: ${s.actor}. Hệ thống: ${s.system}`;
      } else if (s.actor && s.actor !== "—") {
        text = `${s.step}. ${s.actor}`;
      } else {
        text = `${s.step}. ${s.system}`;
      }
      return new Paragraph({ children: [new TextRun({ text: text, size: 22, font: "Times New Roman" })] });
    });
  } else {
    mainFlowParas = formatTextAsParagraphs("—");
  }
  addRow("Luồng sự kiện chính", mainFlowParas);

  // Alt flow formatting
  let altFlowParas = [];
  if (uc.altFlow && uc.altFlow.length > 0) {
    altFlowParas = uc.altFlow.map((af, idx) => {
      let text = `${idx + 1}.a. Nếu ${af.condition}, ${af.handling}`;
      return new Paragraph({ children: [new TextRun({ text: text, size: 22, font: "Times New Roman" })] });
    });
  } else {
    altFlowParas = formatTextAsParagraphs("—");
  }
  addRow("Luồng thay thế", altFlowParas);

  // Ex flow formatting
  let exFlowParas = [];
  if (uc.exFlow && uc.exFlow.length > 0) {
    exFlowParas = uc.exFlow.map((ef, idx) => {
      let text = `${idx + 1}.b. Nếu ${ef.condition}, ${ef.handling}`;
      return new Paragraph({ children: [new TextRun({ text: text, size: 22, font: "Times New Roman" })] });
    });
  } else {
    exFlowParas = formatTextAsParagraphs("—");
  }
  addRow("Luồng ngoại lệ", exFlowParas);

  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: rows
  }));

  sections.push(emptyParagraph());
  return sections;
}

// ============================================================
// ALL USE CASE DATA
// ============================================================

const studentUseCases = [
  {
    id: "UC-STUDENT-001", nameVi: "Đăng ký tài khoản", nameEn: "Register Account",
    goal: "Cho phép người dùng mới tạo tài khoản trên hệ thống EduVerse để trở thành học viên",
    primaryActor: "Student (Khách truy cập)", secondaryActor: "Notification Service",
    precondition: "1. Người dùng chưa có tài khoản trên hệ thống.\n2. Có kết nối Internet và trình duyệt hỗ trợ.",
    postcondition: "1. Tài khoản mới được tạo trong bảng AppUser.\n2. Vai trò \"Student\" được gán.\n3. Email xác thực được gửi.",
    mainFlow: [
      { step: 1, actor: "Truy cập trang đăng ký", system: "Hiển thị form đăng ký" },
      { step: 2, actor: "Nhập: Họ tên, Email, Mật khẩu, Xác nhận MK", system: "—" },
      { step: 3, actor: "Click \"Đăng ký\"", system: "—" },
      { step: 4, actor: "—", system: "Kiểm tra dữ liệu đầu vào (validate)" },
      { step: 5, actor: "—", system: "Kiểm tra email chưa tồn tại" },
      { step: 6, actor: "—", system: "Mã hóa mật khẩu (hash + salt)" },
      { step: 7, actor: "—", system: "Tạo AppUser mới với Role = \"Student\"" },
      { step: 8, actor: "—", system: "Gửi email xác thực" },
      { step: 9, actor: "—", system: "Hiển thị \"Đăng ký thành công\"" },
      { step: 10, actor: "Click link xác thực trong email", system: "Xác nhận email, kích hoạt tài khoản" },
    ],
    altFlow: [
      { code: "AF-001-1", condition: "Đăng ký bằng Google/Facebook", handling: "Click OAuth → Nhận thông tin → Tạo TK → Bỏ qua xác thực email" },
      { code: "AF-001-2", condition: "Đã có tài khoản", handling: "Hiển thị link \"Đăng nhập\" và thông báo \"Email đã đăng ký\"" },
    ],
    exFlow: [
      { code: "EF-001-1", condition: "Email không hợp lệ", handling: "Hiển thị \"Email không đúng định dạng\"" },
      { code: "EF-001-2", condition: "Mật khẩu không đủ mạnh", handling: "Hiển thị yêu cầu >= 8 ký tự, chữ hoa, thường, số, đặc biệt" },
      { code: "EF-001-3", condition: "Xác nhận MK không khớp", handling: "Hiển thị \"Xác nhận mật khẩu không khớp\"" },
      { code: "EF-001-4", condition: "Lỗi gửi email", handling: "Lưu tài khoản, cho phép gửi lại email sau" },
    ],
  },
  {
    id: "UC-STUDENT-002", nameVi: "Đăng nhập", nameEn: "Login",
    goal: "Cho phép người dùng đã đăng ký xác thực danh tính để truy cập hệ thống",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "1. Đã có tài khoản và đã xác thực email.\n2. Tài khoản không bị khóa.",
    postcondition: "1. Phiên đăng nhập được tạo (JWT + RefreshToken).\n2. Chuyển đến trang chủ.",
    mainFlow: [
      { step: 1, actor: "Truy cập trang đăng nhập", system: "Hiển thị form đăng nhập" },
      { step: 2, actor: "Nhập Email và Mật khẩu", system: "—" },
      { step: 3, actor: "Click \"Đăng nhập\"", system: "—" },
      { step: 4, actor: "—", system: "Xác thực thông tin qua ASP.NET Identity" },
      { step: 5, actor: "—", system: "Tạo JWT Access Token + lưu RefreshToken" },
      { step: 6, actor: "—", system: "Trả về token và thông tin người dùng" },
      { step: 7, actor: "—", system: "Chuyển hướng đến trang chủ" },
    ],
    altFlow: [
      { code: "AF-002-1", condition: "Đăng nhập bằng Google", handling: "Redirect OAuth → Callback /auth/oauth-callback → Tạo token" },
      { code: "AF-002-2", condition: "Đăng nhập bằng Facebook", handling: "Tương tự AF-002-1 với Facebook Provider" },
    ],
    exFlow: [
      { code: "EF-002-1", condition: "Sai email hoặc mật khẩu", handling: "Hiển thị \"Email hoặc mật khẩu không chính xác\"" },
      { code: "EF-002-2", condition: "Tài khoản bị khóa", handling: "Hiển thị \"Tài khoản đã bị khóa\"" },
      { code: "EF-002-3", condition: "Email chưa xác thực", handling: "Hiển thị \"Vui lòng xác thực email\" + gửi lại" },
      { code: "EF-002-4", condition: "Sai > 5 lần", handling: "Khóa tạm thời 15 phút" },
    ],
  },
  {
    id: "UC-STUDENT-003", nameVi: "Đăng xuất", nameEn: "Logout",
    goal: "Cho phép người dùng kết thúc phiên đăng nhập an toàn",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Người dùng đang đăng nhập.",
    postcondition: "JWT Token vô hiệu, RefreshToken thu hồi, phiên kết thúc.",
    mainFlow: [
      { step: 1, actor: "Click avatar → \"Đăng xuất\"", system: "—" },
      { step: 2, actor: "—", system: "Thu hồi RefreshToken (DaBiThuHoi = true)" },
      { step: 3, actor: "—", system: "Xóa JWT Token phía client" },
      { step: 4, actor: "—", system: "Chuyển hướng về trang chủ (khách)" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-004", nameVi: "Quên mật khẩu", nameEn: "Forgot Password",
    goal: "Cho phép người dùng đặt lại mật khẩu khi quên",
    primaryActor: "Student", secondaryActor: "Notification Service",
    precondition: "1. Đã có tài khoản.\n2. Có quyền truy cập email đăng ký.",
    postcondition: "1. Mật khẩu mới được cập nhật.\n2. Phiên cũ bị vô hiệu hóa.",
    mainFlow: [
      { step: 1, actor: "Click \"Quên mật khẩu?\"", system: "Hiển thị form nhập email" },
      { step: 2, actor: "Nhập email đã đăng ký", system: "—" },
      { step: 3, actor: "Click \"Gửi yêu cầu\"", system: "—" },
      { step: 4, actor: "—", system: "Kiểm tra email tồn tại" },
      { step: 5, actor: "—", system: "Tạo token đặt lại (24h)" },
      { step: 6, actor: "—", system: "Gửi email link đặt lại" },
      { step: 7, actor: "Click link trong email", system: "Hiển thị form mật khẩu mới" },
      { step: 8, actor: "Nhập MK mới & xác nhận", system: "—" },
      { step: 9, actor: "—", system: "Cập nhật MK mới, vô hiệu RefreshToken cũ" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-004-1", condition: "Email không tồn tại", handling: "Vẫn hiển thị \"Đã gửi email\" (bảo mật)" },
      { code: "EF-004-2", condition: "Link hết hạn", handling: "Hiển thị \"Link đã hết hạn\" + gửi lại" },
    ],
  },
  {
    id: "UC-STUDENT-005", nameVi: "Quản lý hồ sơ cá nhân", nameEn: "Manage Profile",
    goal: "Cho phép học viên xem và cập nhật thông tin cá nhân",
    primaryActor: "Student", secondaryActor: "Cloud Storage",
    precondition: "Đã đăng nhập.", postcondition: "Thông tin hồ sơ được cập nhật trong AppUser.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Hồ sơ cá nhân\"", system: "Hiển thị thông tin hiện tại" },
      { step: 2, actor: "Chỉnh sửa thông tin", system: "—" },
      { step: 3, actor: "(Tùy chọn) Tải ảnh đại diện", system: "Upload ảnh Cloud Storage" },
      { step: 4, actor: "Click \"Lưu thay đổi\"", system: "—" },
      { step: 5, actor: "—", system: "Validate & cập nhật AppUser" },
      { step: 6, actor: "—", system: "Hiển thị \"Cập nhật thành công\"" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-005-1", condition: "Ảnh > 5MB", handling: "Hiển thị \"Kích thước ảnh tối đa 5MB\"" },
    ],
  },
  {
    id: "UC-STUDENT-006", nameVi: "Đổi mật khẩu", nameEn: "Change Password",
    goal: "Cho phép học viên thay đổi mật khẩu hiện tại",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng nhập.", postcondition: "Mật khẩu mới được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Đổi mật khẩu\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: MK hiện tại, MK mới, Xác nhận MK mới", system: "—" },
      { step: 3, actor: "Click \"Đổi mật khẩu\"", system: "—" },
      { step: 4, actor: "—", system: "Xác thực MK hiện tại → Hash MK mới → Cập nhật DB" },
      { step: 5, actor: "—", system: "Hiển thị \"Đổi mật khẩu thành công\"" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-006-1", condition: "MK hiện tại sai", handling: "Hiển thị \"Mật khẩu hiện tại không đúng\"" },
      { code: "EF-006-2", condition: "MK mới trùng cũ", handling: "Hiển thị \"MK mới phải khác MK cũ\"" },
    ],
  },
  {
    id: "UC-STUDENT-007", nameVi: "Tìm kiếm khóa học", nameEn: "Search Courses",
    goal: "Cho phép tìm kiếm khóa học theo từ khóa",
    primaryActor: "Student (hoặc Khách)", secondaryActor: "—",
    precondition: "Không yêu cầu đăng nhập.", postcondition: "Hiển thị danh sách khóa học phù hợp.",
    mainFlow: [
      { step: 1, actor: "Nhập từ khóa vào ô tìm kiếm", system: "—" },
      { step: 2, actor: "Nhấn Enter", system: "—" },
      { step: 3, actor: "—", system: "Truy vấn KhoaHoc theo TieuDe, MoTa (đã duyệt)" },
      { step: 4, actor: "—", system: "Sắp xếp theo mức độ liên quan" },
      { step: 5, actor: "—", system: "Hiển thị kết quả + phân trang" },
    ],
    altFlow: [{ code: "AF-007-1", condition: "Autocomplete", handling: "Gõ ≥ 2 ký tự → Dropdown gợi ý" }],
    exFlow: [{ code: "EF-007-1", condition: "Không có kết quả", handling: "Hiển thị gợi ý khóa học phổ biến" }],
  },
  {
    id: "UC-STUDENT-008", nameVi: "Lọc khóa học", nameEn: "Filter Courses",
    goal: "Cho phép lọc khóa học theo nhiều tiêu chí",
    primaryActor: "Student (hoặc Khách)", secondaryActor: "—",
    precondition: "Đang ở trang danh sách khóa học.", postcondition: "Danh sách được lọc theo tiêu chí.",
    mainFlow: [
      { step: 1, actor: "Chọn bộ lọc: Danh mục, Cấp độ, Giá, Đánh giá", system: "—" },
      { step: 2, actor: "Click \"Áp dụng\"", system: "—" },
      { step: 3, actor: "—", system: "Truy vấn KhoaHoc theo điều kiện lọc" },
      { step: 4, actor: "—", system: "Hiển thị kết quả đã lọc + phân trang" },
    ],
    altFlow: [{ code: "AF-008-1", condition: "Xóa bộ lọc", handling: "Hiển thị lại toàn bộ khóa học" }],
    exFlow: [],
  },
  {
    id: "UC-STUDENT-009", nameVi: "Xem chi tiết khóa học", nameEn: "View Course Details",
    goal: "Cho phép xem toàn bộ thông tin chi tiết khóa học",
    primaryActor: "Student (hoặc Khách)", secondaryActor: "—",
    precondition: "Khóa học đã được duyệt.", postcondition: "Hiển thị đầy đủ thông tin khóa học.",
    mainFlow: [
      { step: 1, actor: "Click vào khóa học", system: "—" },
      { step: 2, actor: "—", system: "Truy vấn KhoaHoc, Phan, BaiGiang, DanhGia" },
      { step: 3, actor: "—", system: "Hiển thị: Tiêu đề, Mô tả, Giá, Cấp độ, Thời lượng" },
      { step: 4, actor: "—", system: "Hiển thị danh sách Phần & Bài giảng" },
      { step: 5, actor: "—", system: "Hiển thị đánh giá, thông tin GV" },
      { step: 6, actor: "—", system: "Hiển thị nút \"Mua\" / \"Bắt đầu học\"" },
    ],
    altFlow: [
      { code: "AF-009-1", condition: "Bài giảng free", handling: "Hiển thị icon \"Xem trước\"" },
      { code: "AF-009-2", condition: "Đã sở hữu", handling: "Hiển thị \"Tiếp tục học\"" },
    ],
    exFlow: [],
  },
  {
    id: "UC-STUDENT-010", nameVi: "Xem hồ sơ giảng viên", nameEn: "View Instructor Profile",
    goal: "Xem thông tin chi tiết về giảng viên",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Không yêu cầu đăng nhập.", postcondition: "Hiển thị trang hồ sơ giảng viên.",
    mainFlow: [
      { step: 1, actor: "Click vào tên/ảnh giảng viên", system: "—" },
      { step: 2, actor: "—", system: "Truy vấn AppUser (Instructor) + KhoaHoc" },
      { step: 3, actor: "—", system: "Hiển thị: Tên, Ảnh, Chuyên môn, Liên kết" },
      { step: 4, actor: "—", system: "Hiển thị danh sách khóa học & thống kê" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-011", nameVi: "Mua khóa học", nameEn: "Purchase Course",
    goal: "Cho phép học viên mua khóa học trả phí",
    primaryActor: "Student", secondaryActor: "Payment Gateway, Notification Service",
    precondition: "1. Đã đăng nhập.\n2. Chưa sở hữu khóa học này.",
    postcondition: "DonHang, DonHangChiTiet, DangKyKhoaHoc, ThanhToan được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Mua khóa học\"", system: "—" },
      { step: 2, actor: "—", system: "Kiểm tra đăng nhập & quyền sở hữu" },
      { step: 3, actor: "—", system: "Tạo GioHangChiTiet" },
      { step: 4, actor: "—", system: "Hiển thị trang thanh toán" },
      { step: 5, actor: "(Tùy chọn) Nhập mã giảm giá", system: "Kiểm tra KhuyenMai" },
      { step: 6, actor: "Chọn phương thức thanh toán", system: "—" },
      { step: 7, actor: "Click \"Thanh toán\"", system: "→ «include» UC-STUDENT-012" },
      { step: 8, actor: "—", system: "Tạo DonHang + DangKyKhoaHoc, gửi email" },
    ],
    altFlow: [
      { code: "AF-011-1", condition: "Khóa học miễn phí (Gia = 0)", handling: "Bỏ qua thanh toán → Tạo DangKyKhoaHoc trực tiếp" },
      { code: "AF-011-2", condition: "Thêm vào giỏ hàng", handling: "Thêm GioHang → Thanh toán nhiều KH cùng lúc" },
    ],
    exFlow: [
      { code: "EF-011-1", condition: "Đã sở hữu", handling: "Hiển thị \"Bạn đã sở hữu khóa học này\"" },
      { code: "EF-011-2", condition: "Mã giảm giá hết hạn", handling: "Hiển thị \"Mã giảm giá không hợp lệ\"" },
    ],
  },
  {
    id: "UC-STUDENT-012", nameVi: "Thanh toán trực tuyến", nameEn: "Online Payment",
    goal: "Xử lý thanh toán qua cổng thanh toán bên ngoài",
    primaryActor: "Student", secondaryActor: "Payment Gateway (VNPay/MoMo)",
    precondition: "Đơn hàng đã được tạo.", postcondition: "ThanhToan được tạo với trạng thái kết quả.",
    mainFlow: [
      { step: 1, actor: "—", system: "Tạo yêu cầu thanh toán (SoTien, MaGiaoDich)" },
      { step: 2, actor: "—", system: "Chuyển đến Payment Gateway" },
      { step: 3, actor: "Thực hiện thanh toán trên cổng", system: "—" },
      { step: 4, actor: "—", system: "Payment Gateway gọi callback" },
      { step: 5, actor: "—", system: "Xác thực callback → Tạo ThanhToan" },
      { step: 6, actor: "—", system: "Cập nhật DonHang → Chuyển hướng kết quả" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-012-1", condition: "Thanh toán thất bại", handling: "Ghi nhận lỗi, cho phép thử lại" },
      { code: "EF-012-2", condition: "Timeout", handling: "Đơn hàng \"Chờ xử lý\", cho thanh toán lại" },
    ],
  },
  {
    id: "UC-STUDENT-013", nameVi: "Xem lịch sử thanh toán", nameEn: "View Payment History",
    goal: "Xem lại các giao dịch thanh toán đã thực hiện",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng nhập.", postcondition: "Hiển thị danh sách giao dịch.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Lịch sử thanh toán\"", system: "—" },
      { step: 2, actor: "—", system: "Truy vấn DonHang JOIN ThanhToan" },
      { step: 3, actor: "—", system: "Hiển thị: MaGiaoDich, Ngày, SoTien, Trạng thái" },
      { step: 4, actor: "(Tùy chọn) Xem chi tiết", system: "Hiển thị DonHangChiTiet" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-014", nameVi: "Xem khóa học đã đăng ký", nameEn: "View Enrolled Courses",
    goal: "Hiển thị danh sách khóa học đã đăng ký/mua kèm tiến độ",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng nhập.", postcondition: "Hiển thị danh sách khóa học đã đăng ký.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Khóa học của tôi\"", system: "—" },
      { step: 2, actor: "—", system: "Truy vấn DangKyKhoaHoc JOIN KhoaHoc" },
      { step: 3, actor: "—", system: "Tính tiến độ từ TienDoHocTap" },
      { step: 4, actor: "—", system: "Hiển thị: Ảnh, Tiêu đề, Thanh tiến độ" },
      { step: 5, actor: "Click vào khóa học", system: "Chuyển đến trang học" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-015", nameVi: "Học video bài giảng", nameEn: "Watch Video Lecture",
    goal: "Xem video bài giảng trong khóa học đã đăng ký",
    primaryActor: "Student", secondaryActor: "Cloud Storage",
    precondition: "1. Đã đăng ký khóa học.\n2. BaiGiang loại \"Video\".",
    postcondition: "TienDoHocTap được cập nhật (ThoiGianXem, LanCuoiXem).",
    mainFlow: [
      { step: 1, actor: "Chọn bài giảng", system: "—" },
      { step: 2, actor: "—", system: "Kiểm tra quyền truy cập" },
      { step: 3, actor: "—", system: "Load video từ Cloud Storage" },
      { step: 4, actor: "Xem video", system: "Theo dõi thời gian xem" },
      { step: 5, actor: "—", system: "Xem ≥ 90%: Đánh dấu hoàn thành" },
    ],
    altFlow: [
      { code: "AF-015-1", condition: "Bài giảng free", handling: "Cho phép xem không cần đăng ký" },
      { code: "AF-015-2", condition: "Tiếp tục xem dở", handling: "Tự động seek đến LanCuoiXem" },
    ],
    exFlow: [],
  },
  {
    id: "UC-STUDENT-016", nameVi: "Tải tài liệu học tập", nameEn: "Download Learning Materials",
    goal: "Tải tài liệu đính kèm bài giảng",
    primaryActor: "Student", secondaryActor: "Cloud Storage",
    precondition: "1. Đã đăng ký.\n2. Bài giảng có tài liệu đính kèm.",
    postcondition: "Tài liệu được tải về máy.",
    mainFlow: [
      { step: 1, actor: "Click tài liệu", system: "—" },
      { step: 2, actor: "—", system: "Kiểm tra quyền → Tải file từ Cloud Storage" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-017", nameVi: "Làm bài kiểm tra", nameEn: "Take Quiz",
    goal: "Thực hiện bài kiểm tra trong khóa học",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "1. Đã đăng ký.\n2. BaiKiemTra đang hoạt động.",
    postcondition: "LanLamBaiKiemTra, ChiTietLamBaiKiemTra, KetQuaBaiThi được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Bắt đầu kiểm tra\"", system: "—" },
      { step: 2, actor: "—", system: "Kiểm tra SoLanLamToiDa" },
      { step: 3, actor: "—", system: "Tạo LanLamBaiKiemTra" },
      { step: 4, actor: "—", system: "Load CauHoi + DapAn + bộ đếm thời gian" },
      { step: 5, actor: "Chọn đáp án từng câu hỏi", system: "—" },
      { step: 6, actor: "Click \"Nộp bài\"", system: "—" },
      { step: 7, actor: "—", system: "Lưu ChiTietLamBaiKiemTra → Tính điểm" },
      { step: 8, actor: "—", system: "Hiển thị kết quả: Điểm, Số câu đúng, Đạt/Không" },
    ],
    altFlow: [{ code: "AF-017-1", condition: "Cho phép làm lại", handling: "Hiển thị nút \"Làm lại\" nếu còn lượt" }],
    exFlow: [
      { code: "EF-017-1", condition: "Hết thời gian", handling: "Tự động nộp bài" },
      { code: "EF-017-2", condition: "Hết lượt làm", handling: "Hiển thị \"Đã hết lượt\"" },
    ],
  },
  {
    id: "UC-STUDENT-018", nameVi: "Nộp bài tập", nameEn: "Submit Assignment",
    goal: "Nộp bài tập theo yêu cầu giảng viên",
    primaryActor: "Student", secondaryActor: "Cloud Storage, Notification Service",
    precondition: "1. Đã đăng ký.\n2. Bài tập trong thời hạn nộp.",
    postcondition: "Bài tập được lưu, giảng viên nhận thông báo.",
    mainFlow: [
      { step: 1, actor: "Truy cập bài tập", system: "Hiển thị đề bài + form nộp" },
      { step: 2, actor: "Tải file bài tập", system: "—" },
      { step: 3, actor: "Click \"Nộp bài\"", system: "—" },
      { step: 4, actor: "—", system: "Upload Cloud → Lưu DB → Gửi thông báo GV" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-019", nameVi: "Đánh dấu hoàn thành bài học", nameEn: "Mark Lesson Complete",
    goal: "Cập nhật trạng thái hoàn thành cho từng bài học",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng ký khóa học.", postcondition: "TienDoHocTap.TrangThai = \"Hoàn thành\".",
    mainFlow: [
      { step: 1, actor: "Click checkbox hoặc xem video ≥ 90%", system: "—" },
      { step: 2, actor: "—", system: "Cập nhật TienDoHocTap" },
      { step: 3, actor: "—", system: "Cập nhật icon ✅ + tính lại tiến độ" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-020", nameVi: "Theo dõi tiến độ học tập", nameEn: "Track Learning Progress",
    goal: "Hiển thị tiến độ học tập tổng thể và chi tiết",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng ký ≥ 1 khóa học.", postcondition: "Hiển thị dashboard tiến độ.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Tiến độ học tập\"", system: "—" },
      { step: 2, actor: "—", system: "Tính: Tổng bài, Số bài hoàn thành, % tiến độ" },
      { step: 3, actor: "—", system: "Hiển thị thanh tiến độ, chi tiết từng Phần" },
      { step: 4, actor: "—", system: "Nếu 100% → «extend» UC-STUDENT-022" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-021", nameVi: "Đánh giá khóa học", nameEn: "Review Course",
    goal: "Đánh giá và nhận xét khóa học đã học",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "1. Hoàn thành ≥ 30%.\n2. Chưa đánh giá.",
    postcondition: "DanhGia được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Đánh giá khóa học\"", system: "Hiển thị form" },
      { step: 2, actor: "Chọn số sao (1-5) + nhập nhận xét", system: "—" },
      { step: 3, actor: "Click \"Gửi đánh giá\"", system: "—" },
      { step: 4, actor: "—", system: "Tạo DanhGia → Cập nhật điểm TB" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-022", nameVi: "Nhận chứng chỉ", nameEn: "Receive Certificate",
    goal: "Cấp chứng chỉ hoàn thành khóa học",
    primaryActor: "Student", secondaryActor: "Notification Service",
    precondition: "100% bài học + Đạt tất cả bài kiểm tra.", postcondition: "ChungChi được tạo.",
    mainFlow: [
      { step: 1, actor: "—", system: "Kiểm tra 100% TienDoHocTap + Tất cả BaiKiemTra đạt" },
      { step: 2, actor: "—", system: "Tạo MaSoChungChi (EDU-YYYY-XXXXXX)" },
      { step: 3, actor: "—", system: "Tạo ChungChi + Generate PDF" },
      { step: 4, actor: "—", system: "Gửi thông báo + email chúc mừng" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-023", nameVi: "Tải chứng chỉ", nameEn: "Download Certificate",
    goal: "Tải chứng chỉ hoàn thành dưới dạng PDF",
    primaryActor: "Student", secondaryActor: "Cloud Storage",
    precondition: "ChungChi đã được cấp.", postcondition: "File PDF được tải về.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Chứng chỉ của tôi\"", system: "Hiển thị danh sách" },
      { step: 2, actor: "Click \"Tải xuống\"", system: "—" },
      { step: 3, actor: "—", system: "Truy cập URL_ChungChi → Tải file" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-024", nameVi: "Tham gia thảo luận", nameEn: "Join Discussion",
    goal: "Tham gia thảo luận trong khóa học",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng ký khóa học.", postcondition: "HoiDap được tạo.",
    mainFlow: [
      { step: 1, actor: "Truy cập tab \"Thảo luận\"", system: "Hiển thị danh sách HoiDap" },
      { step: 2, actor: "Nhập nội dung → \"Đăng\"", system: "—" },
      { step: 3, actor: "—", system: "Tạo HoiDap mới" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-025", nameVi: "Đặt câu hỏi cho giảng viên", nameEn: "Ask Instructor Question",
    goal: "Gửi câu hỏi trực tiếp đến giảng viên",
    primaryActor: "Student", secondaryActor: "Notification Service",
    precondition: "Đã đăng ký khóa học.", postcondition: "Câu hỏi được gửi, GV nhận thông báo.",
    mainFlow: [
      { step: 1, actor: "Click \"Đặt câu hỏi\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập nội dung → \"Gửi\"", system: "—" },
      { step: 3, actor: "—", system: "Tạo HoiDap + Gửi ThongBao đến GV" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-STUDENT-026", nameVi: "Xem lịch sử học tập", nameEn: "View Learning History",
    goal: "Xem lại toàn bộ hoạt động học tập",
    primaryActor: "Student", secondaryActor: "—",
    precondition: "Đã đăng nhập.", postcondition: "Hiển thị timeline hoạt động.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Lịch sử học tập\"", system: "—" },
      { step: 2, actor: "—", system: "Truy vấn TienDoHocTap + LanLamBaiKiemTra" },
      { step: 3, actor: "—", system: "Hiển thị timeline: Bài đã xem, BKT đã làm, CC đã nhận" },
    ],
    altFlow: [], exFlow: [],
  },
];

const instructorUseCases = [
  {
    id: "UC-INSTRUCTOR-001", nameVi: "Đăng ký nâng cấp giảng viên", nameEn: "Register Instructor Upgrade",
    goal: "Cho phép Student gửi yêu cầu nâng cấp lên vai trò Instructor",
    primaryActor: "Instructor (Student hiện tại)", secondaryActor: "Admin, Notification Service",
    precondition: "1. Có tài khoản Student hoạt động.\n2. Chưa có yêu cầu đang chờ.",
    postcondition: "InstructorRequest được tạo, Admin nhận thông báo.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Trở thành giảng viên\"", system: "Hiển thị form đăng ký" },
      { step: 2, actor: "Điền: Chuyên môn, Kinh nghiệm, Bằng cấp", system: "—" },
      { step: 3, actor: "Upload CV, bằng cấp", system: "Upload Cloud Storage" },
      { step: 4, actor: "Đồng ý điều khoản → \"Gửi\"", system: "—" },
      { step: 5, actor: "—", system: "Tạo InstructorRequest (Chờ duyệt)" },
      { step: 6, actor: "—", system: "Gửi thông báo đến Admin + email xác nhận" },
    ],
    altFlow: [{ code: "AF-I001-1", condition: "Bị từ chối trước đó", handling: "Cho phép gửi lại kèm bổ sung" }],
    exFlow: [
      { code: "EF-I001-1", condition: "Đang có yêu cầu chờ", handling: "Hiển thị \"Yêu cầu đang xem xét\"" },
      { code: "EF-I001-2", condition: "File > 10MB", handling: "Hiển thị \"File tối đa 10MB\"" },
    ],
  },
  {
    id: "UC-INSTRUCTOR-002", nameVi: "Quản lý hồ sơ giảng viên", nameEn: "Manage Instructor Profile",
    goal: "Cập nhật hồ sơ chuyên nghiệp hiển thị công khai",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "1. Đã đăng nhập.\n2. Có vai trò Instructor.",
    postcondition: "Hồ sơ GV được cập nhật (AppUser + LienKet + NganHang).",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Hồ sơ giảng viên\"", system: "Hiển thị thông tin hiện tại" },
      { step: 2, actor: "Chỉnh sửa: Tên, Ảnh, Giới thiệu, Chuyên môn", system: "—" },
      { step: 3, actor: "Quản lý liên kết MXH (LienKet)", system: "—" },
      { step: 4, actor: "Cập nhật ngân hàng (NganHang)", system: "—" },
      { step: 5, actor: "Click \"Lưu\"", system: "Validate & cập nhật DB" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-003", nameVi: "Tạo khóa học", nameEn: "Create Course",
    goal: "Tạo khóa học mới trên nền tảng",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "1. Đã đăng nhập.\n2. Có vai trò Instructor.",
    postcondition: "KhoaHoc mới (TrangThai = Nháp, TrangThaiPheDuyet = Chưa gửi).",
    mainFlow: [
      { step: 1, actor: "Click \"Tạo khóa học mới\"", system: "Hiển thị wizard" },
      { step: 2, actor: "Bước 1: Nhập TieuDe, MoTa, CapDo", system: "—" },
      { step: 3, actor: "Bước 2: Upload ảnh & video preview", system: "Upload Cloud" },
      { step: 4, actor: "Bước 3: Nhập Gia, GiaGoc", system: "—" },
      { step: 5, actor: "Bước 4: Chọn DanhMuc", system: "—" },
      { step: 6, actor: "Click \"Tạo\"", system: "Validate → Tạo KhoaHoc" },
    ],
    altFlow: [
      { code: "AF-I003-1", condition: "Lưu nháp", handling: "→ «extend» UC-INSTRUCTOR-005" },
      { code: "AF-I003-2", condition: "Gửi duyệt ngay", handling: "→ «extend» UC-INSTRUCTOR-006" },
    ],
    exFlow: [
      { code: "EF-I003-1", condition: "Ảnh > 5MB", handling: "Hiển thị \"Kích thước ảnh tối đa 5MB\"" },
    ],
  },
  {
    id: "UC-INSTRUCTOR-004", nameVi: "Chỉnh sửa khóa học", nameEn: "Edit Course",
    goal: "Cập nhật thông tin khóa học đã tạo",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "Khóa học thuộc sở hữu GV.", postcondition: "KhoaHoc được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Chọn khóa học → chỉnh sửa", system: "Hiển thị form với dữ liệu hiện tại" },
      { step: 2, actor: "Chỉnh sửa các trường", system: "—" },
      { step: 3, actor: "Click \"Lưu\"", system: "Validate → Cập nhật KhoaHoc" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-I004-1", condition: "KH có học viên", handling: "Cảnh báo ảnh hưởng" }],
  },
  {
    id: "UC-INSTRUCTOR-005", nameVi: "Lưu khóa học nháp", nameEn: "Save Draft Course",
    goal: "Lưu khóa học ở trạng thái nháp để hoàn thiện sau",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "Đang tạo/chỉnh sửa khóa học.", postcondition: "KhoaHoc.TrangThai = \"Nháp\".",
    mainFlow: [
      { step: 1, actor: "Click \"Lưu nháp\"", system: "—" },
      { step: 2, actor: "—", system: "Lưu dữ liệu → TrangThai = \"Nháp\"" },
      { step: 3, actor: "—", system: "Hiển thị \"Đã lưu nháp\"" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-006", nameVi: "Gửi khóa học chờ duyệt", nameEn: "Submit Course for Review",
    goal: "Gửi khóa học hoàn thành để Admin duyệt",
    primaryActor: "Instructor", secondaryActor: "Admin, Notification Service",
    precondition: "KH đầy đủ thông tin, ≥ 1 Phần + 1 Bài giảng.", postcondition: "TrangThaiPheDuyet = \"Chờ duyệt\".",
    mainFlow: [
      { step: 1, actor: "Click \"Gửi duyệt\"", system: "—" },
      { step: 2, actor: "—", system: "Kiểm tra tính đầy đủ" },
      { step: 3, actor: "—", system: "Cập nhật TrangThaiPheDuyet = \"Chờ duyệt\"" },
      { step: 4, actor: "—", system: "Gửi ThongBao + email đến Admin" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-I006-1", condition: "Thiếu thông tin", handling: "Hiển thị checklist cần hoàn thành" },
      { code: "EF-I006-2", condition: "Không có bài giảng", handling: "Hiển thị \"Cần ≥ 1 bài giảng\"" },
    ],
  },
  {
    id: "UC-INSTRUCTOR-007", nameVi: "Quản lý chương học", nameEn: "Manage Sections",
    goal: "Tạo, sửa, xóa, sắp xếp Phần (Chương) trong khóa học",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "KhoaHoc đã tồn tại.", postcondition: "Bảng Phan được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập tab \"Nội dung\"", system: "Hiển thị danh sách Phan" },
      { step: 2, actor: "Thêm/Sửa/Xóa/Sắp xếp chương", system: "Cập nhật Phan (TenPhan, ThuTuSapXep)" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-I007-1", condition: "Xóa Phan có bài giảng", handling: "Cảnh báo xóa cascade" }],
  },
  {
    id: "UC-INSTRUCTOR-008", nameVi: "Quản lý bài giảng", nameEn: "Manage Lectures",
    goal: "Tạo, sửa, xóa, sắp xếp bài giảng",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "KH có ≥ 1 Phan.", postcondition: "BaiGiang được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Chọn Phần → \"Thêm bài giảng\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: TieuDe, LoaiBaiGiang, LaBaiGiangFree", system: "—" },
      { step: 3, actor: "Click \"Tạo\"", system: "Tạo BaiGiang" },
      { step: 4, actor: "(Tùy chọn) Upload video/tài liệu", system: "→ «extend» UC-I-009/010" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-009", nameVi: "Tải video bài giảng", nameEn: "Upload Video Lecture",
    goal: "Upload video bài giảng lên hệ thống",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "BaiGiang loại \"Video\".", postcondition: "Video lưu Cloud, BaiGiang.URLBaiGiang cập nhật.",
    mainFlow: [
      { step: 1, actor: "Click \"Upload video\"", system: "Hiển thị vùng upload" },
      { step: 2, actor: "Chọn file video", system: "—" },
      { step: 3, actor: "—", system: "Validate (MP4/WebM/MOV, ≤ 2GB)" },
      { step: 4, actor: "—", system: "Upload Cloud + progress bar" },
      { step: 5, actor: "—", system: "Cập nhật BaiGiang + KhoaHoc.TongThoiLuong" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-I009-1", condition: "File > 2GB", handling: "Hiển thị \"Video tối đa 2GB\"" },
      { code: "EF-I009-2", condition: "Định dạng sai", handling: "Hiển thị \"Chỉ hỗ trợ MP4, WebM, MOV\"" },
    ],
  },
  {
    id: "UC-INSTRUCTOR-010", nameVi: "Tải tài liệu học tập", nameEn: "Upload Learning Materials",
    goal: "Upload tài liệu đính kèm cho bài giảng",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "BaiGiang đã tồn tại.", postcondition: "TaiLieu được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Thêm tài liệu\"", system: "—" },
      { step: 2, actor: "Chọn file (PDF, DOCX...)", system: "—" },
      { step: 3, actor: "—", system: "Validate (≤ 50MB) → Upload → Tạo TaiLieu" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-011", nameVi: "Tạo bài kiểm tra", nameEn: "Create Quiz",
    goal: "Tạo bài kiểm tra với câu hỏi và đáp án",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "KH có ≥ 1 Phan.", postcondition: "BaiKiemTra + CauHoi + DapAn được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Thêm bài kiểm tra\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: Tên, Mô tả, DiemDat, GioiHanThoiGian", system: "—" },
      { step: 3, actor: "Cấu hình: ChoLamLai, SoLanLamToiDa", system: "—" },
      { step: 4, actor: "Thêm CauHoi + DapAn (đánh dấu đúng)", system: "—" },
      { step: 5, actor: "Click \"Lưu\"", system: "Tạo BaiKiemTra, CauHoi, DapAn" },
    ],
    altFlow: [],
    exFlow: [
      { code: "EF-I011-1", condition: "Không có câu hỏi", handling: "Hiển thị \"Cần ≥ 1 câu hỏi\"" },
      { code: "EF-I011-2", condition: "Không có đáp án đúng", handling: "Hiển thị \"Mỗi câu cần ≥ 1 đáp án đúng\"" },
    ],
  },
  {
    id: "UC-INSTRUCTOR-012", nameVi: "Tạo bài tập", nameEn: "Create Assignment",
    goal: "Tạo bài tập cho học viên nộp",
    primaryActor: "Instructor", secondaryActor: "Cloud Storage",
    precondition: "KH có ≥ 1 Phan.", postcondition: "Bài tập được tạo.",
    mainFlow: [
      { step: 1, actor: "Click \"Thêm bài tập\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: Tiêu đề, Yêu cầu, Hạn nộp, Điểm max", system: "—" },
      { step: 3, actor: "Click \"Tạo\"", system: "Lưu bài tập" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-013", nameVi: "Quản lý học viên", nameEn: "Manage Students",
    goal: "Xem danh sách và tiến độ học viên trong khóa học",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "KH có ≥ 1 học viên.", postcondition: "Hiển thị thông tin quản lý HV.",
    mainFlow: [
      { step: 1, actor: "Truy cập tab \"Học viên\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tên, Email, Ngày ĐK, Tiến độ (%)" },
      { step: 3, actor: "(Tùy chọn) Xem chi tiết tiến độ", system: "Hiển thị TienDoHocTap chi tiết" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-014", nameVi: "Chấm điểm bài tập", nameEn: "Grade Assignment",
    goal: "Chấm điểm bài tập mà học viên đã nộp",
    primaryActor: "Instructor", secondaryActor: "Notification Service",
    precondition: "Có bài tập đã nộp.", postcondition: "Điểm được lưu, HV nhận thông báo.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Bài tập cần chấm\"", system: "Hiển thị danh sách" },
      { step: 2, actor: "Xem bài làm → Nhập điểm + nhận xét", system: "—" },
      { step: 3, actor: "Click \"Chấm điểm\"", system: "Lưu + gửi ThongBao" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-015", nameVi: "Trả lời câu hỏi học viên", nameEn: "Answer Student Question",
    goal: "Trả lời câu hỏi mà học viên đặt",
    primaryActor: "Instructor", secondaryActor: "Notification Service",
    precondition: "Có HoiDap chưa trả lời.", postcondition: "Câu trả lời được lưu, HV nhận thông báo.",
    mainFlow: [
      { step: 1, actor: "Xem danh sách câu hỏi", system: "Hiển thị HoiDap chưa TL" },
      { step: 2, actor: "Nhập trả lời → \"Trả lời\"", system: "—" },
      { step: 3, actor: "—", system: "Tạo HoiDap (TL) + Gửi ThongBao" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-016", nameVi: "Theo dõi doanh thu", nameEn: "Track Revenue",
    goal: "Xem doanh thu từ các khóa học",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "Có ≥ 1 KH đã bán.", postcondition: "Hiển thị dashboard doanh thu.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Doanh thu\"", system: "—" },
      { step: 2, actor: "—", system: "Tính: Tổng DT, DT tháng, Biểu đồ theo thời gian" },
      { step: 3, actor: "—", system: "Bảng: KH, Số lượng bán, Doanh thu" },
    ],
    altFlow: [{ code: "AF-I016-1", condition: "Yêu cầu rút tiền", handling: "→ «extend» Request Payout" }],
    exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-017", nameVi: "Theo dõi thống kê khóa học", nameEn: "View Course Statistics",
    goal: "Hiển thị thống kê chi tiết hiệu quả khóa học",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "Có ≥ 1 KH xuất bản.", postcondition: "Hiển thị thống kê tổng hợp.",
    mainFlow: [
      { step: 1, actor: "Chọn KH → tab \"Thống kê\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tổng HV, Tỷ lệ hoàn thành, Đánh giá TB" },
      { step: 3, actor: "—", system: "Biểu đồ: Đăng ký/tháng, Tiến độ TB, Tỷ lệ đạt BKT" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-INSTRUCTOR-018", nameVi: "Quản lý đánh giá khóa học", nameEn: "Manage Course Reviews",
    goal: "Xem và phản hồi đánh giá từ học viên",
    primaryActor: "Instructor", secondaryActor: "—",
    precondition: "KH có ≥ 1 đánh giá.", postcondition: "Phản hồi/báo cáo được gửi.",
    mainFlow: [
      { step: 1, actor: "Truy cập tab \"Đánh giá\"", system: "Hiển thị DanhGia" },
      { step: 2, actor: "(Tùy chọn) Phản hồi / Báo cáo", system: "Lưu phản hồi / Gửi Admin" },
    ],
    altFlow: [], exFlow: [],
  },
];

const adminUseCases = [
  {
    id: "UC-ADMIN-001", nameVi: "Quản lý tài khoản người dùng", nameEn: "Manage User Accounts",
    goal: "Xem, tìm kiếm, quản lý toàn bộ tài khoản",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Dữ liệu tài khoản được hiển thị/cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý người dùng\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: HoTen, Email, Vai trò, Trạng thái" },
      { step: 3, actor: "Tìm kiếm/Lọc theo vai trò", system: "Lọc kết quả" },
      { step: 4, actor: "Click xem chi tiết", system: "Hiển thị hồ sơ + lịch sử" },
    ],
    altFlow: [{ code: "AF-A001-1", condition: "Khóa tài khoản", handling: "→ «extend» UC-ADMIN-005" }],
    exFlow: [],
  },
  {
    id: "UC-ADMIN-002", nameVi: "Quản lý học viên", nameEn: "Manage Students",
    goal: "Quản lý danh sách học viên",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Danh sách HV được quản lý.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý học viên\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tên, Email, Số KH, Ngày tham gia" },
      { step: 3, actor: "Xem chi tiết HV", system: "Hiển thị hồ sơ, KH đăng ký, tiến độ, CC" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-003", nameVi: "Quản lý giảng viên", nameEn: "Manage Instructors",
    goal: "Quản lý danh sách giảng viên",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Danh sách GV được quản lý.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý giảng viên\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tên, Email, Số KH, Doanh thu, ĐG TB" },
      { step: 3, actor: "Xem chi tiết GV", system: "Hiển thị hồ sơ, KH, doanh thu chi tiết" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-004", nameVi: "Duyệt yêu cầu nâng cấp giảng viên", nameEn: "Approve Instructor Request",
    goal: "Xem xét và duyệt/từ chối yêu cầu nâng cấp GV",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "Có InstructorRequest đang chờ.", postcondition: "Yêu cầu được xử lý, người dùng nhận TB.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Yêu cầu nâng cấp GV\"", system: "Hiển thị danh sách chờ" },
      { step: 2, actor: "Xem chi tiết hồ sơ + tài liệu", system: "—" },
      { step: 3, actor: "Duyệt: Click \"Phê duyệt\"", system: "Thêm role Instructor + gửi TB" },
      { step: "3b", actor: "Từ chối: Click \"Từ chối\" + nhập lý do", system: "Cập nhật trạng thái + gửi TB" },
    ],
    altFlow: [{ code: "AF-A004-1", condition: "Yêu cầu bổ sung", handling: "Gửi yêu cầu bổ sung thông tin" }],
    exFlow: [],
  },
  {
    id: "UC-ADMIN-005", nameVi: "Khóa/Mở khóa tài khoản", nameEn: "Lock/Unlock Account",
    goal: "Khóa hoặc mở khóa tài khoản vi phạm",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "TK tồn tại và không phải Admin.", postcondition: "Trạng thái TK được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Chọn tài khoản", system: "—" },
      { step: 2, actor: "Khóa: Click → Nhập lý do → Xác nhận", system: "—" },
      { step: 3, actor: "—", system: "Cập nhật LockoutEnd + Thu hồi RefreshToken + Gửi email" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-A005-1", condition: "Khóa Admin khác", handling: "\"Không thể khóa TK Admin\"" }],
  },
  {
    id: "UC-ADMIN-006", nameVi: "Phân quyền hệ thống", nameEn: "Manage System Roles",
    goal: "Quản lý vai trò và gán quyền",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin cấp cao.", postcondition: "Role và UserRole được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Phân quyền\"", system: "Hiển thị danh sách Role" },
      { step: 2, actor: "Tạo/Sửa vai trò hoặc Gán vai trò cho user", system: "Cập nhật Role/UserRole" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-007", nameVi: "Quản lý danh mục khóa học", nameEn: "Manage Course Categories",
    goal: "Tạo, sửa, xóa danh mục phân loại khóa học",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Bảng DanhMuc được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý danh mục\"", system: "Hiển thị danh sách DanhMuc" },
      { step: 2, actor: "Thêm/Sửa/Xóa/Ẩn danh mục", system: "Cập nhật DanhMuc" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-A007-1", condition: "DM có khóa học", handling: "Cảnh báo ảnh hưởng" }],
  },
  {
    id: "UC-ADMIN-008", nameVi: "Duyệt khóa học", nameEn: "Approve Course",
    goal: "Duyệt khóa học đã gửi để xuất bản",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "KH có TrangThaiPheDuyet = \"Chờ duyệt\".", postcondition: "TrangThaiPheDuyet = \"Đã duyệt\".",
    mainFlow: [
      { step: 1, actor: "Truy cập \"KH chờ duyệt\"", system: "Hiển thị danh sách" },
      { step: 2, actor: "Xem xét nội dung KH", system: "Preview video, tài liệu, BKT" },
      { step: 3, actor: "Click \"Duyệt\"", system: "—" },
      { step: 4, actor: "—", system: "Cập nhật trạng thái + Xuất bản + Gửi TB GV" },
    ],
    altFlow: [
      { code: "AF-A008-1", condition: "Từ chối", handling: "→ «extend» UC-ADMIN-009" },
      { code: "AF-A008-2", condition: "Yêu cầu sửa", handling: "→ «extend» UC-ADMIN-010" },
    ],
    exFlow: [],
  },
  {
    id: "UC-ADMIN-009", nameVi: "Từ chối khóa học", nameEn: "Reject Course",
    goal: "Từ chối khóa học không đạt tiêu chuẩn",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "KH đang chờ duyệt.", postcondition: "TrangThaiPheDuyet = \"Đã từ chối\".",
    mainFlow: [
      { step: 1, actor: "Click \"Từ chối\" → Nhập lý do", system: "—" },
      { step: 2, actor: "—", system: "Cập nhật trạng thái + Gửi TB kèm lý do đến GV" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-010", nameVi: "Yêu cầu chỉnh sửa khóa học", nameEn: "Request Course Revision",
    goal: "Yêu cầu GV chỉnh sửa nội dung trước khi duyệt",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "KH đang chờ duyệt.", postcondition: "TrangThaiPheDuyet = \"Cần chỉnh sửa\".",
    mainFlow: [
      { step: 1, actor: "Click \"Yêu cầu sửa\" → Nhập ghi chú", system: "—" },
      { step: 2, actor: "—", system: "Cập nhật trạng thái + Gửi TB đến GV" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-011", nameVi: "Ẩn/Xóa khóa học", nameEn: "Hide/Delete Course",
    goal: "Ẩn hoặc xóa khóa học vi phạm",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "KH tồn tại.", postcondition: "KH bị ẩn hoặc xóa.",
    mainFlow: [
      { step: 1, actor: "Chọn KH → \"Ẩn\"/\"Xóa\" + nhập lý do", system: "—" },
      { step: 2, actor: "—", system: "Cập nhật TrangThai/IsDeleted + Gửi TB GV" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-A011-1", condition: "KH có HV đang học", handling: "Cảnh báo, gợi ý ẩn thay xóa" }],
  },
  {
    id: "UC-ADMIN-012", nameVi: "Quản lý banner trang chủ", nameEn: "Manage Homepage Banners",
    goal: "Quản lý hình ảnh banner quảng cáo trang chủ",
    primaryActor: "Admin", secondaryActor: "Cloud Storage",
    precondition: "Có quyền Admin.", postcondition: "Banner được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý banner\"", system: "Hiển thị danh sách" },
      { step: 2, actor: "Thêm/Sửa/Xóa/Sắp xếp banner", system: "Upload Cloud + cập nhật DB" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-013", nameVi: "Quản lý giao dịch thanh toán", nameEn: "Manage Payment Transactions",
    goal: "Theo dõi và quản lý toàn bộ giao dịch thanh toán",
    primaryActor: "Admin", secondaryActor: "Payment Gateway",
    precondition: "Có quyền Admin.", postcondition: "Hiển thị và quản lý dữ liệu thanh toán.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý thanh toán\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: MaGiaoDich, Người mua, SoTien, Trạng thái" },
      { step: 3, actor: "Lọc/Xem chi tiết", system: "Hiển thị DonHangChiTiet" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-014", nameVi: "Quản lý mã giảm giá", nameEn: "Manage Discount Codes",
    goal: "Tạo, quản lý mã giảm giá khuyến mãi",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "KhuyenMai được cập nhật.",
    mainFlow: [
      { step: 1, actor: "Click \"Tạo mã mới\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: MaGiamGia, PhanTramGiam, Ngày, SoLuong", system: "—" },
      { step: 3, actor: "(Tùy chọn) Chọn KH áp dụng", system: "Tạo KhuyenMai_KhoaHoc" },
      { step: 4, actor: "Click \"Tạo\"", system: "Tạo KhuyenMai" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-A014-1", condition: "Mã trùng", handling: "Hiển thị \"Mã đã tồn tại\"" }],
  },
  {
    id: "UC-ADMIN-015", nameVi: "Quản lý đánh giá và bình luận", nameEn: "Manage Reviews & Comments",
    goal: "Kiểm duyệt đánh giá, bình luận",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "ĐG/BL được duyệt hoặc ẩn/xóa.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý đánh giá\"", system: "Hiển thị DanhGia + HoiDap" },
      { step: 2, actor: "Ẩn/Xóa/Khôi phục đánh giá", system: "Cập nhật TrangThai/IsDeleted" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-016", nameVi: "Quản lý chứng chỉ", nameEn: "Manage Certificates",
    goal: "Quản lý các chứng chỉ đã cấp",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Thông tin CC được quản lý.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Quản lý chứng chỉ\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: MaSoCC, TenCC, HV, KH, NgayCap" },
      { step: 3, actor: "(Tùy chọn) Xác thực/Thu hồi CC", system: "Cập nhật TrangThai" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-017", nameVi: "Quản lý thông báo hệ thống", nameEn: "Manage System Notifications",
    goal: "Tạo và quản lý thông báo gửi đến người dùng",
    primaryActor: "Admin", secondaryActor: "Notification Service",
    precondition: "Có quyền Admin.", postcondition: "ThongBao được tạo và gửi.",
    mainFlow: [
      { step: 1, actor: "Click \"Tạo thông báo mới\"", system: "Hiển thị form" },
      { step: 2, actor: "Nhập: TieuDe, NoiDung, Đối tượng nhận", system: "—" },
      { step: 3, actor: "Click \"Gửi\"", system: "Tạo ThongBao + push/email" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-018", nameVi: "Xem báo cáo doanh thu", nameEn: "View Revenue Report",
    goal: "Hiển thị báo cáo doanh thu tổng hợp",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Hiển thị dashboard doanh thu.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Báo cáo doanh thu\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tổng DT, DT tháng, Biểu đồ, Top KH" },
      { step: 3, actor: "(Tùy chọn) Xuất báo cáo", system: "→ «extend» UC-ADMIN-021" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-019", nameVi: "Xem báo cáo người dùng", nameEn: "View User Report",
    goal: "Hiển thị thống kê người dùng",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Hiển thị dashboard người dùng.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Báo cáo người dùng\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tổng ND, ND mới, Phân bố vai trò, Biểu đồ" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-020", nameVi: "Xem báo cáo khóa học", nameEn: "View Course Report",
    goal: "Hiển thị thống kê tổng hợp khóa học",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Có quyền Admin.", postcondition: "Hiển thị dashboard khóa học.",
    mainFlow: [
      { step: 1, actor: "Truy cập \"Báo cáo khóa học\"", system: "—" },
      { step: 2, actor: "—", system: "Hiển thị: Tổng KH, KH mới, Phân bố DM, Top KH" },
    ],
    altFlow: [], exFlow: [],
  },
  {
    id: "UC-ADMIN-021", nameVi: "Xuất báo cáo Excel/PDF", nameEn: "Export Report",
    goal: "Xuất dữ liệu báo cáo ra file Excel hoặc PDF",
    primaryActor: "Admin", secondaryActor: "—",
    precondition: "Đang xem trang báo cáo.", postcondition: "File báo cáo được tải về.",
    mainFlow: [
      { step: 1, actor: "Click \"Xuất báo cáo\"", system: "Hiển thị dialog định dạng" },
      { step: 2, actor: "Chọn Excel/PDF + bộ lọc", system: "—" },
      { step: 3, actor: "Click \"Xuất\"", system: "Tổng hợp dữ liệu → Tạo file → Tải về" },
    ],
    altFlow: [],
    exFlow: [{ code: "EF-A021-1", condition: "Không có dữ liệu", handling: "Hiển thị \"Không có dữ liệu để xuất\"" }],
  },
];

// ============================================================
// BUILD DOCUMENT
// ============================================================
async function generateDocument() {
  const allSections = [];

  // ===== COVER PAGE =====
  allSections.push(emptyParagraph());
  allSections.push(emptyParagraph());
  allSections.push(emptyParagraph());
  allSections.push(emptyParagraph());
  allSections.push(createTitle("TÀI LIỆU USE CASE SPECIFICATION"));
  allSections.push(createTitle("HỆ THỐNG EDUVERSE"));
  allSections.push(emptyParagraph());
  allSections.push(createSubtitle("Nền tảng học trực tuyến E-Learning"));
  allSections.push(emptyParagraph());
  allSections.push(emptyParagraph());

  const coverInfo = [
    ["Dự án", "EduVerse - E-Learning Platform"],
    ["Phiên bản", "1.0"],
    ["Ngày tạo", "23/06/2026"],
    ["Chuẩn áp dụng", "UML 2.5, IEEE 830, SRS"],
    ["Tổng Use Case", "65 (26 Student + 18 Instructor + 21 Admin)"],
  ];

  allSections.push(new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: coverInfo.map(([k, v]) => new TableRow({
      children: [
        createTableCell(k, { width: 35, bold: true, shading: COLORS.HEADING_BG }),
        createTableCell(v, { width: 65 }),
      ],
    })),
  }));

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== TABLE OF CONTENTS =====
  allSections.push(createHeading1("MỤC LỤC"));
  const tocItems = [
    "Phần 1: Tổng quan hệ thống",
    "Phần 2: Danh sách Actor",
    "Phần 3: Bảng tổng hợp Use Case",
    "Phần 4: Quan hệ Include & Extend",
    "Phần 5: Chi tiết Use Case - Student (26 UC)",
    "Phần 6: Chi tiết Use Case - Instructor (18 UC)",
    "Phần 7: Chi tiết Use Case - Admin (21 UC)",
    "Phần 8: Danh sách Activity Diagram (25 AD)",
  ];
  tocItems.forEach((item, i) => {
    allSections.push(createParagraph(`${i + 1}. ${item}`, { size: 24 }));
  });

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 1: TỔNG QUAN =====
  allSections.push(createHeading1("PHẦN 1: TỔNG QUAN HỆ THỐNG"));
  allSections.push(createHeading2("1.1. Mô tả hệ thống"));
  allSections.push(createParagraph("EduVerse là nền tảng học trực tuyến (E-Learning) cho phép:"));
  allSections.push(createBullet("Học viên (Student) tìm kiếm, mua, và tham gia các khóa học trực tuyến"));
  allSections.push(createBullet("Giảng viên (Instructor) tạo, quản lý khóa học và tương tác với học viên"));
  allSections.push(createBullet("Quản trị viên (Admin) quản lý toàn bộ hệ thống, duyệt nội dung, và theo dõi báo cáo"));

  allSections.push(createHeading2("1.2. Kiến trúc hệ thống"));
  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("Thành phần", 25), createHeaderCell("Công nghệ", 30), createHeaderCell("Mô tả", 45)] }),
      new TableRow({ children: [createTableCell("Backend API"), createTableCell("ASP.NET Core (C#)"), createTableCell("16 Controller, kiến trúc Repository-Service")] }),
      new TableRow({ children: [createTableCell("Frontend"), createTableCell("Next.js (TypeScript)"), createTableCell("11 module giao diện")] }),
      new TableRow({ children: [createTableCell("Database"), createTableCell("Entity Framework Core"), createTableCell("30+ Entity/Table")] }),
      new TableRow({ children: [createTableCell("Authentication"), createTableCell("ASP.NET Identity + JWT + OAuth"), createTableCell("Xác thực đa lớp")] }),
      new TableRow({ children: [createTableCell("Payment"), createTableCell("Payment Gateway"), createTableCell("VNPay/MoMo")] }),
    ],
  }));

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 2: ACTOR =====
  allSections.push(createHeading1("PHẦN 2: DANH SÁCH ACTOR"));
  allSections.push(createHeading2("2.1. Actor chính"));
  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("#", 5), createHeaderCell("Actor", 20), createHeaderCell("Mô tả", 35), createHeaderCell("Vai trò", 40)] }),
      new TableRow({ children: [createTableCell("1", {align: AlignmentType.CENTER}), createTableCell("Student (Học viên)", {bold:true}), createTableCell("Người dùng đăng ký học"), createTableCell("Tìm kiếm, mua, học KH, làm BKT, nhận CC")] }),
      new TableRow({ children: [createTableCell("2", {align: AlignmentType.CENTER}), createTableCell("Instructor (Giảng viên)", {bold:true}), createTableCell("Người tạo & quản lý KH"), createTableCell("Tạo nội dung, quản lý bài giảng, chấm bài, theo dõi DT")] }),
      new TableRow({ children: [createTableCell("3", {align: AlignmentType.CENTER}), createTableCell("Admin (Quản trị viên)", {bold:true}), createTableCell("Quản trị viên hệ thống"), createTableCell("Quản lý toàn bộ ND, nội dung, tài chính, hệ thống")] }),
    ],
  }));

  allSections.push(createHeading2("2.2. Actor phụ (Hệ thống bên ngoài)"));
  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("#", 5), createHeaderCell("Actor", 25), createHeaderCell("Mô tả", 35), createHeaderCell("Vai trò", 35)] }),
      new TableRow({ children: [createTableCell("4"), createTableCell("Payment Gateway", {bold:true}), createTableCell("Cổng thanh toán (VNPay/MoMo)"), createTableCell("Xử lý giao dịch thanh toán")] }),
      new TableRow({ children: [createTableCell("5"), createTableCell("Notification Service", {bold:true}), createTableCell("Dịch vụ email/thông báo"), createTableCell("Gửi email, push notification")] }),
      new TableRow({ children: [createTableCell("6"), createTableCell("Cloud Storage", {bold:true}), createTableCell("Dịch vụ lưu trữ đám mây"), createTableCell("Lưu trữ video, tài liệu, hình ảnh")] }),
    ],
  }));

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 3: BẢNG TỔNG HỢP =====
  allSections.push(createHeading1("PHẦN 3: BẢNG TỔNG HỢP USE CASE"));

  const allUCs = [...studentUseCases, ...instructorUseCases, ...adminUseCases];
  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({
        children: [
          createHeaderCell("STT", 5),
          createHeaderCell("Use Case ID", 18),
          createHeaderCell("Tên Use Case", 32),
          createHeaderCell("Actor chính", 15),
          createHeaderCell("Actor phụ", 15),
          createHeaderCell("Nhóm", 15),
        ],
      }),
      ...allUCs.map((uc, i) => {
        const group = uc.id.includes("STUDENT") ? "Student" : uc.id.includes("INSTRUCTOR") ? "Instructor" : "Admin";
        const bgColor = i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE;
        return new TableRow({
          children: [
            createTableCell(String(i + 1), { align: AlignmentType.CENTER, size: 20, shading: bgColor }),
            createTableCell(uc.id, { bold: true, size: 20, shading: bgColor }),
            createTableCell(uc.nameVi, { size: 20, shading: bgColor }),
            createTableCell(uc.primaryActor.split("(")[0].trim(), { size: 20, shading: bgColor }),
            createTableCell(uc.secondaryActor, { size: 20, shading: bgColor }),
            createTableCell(group, { size: 20, shading: bgColor }),
          ],
        });
      }),
    ],
  }));

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 4: INCLUDE/EXTEND =====
  allSections.push(createHeading1("PHẦN 4: QUAN HỆ INCLUDE & EXTEND"));

  allSections.push(createHeading2("4.1. Quan hệ «include» (Bắt buộc)"));
  const includes = [
    ["UC-STUDENT-001", "Validate Input Data", "Kiểm tra dữ liệu đầu vào"],
    ["UC-STUDENT-001", "Send Verification Email", "Gửi email xác thực"],
    ["UC-STUDENT-002", "Authenticate User", "Xác thực tài khoản"],
    ["UC-STUDENT-004", "Send Reset Password Email", "Gửi email đặt lại MK"],
    ["UC-STUDENT-011", "UC-STUDENT-012 (Thanh toán)", "Mua hàng bắt buộc thanh toán"],
    ["UC-STUDENT-012", "Process Payment (Gateway)", "Xử lý qua cổng thanh toán"],
    ["UC-STUDENT-015", "UC-STUDENT-019 (Đánh dấu HT)", "Tự động cập nhật trạng thái"],
    ["UC-STUDENT-017", "Calculate Quiz Score", "Tính điểm bài kiểm tra"],
    ["UC-STUDENT-022", "Generate Certificate", "Tạo chứng chỉ tự động"],
    ["UC-INSTRUCTOR-003", "Validate Course Data", "Kiểm tra dữ liệu KH"],
    ["UC-INSTRUCTOR-006", "Send Review Notification", "Gửi thông báo đến Admin"],
    ["UC-INSTRUCTOR-009", "Upload to Cloud Storage", "Tải lên dịch vụ lưu trữ"],
    ["UC-INSTRUCTOR-011", "Create Questions & Answers", "Tạo câu hỏi và đáp án"],
    ["UC-ADMIN-004", "Send Approval Notification", "Gửi TB kết quả duyệt"],
    ["UC-ADMIN-008", "Update Course Status", "Cập nhật trạng thái KH"],
    ["UC-ADMIN-021", "Generate Report Data", "Tổng hợp dữ liệu BC"],
  ];

  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("UC Cơ sở", 25), createHeaderCell("«include»", 8), createHeaderCell("UC được Include", 32), createHeaderCell("Giải thích", 35)] }),
      ...includes.map((row, i) => new TableRow({
        children: [
          createTableCell(row[0], { bold: true, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell("→", { align: AlignmentType.CENTER, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(row[1], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(row[2], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
        ],
      })),
    ],
  }));

  allSections.push(emptyParagraph());
  allSections.push(createHeading2("4.2. Quan hệ «extend» (Tùy chọn)"));

  const extends_ = [
    ["UC-STUDENT-002", "Login with OAuth", "Chọn đăng nhập MXH"],
    ["UC-STUDENT-007", "UC-STUDENT-008 (Lọc KH)", "Muốn lọc kết quả"],
    ["UC-STUDENT-009", "UC-STUDENT-010 (Xem hồ sơ GV)", "Click tên giảng viên"],
    ["UC-STUDENT-009", "Preview Free Lesson", "KH có bài giảng free"],
    ["UC-STUDENT-011", "Apply Discount Code", "Nhập mã giảm giá"],
    ["UC-STUDENT-011", "Add to Cart", "Thêm giỏ hàng"],
    ["UC-STUDENT-015", "UC-STUDENT-016 (Tải tài liệu)", "BG có tài liệu đính kèm"],
    ["UC-STUDENT-017", "Retake Quiz", "Cho phép làm lại"],
    ["UC-STUDENT-020", "UC-STUDENT-022 (Nhận CC)", "Tiến độ 100%"],
    ["UC-INSTRUCTOR-003", "UC-INSTRUCTOR-005 (Lưu nháp)", "Chưa muốn gửi duyệt"],
    ["UC-INSTRUCTOR-003", "UC-INSTRUCTOR-006 (Gửi duyệt)", "Hoàn thành gửi duyệt"],
    ["UC-INSTRUCTOR-008", "UC-INSTRUCTOR-009 (Tải video)", "BG dạng video"],
    ["UC-ADMIN-001", "UC-ADMIN-005 (Khóa/Mở khóa)", "TK vi phạm"],
    ["UC-ADMIN-008", "UC-ADMIN-009 (Từ chối)", "KH không đạt"],
    ["UC-ADMIN-008", "UC-ADMIN-010 (YC chỉnh sửa)", "KH cần bổ sung"],
    ["UC-ADMIN-018", "UC-ADMIN-021 (Xuất BC)", "Muốn xuất file"],
  ];

  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("UC Cơ sở", 25), createHeaderCell("«extend»", 8), createHeaderCell("UC Mở rộng", 32), createHeaderCell("Điều kiện", 35)] }),
      ...extends_.map((row, i) => new TableRow({
        children: [
          createTableCell(row[0], { bold: true, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell("←", { align: AlignmentType.CENTER, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(row[1], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(row[2], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
        ],
      })),
    ],
  }));

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 5: STUDENT UC DETAILS =====
  allSections.push(createHeading1("PHẦN 5: CHI TIẾT USE CASE - STUDENT (HỌC VIÊN)"));
  allSections.push(createParagraph("Tổng số: 26 Use Case (UC-STUDENT-001 → UC-STUDENT-026)", { bold: true, color: COLORS.STUDENT_HEADER }));
  allSections.push(emptyParagraph());

  for (const uc of studentUseCases) {
    allSections.push(...buildUseCaseDetail(uc, COLORS.STUDENT_HEADER));
  }

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 6: INSTRUCTOR UC DETAILS =====
  allSections.push(createHeading1("PHẦN 6: CHI TIẾT USE CASE - INSTRUCTOR (GIẢNG VIÊN)"));
  allSections.push(createParagraph("Tổng số: 18 Use Case (UC-INSTRUCTOR-001 → UC-INSTRUCTOR-018)", { bold: true, color: COLORS.INSTRUCTOR_HEADER }));
  allSections.push(emptyParagraph());

  for (const uc of instructorUseCases) {
    allSections.push(...buildUseCaseDetail(uc, COLORS.INSTRUCTOR_HEADER));
  }

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 7: ADMIN UC DETAILS =====
  allSections.push(createHeading1("PHẦN 7: CHI TIẾT USE CASE - ADMIN (QUẢN TRỊ VIÊN)"));
  allSections.push(createParagraph("Tổng số: 21 Use Case (UC-ADMIN-001 → UC-ADMIN-021)", { bold: true, color: COLORS.ADMIN_HEADER }));
  allSections.push(emptyParagraph());

  for (const uc of adminUseCases) {
    allSections.push(...buildUseCaseDetail(uc, COLORS.ADMIN_HEADER));
  }

  allSections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== PHẦN 8: ACTIVITY DIAGRAMS =====
  allSections.push(createHeading1("PHẦN 8: DANH SÁCH ACTIVITY DIAGRAM CẦN VẼ"));
  allSections.push(createParagraph("Tổng số: 25 Activity Diagram cho đồ án EduVerse", { bold: true }));
  allSections.push(emptyParagraph());

  const activityDiagrams = [
    ["AD-001", "Quy trình Đăng ký tài khoản", "UC-STUDENT-001", "Trung bình", "Cao"],
    ["AD-002", "Quy trình Đăng nhập (bao gồm OAuth)", "UC-STUDENT-002", "Cao", "Cao"],
    ["AD-003", "Quy trình Quên mật khẩu & Đặt lại", "UC-STUDENT-004", "Trung bình", "Cao"],
    ["AD-004", "Quy trình Tìm kiếm & Lọc khóa học", "UC-STUDENT-007, 008", "Trung bình", "Cao"],
    ["AD-005", "Quy trình Mua khóa học & Thanh toán", "UC-STUDENT-011, 012", "Rất cao", "Cao"],
    ["AD-006", "Quy trình Học video bài giảng", "UC-STUDENT-015, 019", "Cao", "Cao"],
    ["AD-007", "Quy trình Làm bài kiểm tra", "UC-STUDENT-017", "Rất cao", "Cao"],
    ["AD-008", "Quy trình Nộp bài tập", "UC-STUDENT-018", "Trung bình", "TB"],
    ["AD-009", "Quy trình Theo dõi tiến độ & Nhận CC", "UC-STUDENT-020, 022, 023", "Cao", "Cao"],
    ["AD-010", "Quy trình Đánh giá khóa học", "UC-STUDENT-021", "Thấp", "TB"],
    ["AD-011", "Quy trình Thảo luận & Hỏi đáp", "UC-STUDENT-024, 025", "Trung bình", "TB"],
    ["AD-012", "Quy trình Đăng ký nâng cấp GV", "UC-INSTRUCTOR-001", "Cao", "Cao"],
    ["AD-013", "Quy trình Tạo khóa học (E2E)", "UC-INSTRUCTOR-003, 005, 006", "Rất cao", "Cao"],
    ["AD-014", "Quy trình Quản lý nội dung bài giảng", "UC-INSTRUCTOR-007-010", "Cao", "Cao"],
    ["AD-015", "Quy trình Tạo bài kiểm tra & Câu hỏi", "UC-INSTRUCTOR-011", "Cao", "Cao"],
    ["AD-016", "Quy trình Chấm điểm bài tập", "UC-INSTRUCTOR-014", "Trung bình", "TB"],
    ["AD-017", "Quy trình Theo dõi doanh thu & Thống kê", "UC-INSTRUCTOR-016, 017", "Trung bình", "TB"],
    ["AD-018", "Quy trình Duyệt yêu cầu nâng cấp GV", "UC-ADMIN-004", "Cao", "Cao"],
    ["AD-019", "Quy trình Duyệt/Từ chối khóa học", "UC-ADMIN-008, 009, 010", "Rất cao", "Cao"],
    ["AD-020", "Quy trình Quản lý tài khoản ND", "UC-ADMIN-001, 005", "Trung bình", "Cao"],
    ["AD-021", "Quy trình Quản lý danh mục KH", "UC-ADMIN-007", "Thấp", "TB"],
    ["AD-022", "Quy trình Quản lý mã giảm giá", "UC-ADMIN-014", "Trung bình", "TB"],
    ["AD-023", "Quy trình Quản lý giao dịch TT", "UC-ADMIN-013", "Trung bình", "Cao"],
    ["AD-024", "Quy trình Quản lý thông báo HT", "UC-ADMIN-017", "Thấp", "Thấp"],
    ["AD-025", "Quy trình Xuất báo cáo (Excel/PDF)", "UC-ADMIN-018-021", "Trung bình", "TB"],
  ];

  allSections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({ children: [createHeaderCell("Mã", 8), createHeaderCell("Tên Activity Diagram", 32), createHeaderCell("UC liên quan", 25), createHeaderCell("Phức tạp", 15), createHeaderCell("Ưu tiên", 10)] }),
      ...activityDiagrams.map((ad, i) => new TableRow({
        children: [
          createTableCell(ad[0], { bold: true, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(ad[1], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(ad[2], { size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(ad[3], { align: AlignmentType.CENTER, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
          createTableCell(ad[4], { align: AlignmentType.CENTER, size: 20, shading: i % 2 === 0 ? COLORS.TABLE_ALT_ROW : COLORS.WHITE }),
        ],
      })),
    ],
  }));

  // ===== CREATE DOCUMENT =====
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24, color: COLORS.TEXT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "EduVerse - Use Case Specification v1.0", size: 18, color: COLORS.SUBTEXT, font: "Times New Roman", italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Trang ", size: 18, color: COLORS.SUBTEXT, font: "Times New Roman" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.SUBTEXT, font: "Times New Roman" }),
              new TextRun({ text: " / ", size: 18, color: COLORS.SUBTEXT, font: "Times New Roman" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLORS.SUBTEXT, font: "Times New Roman" }),
            ],
          })],
        }),
      },
      children: allSections,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "c:\\Users\\ADMIN\\Documents\\Eduverse\\Tailieu_UseCase_ChiTiet_EduVerse_V2.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ File DOCX đã được tạo thành công: ${outputPath}`);
  console.log(`📊 Tổng số Use Case: ${allUCs.length}`);
  console.log(`   - Student: ${studentUseCases.length}`);
  console.log(`   - Instructor: ${instructorUseCases.length}`);
  console.log(`   - Admin: ${adminUseCases.length}`);
}

generateDocument().catch(console.error);
