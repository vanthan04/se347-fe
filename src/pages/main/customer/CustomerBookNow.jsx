/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "@/lib/stores/userStore";
import { APP_PATHS } from "@/lib/contants";
import { bookNowSchema } from "@/lib/schemas/customerSchemas";
import AppHeader from "@/components/layout/AppHeader";

const CustomerBookNow = () => {
  const [bookingDraft, setBookingDraft] = useState(null);
  const [taskerInfo, setTaskerInfo] = useState(null);
  const [taskInfo, setTaskInfo] = useState(null);

  const { token } = useUserStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookNowSchema),
  });

  useEffect(() => {
    loadBookingDraft();
  }, []);

  const loadBookingDraft = () => {
    const draft = localStorage.getItem("bookingDraft");
    if (!draft) {
      toast.error("Không tìm thấy thông tin đặt dịch vụ");
      navigate(APP_PATHS.CUSTOMER.HOME);
      return;
    }

    const parsedDraft = JSON.parse(draft);
    setBookingDraft(parsedDraft);
    loadTaskerAndTaskInfo(parsedDraft.tasker_id, parsedDraft.task_id);
  };

  const loadTaskerAndTaskInfo = async (taskerId, taskId) => {
    try {
      // Load tasker info
      const taskerRes = await fetch(
        `http://localhost:3000/api/tasker/${taskerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const taskerData = await taskerRes.json();
      if (taskerData.success) {
        setTaskerInfo(taskerData.tasker);
      }

      // Load task info
      const taskRes = await fetch(`http://localhost:3000/api/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const taskData = await taskRes.json();
      if (taskData.success) {
        setTaskInfo(taskData.task);
      }
    } catch (err) {
      console.error("Error loading info:", err);
    }
  };

  const onSubmit = async (data) => {
    const updatedDraft = {
      ...bookingDraft,
      note: data.note || "",
    };

    localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));
    navigate(APP_PATHS.CUSTOMER.PAYMENT.ROOT);
  };

  if (!bookingDraft) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary-500 animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100 flex flex-col">
      <AppHeader
        title="Ghi chú cho Tasker"
        showBack={true}
        onBackClick={() => navigate(-1)}
      />

      <main className="flex-1 p-4">
        {/* Booking Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h3 className="font-semibold text-dark-900 mb-3">
            Tóm tắt đặt dịch vụ
          </h3>

          {/* Task Info */}
          {taskInfo && (
            <div className="mb-3 pb-3 border-b">
              <p className="text-sm text-gray-600">Dịch vụ</p>
              <p className="font-semibold text-dark-900">
                {taskInfo.task_name}
              </p>
              <p className="text-primary-500 font-bold mt-1">
                {Number(taskInfo.pricing || 0).toLocaleString()} VND
              </p>
            </div>
          )}

          {/* Tasker Info */}
          {taskerInfo && (
            <div className="mb-3 pb-3 border-b">
              <p className="text-sm text-gray-600 mb-2">Tasker</p>
              <div className="flex items-center gap-3">
                <img
                  src={taskerInfo.avatar_url || "/images/default-avatar.png"}
                  alt={taskerInfo.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-dark-900">
                    {taskerInfo.full_name}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <span className="material-symbols-outlined text-sm">
                      star
                    </span>
                    <span>{taskerInfo.rating || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time */}
          <div>
            <p className="text-sm text-gray-600">Thời gian</p>
            <p className="font-medium text-dark-900">
              {bookingDraft.scheduled_at
                ? new Date(bookingDraft.scheduled_at).toLocaleString("vi-VN")
                : "Ngay lập tức"}
            </p>
          </div>
        </div>

        {/* Note Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="font-semibold text-dark-900 mb-3">
            Ghi chú cho Tasker
            <span className="text-gray-500 font-normal text-sm ml-2">
              (Tùy chọn)
            </span>
          </h3>

          <textarea
            {...register("note")}
            placeholder="Ví dụ: Vui lòng mang theo dụng cụ cần thiết, tôi sẽ chuẩn bị sẵn nước..."
            rows={5}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary-500 resize-none"
          />
          {errors.note && (
            <p className="text-red-500 text-sm mt-1">{errors.note.message}</p>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary-500 text-base">
                info
              </span>
              <span>
                Ghi chú sẽ được gửi đến Tasker để họ chuẩn bị tốt hơn cho công
                việc
              </span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
          >
            Tiếp tục thanh toán
          </button>
        </form>
      </main>
    </div>
  );
};

export default CustomerBookNow;
