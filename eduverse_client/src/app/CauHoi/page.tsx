"use client";
interface Props {
  haungu: number;
}
const CauHoiPage = ({ haungu }: Props) => {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Câu Hỏi</h1>
        <p>Đây là trang câu hỏi {haungu}.</p>
    </div>
    );
};
export default CauHoiPage;