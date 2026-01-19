/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { scheduledSchema } from "@/lib/schemas/customerSchemas";
import { taskService, taskerService } from "@/lib/services/customerService";

const CustomerScheduled = () => {
  const [bookingDraft, setBookingDraft] = useState(null);
  const [taskerInfo, setTaskerInfo] = useState(null);
  const [taskInfo, setTaskInfo] = useState(null);
  const [minDateTime, setMinDateTime] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduledSchema),
  });

  useEffect(() => {
    // Set minimum datetime to current time
    const now = new Date();
    const localDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    setMinDateTime(localDateTime);

    loadBookingDraft();
  }, []);

  const loadBookingDraft = () => {
    const draft = localStorage.getItem("bookingDraft");
    if (!draft) {
      toast.error("Không tìm thấy thông tin đặt dịch vụ");
      navigate("/customer");
      return;
    }

    const parsedDraft = JSON.parse(draft);
    setBookingDraft(parsedDraft);
    loadTaskerAndTaskInfo(parsedDraft.tasker_id, parsedDraft.task_id);
  };

  const loadTaskerAndTaskInfo = async (taskerId, taskId) => {
    try {
      // Load tasker info
      const taskerData = await taskerService.getTaskerById(taskerId);
      if (taskerData.success) {
        setTaskerInfo(taskerData.tasker);
      }

      // Load task info
      const taskData = await taskService.getTaskDetail(taskId);
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
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      note: data.note || "",
    };

    localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));
    navigate("/customer/payment");
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
    <div className="space-y-4">
      {/* Booking Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <h3 className="font-semibold text-dark-900 mb-3">
          Tóm tắt đặt dịch vụ
        </h3>

        {/* Task Info */}
        {taskInfo && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-sm text-gray-600">Dịch vụ</p>
            <p className="font-semibold text-dark-900">{taskInfo.task_name}</p>
            <p className="text-primary-500 font-bold mt-1">
              {Number(taskInfo.pricing || 0).toLocaleString()} VND
            </p>
          </div>
        )}

        {/* Tasker Info */}
        {taskerInfo && (
          <div>
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
      </div>

      {/* Schedule Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <h3 className="font-semibold text-dark-900 mb-3">
          Chọn thời gian thực hiện
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày và giờ <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register("scheduled_at")}
            min={minDateTime}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary-500"
          />
          {errors.scheduled_at && (
            <p className="text-red-500 text-sm mt-1">
              {errors.scheduled_at.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Vui lòng chọn thời gian tối thiểu 1 giờ trước
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú cho Tasker
            <span className="text-gray-500 font-normal text-sm ml-2">
              (Tùy chọn)
            </span>
          </label>
          <textarea
            {...register("note")}
            placeholder="Ví dụ: Vui lòng mang theo dụng cụ cần thiết..."
            rows={4}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary-500 resize-none"
          />
          {errors.note && (
            <p className="text-red-500 text-sm mt-1">{errors.note.message}</p>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary-500 text-base">
              info
            </span>
            <span>
              Tasker sẽ nhận được thông báo về lịch hẹn của bạn và liên hệ trước
              khi đến
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-base">
              warning
            </span>
            <span>
              Bạn có thể hủy hoặc thay đổi lịch hẹn trong phần &ldquo;Hoạt
              động&rdquo;
            </span>
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
        >
          Tiếp tục thanh toán
        </button>
      </form>
    </div>
  );
};

export default CustomerScheduled;
