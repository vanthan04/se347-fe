/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const TakeCareOfSickPeople = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTime, setSelectedTime] = useState({ hours: 0, price: 0 });
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = Number(searchParams.get("price")) || 200000;
  const taskId = searchParams.get("id");

  const timeOptions = [
    { hours: 2, price: 200000 },
    { hours: 3, price: 280000 },
    { hours: 4, price: 360000 },
    { hours: 5, price: 440000 },
    { hours: 6, price: 520000 },
    { hours: 7, price: 600000 },
    { hours: 8, price: 680000 },
  ];

  useEffect(() => {
    fetchTaskDetail();
  }, []);

  const fetchTaskDetail = async () => {
    try {
      const data = await taskService.getTaskDetail(taskId);
      if (data.success) setTaskDetail(data.task);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải thông tin dịch vụ");
    }
  };

  const saveDraft = () => {
    if (selectedTime.hours === 0) {
      toast.error("Vui lòng chọn thời gian");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: selectedTime.price,
      final_amount: selectedTime.price,
      task_snapshot: {
        code: "SICK",
        name: taskDetail?.task_name || "Chăm sóc người bệnh",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        num_patients: 1,
        hours: selectedTime.hours,
      },
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    return true;
  };

  const handleBookNow = () => {
    if (saveDraft()) navigate(APP_PATHS.CUSTOMER.BOOK_NOW);
  };

  const handleSchedule = () => {
    if (saveDraft()) navigate(APP_PATHS.CUSTOMER.SCHEDULED);
  };

  return (
    <div className="bg-primary-100 min-h-screen font-montserrat">
      <header className="bg-primary-200 py-4">
        <div className="flex items-center justify-between px-4">
          <div className="text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-70">
            <img src="/images/taskgo-logo.png" alt="TaskGo" />
          </div>
          <h1 className="font-bold text-xl text-dark-900">Chi tiết dịch vụ</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-500 text-4xl">
              menu
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-20">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-bold text-primary-500">
              Chăm sóc người bệnh
            </h2>
          </div>

          <p className="text-base mb-4">
            Đây là dịch vụ chăm sóc người bệnh với các tuỳ chọn theo buổi hoặc
            theo ngày. Bao gồm các công việc:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-dark-300 mb-6">
            <li>Trông nom, chăm sóc người bệnh</li>
            <li>Cho người bệnh ăn uống</li>
            <li>Vệ sinh răng miệng, hỗ trợ gội đầu, tắm rửa</li>
            <li>Nâng đỡ, hỗ trợ di chuyển</li>
            <li>
              Đổ bô, chất thải của người bệnh khi không tự đi vệ sinh được
            </li>
            <li>Vệ sinh các công cụ đựng chất thải của người bệnh</li>
            <li>Hỗ trợ, giám sát người bệnh uống thuốc theo đơn</li>
            <li>Theo dõi nhiệt độ, huyết áp, mạch</li>
            <li>Xoa bóp vùng đau nhức, vỗ rung</li>
            <li>
              Thông báo tình trạng của người bệnh cho người thân khi cần thiết
            </li>
          </ul>

          <h3 className="text-lg font-bold text-dark-900">
            Chọn thời gian chăm sóc
          </h3>
          <div className="space-y-4">
            {timeOptions.map((option) => (
              <button
                key={option.hours}
                onClick={() => setSelectedTime(option)}
                className={`w-full rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  selectedTime.hours === option.hours
                    ? "border-blue-500 bg-blue-50"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-primary-500">
                      schedule
                    </span>
                    <span className="text-lg font-semibold">
                      {option.hours} giờ
                    </span>
                  </div>
                  <span className="text-lg font-bold">
                    {option.price.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleBookNow}
              className="action-btn action-btn-hover"
            >
              Đặt ngay
            </button>
            <button
              onClick={handleSchedule}
              className="action-btn action-btn-hover"
            >
              Đặt lịch trước
            </button>
          </div>
        </div>
      </main>

      <footer>
        <nav className="fixed bottom-0 left-0 right-0 bg-primary-200 border-t shadow-xl">
          <div className="flex justify-around py-2 text-base">
            <a href="#" className="flex flex-col items-center text-white">
              <span className="material-symbols-outlined text-4xl">house</span>
              Trang chủ
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">news</span>
              Hoạt động
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">chat</span>
              Tin nhắn
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">
                lightbulb
              </span>
              Thông báo
            </a>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default TakeCareOfSickPeople;
