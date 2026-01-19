/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const TakeCareOfSickPeople = () => {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [selectedTime, setSelectedTime] = useState({ hours: 0, price: 0 });
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = taskDetail?.pricing || 200000;

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
    <div className="bg-primary-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Chăm sóc người bệnh</h1>
        <p className="text-sm opacity-90 mt-1">
          Dịch vụ chăm sóc người bệnh tận tâm
        </p>
      </div>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📋 Dịch vụ bao gồm:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mt-2">
              <li>Trông nom, chăm sóc người bệnh</li>
              <li>Cho người bệnh ăn uống</li>
              <li>Vệ sinh răng miệng, hỗ trợ gội đầu, tắm rửa</li>
              <li>Thay đổi tư thế, chuyển động cho người bệnh</li>
              <li>Trò chuyện, đọc sách, xem TV cùng người bệnh</li>
            </ul>
          </div>

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
    </div>
  );
};

export default TakeCareOfSickPeople;
