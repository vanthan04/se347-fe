/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const Laundry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedHours, setSelectedHours] = useState(0);
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = Number(searchParams.get("price")) || 100000;
  const taskId = searchParams.get("id");

  const timeOptions = [
    { hours: 1, price: 100000 },
    { hours: 2, price: 180000 },
    { hours: 3, price: 250000 },
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

  const getPrice = () =>
    timeOptions.find((t) => t.hours === selectedHours)?.price || 0;

  const saveDraft = () => {
    if (selectedHours === 0) {
      toast.error("Vui lòng chọn thời gian");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: getPrice(),
      final_amount: getPrice(),
      task_snapshot: {
        code: "LAUNDRY",
        name: taskDetail?.task_name || "Giặt ủi",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        hours: selectedHours,
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
            <h2 className="text-2xl font-bold text-primary-500">Giặt ủi</h2>
          </div>

          <p className="text-base mb-4">
            Đây là dịch vụ giặt ủi với các tuỳ chọn 1 giờ, 2 giờ, 3 giờ. Bao gồm
            các công việc:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-dark-300 mb-6">
            <li>Phân loại quần áo sáng màu, tối màu</li>
            <li>Giặt quần áo</li>
            <li>Phơi quần áo</li>
            <li>Ủi quần áo</li>
            <li>Xếp quần áo</li>
          </ul>

          <div className="space-y-3">
            {timeOptions.map((option) => (
              <button
                key={option.hours}
                onClick={() => setSelectedHours(option.hours)}
                className={`hour-btn hour-btn-hover w-full ${selectedHours === option.hours ? "bg-green-500 text-white" : ""}`}
              >
                {option.hours} giờ - {option.price.toLocaleString("vi-VN")}đ
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

export default Laundry;
