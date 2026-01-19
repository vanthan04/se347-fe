/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const Laundry = () => {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [selectedHours, setSelectedHours] = useState(0);
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = taskDetail?.pricing || 100000;

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
    <div className="bg-primary-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Giặt ủi</h1>
        <p className="text-sm opacity-90 mt-1">
          Dịch vụ giặt ủi quần áo chuyên nghiệp
        </p>
      </div>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📋 Dịch vụ bao gồm:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mt-2">
              <li>Phân loại quần áo sáng màu, tối màu</li>
              <li>Giặt quần áo</li>
              <li>Phơi quần áo</li>
              <li>Ủi quần áo</li>
              <li>Xếp quần áo</li>
            </ul>
          </div>

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
    </div>
  );
};

export default Laundry;
