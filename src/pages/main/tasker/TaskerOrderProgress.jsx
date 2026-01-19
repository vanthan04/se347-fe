/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APP_PATHS } from "@/lib/contants";
import {
  taskerOrderService,
  reviewService,
} from "@/lib/services/taskerService";
import { reviewSchema } from "@/lib/schemas/taskerSchemas";
import { toast } from "react-toastify";

const TaskerOrderProgress = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await taskerOrderService.getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.order);
        updateState(response.order.status);

        // Check for existing review
        if (
          response.order.status === "completed" &&
          response.order.customer_id
        ) {
          checkExistingReview(response.order.customer_id);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async (customerId) => {
    try {
      const response = await reviewService.checkReview(customerId);
      if (response.success && response.review) {
        setExistingReview(response.review);
      }
    } catch (error) {
      console.error("Error checking review:", error);
    }
  };

  const updateState = (status) => {
    const stateMap = {
      assigned: 0,
      accepted: 1,
      departed: 2,
      arrived: 3,
      in_progress: 4,
      completed: 5,
    };
    setCurrentStep(stateMap[status] ?? -1);
  };

  const handleAccept = async () => {
    try {
      await taskerOrderService.acceptOrder(orderId);
      toast.success("Đã nhận đơn hàng");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Không thể nhận đơn hàng");
      console.error("Error accepting order:", error);
    }
  };

  const handleDepart = async () => {
    try {
      await taskerOrderService.confirmDepart(orderId);
      toast.success("Đã xác nhận khởi hành");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Không thể xác nhận khởi hành");
      console.error("Error confirming depart:", error);
    }
  };

  const handleArrive = async () => {
    try {
      await taskerOrderService.confirmArrive(orderId);
      toast.success("Đã xác nhận đến nơi");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Không thể xác nhận đến nơi");
      console.error("Error confirming arrive:", error);
    }
  };

  const handleStart = async () => {
    try {
      await taskerOrderService.confirmStart(orderId);
      toast.success("Đã bắt đầu làm việc");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Không thể xác nhận bắt đầu");
      console.error("Error confirming start:", error);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm("Xác nhận hoàn thành công việc?")) return;

    try {
      await taskerOrderService.confirmComplete(orderId);
      toast.success("Đã hoàn thành công việc");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Không thể xác nhận hoàn thành");
      console.error("Error confirming complete:", error);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Lý do hủy đơn:");
    if (!reason) return;

    try {
      await taskerOrderService.cancelOrder(orderId, reason);
      toast.success("Đã hủy đơn hàng");
      navigate(APP_PATHS.TASKER.HOME);
    } catch (error) {
      toast.error("Không thể hủy đơn hàng");
      console.error("Error canceling order:", error);
    }
  };

  const onSubmitReview = async (data) => {
    try {
      await reviewService.createReview(order.customer_id, data);
      toast.success("Đã gửi đánh giá");
      setShowReviewModal(false);
      checkExistingReview(order.customer_id);
    } catch {
      toast.error("Không thể gửi đánh giá");
    }
  };

  const getActionButton = () => {
    const buttonConfigs = {
      0: { text: "Nhận đơn hàng", icon: "check_circle", action: handleAccept },
      1: { text: "Xác nhận khởi hành", icon: "near_me", action: handleDepart },
      2: { text: "Xác nhận đã đến", icon: "location_on", action: handleArrive },
      3: { text: "Bắt đầu làm việc", icon: "play_arrow", action: handleStart },
      4: {
        text: "Hoàn thành công việc",
        icon: "check_circle",
        action: handleComplete,
      },
      5: null,
    };

    return buttonConfigs[currentStep];
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " VND";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // const getStatusBadgeClass = (status) => {
  //   const statusMap = {
  //     assigned: "bg-yellow-100 text-yellow-700",
  //     accepted: "bg-green-100 text-green-700",
  //     departed: "bg-purple-100 text-purple-700",
  //     arrived: "bg-indigo-100 text-indigo-700",
  //     in_progress: "bg-orange-100 text-orange-700",
  //     completed: "bg-green-100 text-green-700",
  //   };
  //   return statusMap[status] || "bg-gray-100 text-gray-700";
  // };

  // const getStatusText = (status) => {
  //   const statusMap = {
  //     assigned: "Đã được gán",
  //     accepted: "Đã nhận đơn",
  //     departed: "Đang di chuyển",
  //     arrived: "Đã đến nơi",
  //     in_progress: "Đang làm việc",
  //     completed: "Hoàn thành",
  //   };
  //   return statusMap[status] || status;
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryTasker-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const actionButton = getActionButton();

  const openChat = () => {
    navigate(`/tasker/chat?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-dark-900 flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-100 bg-white shadow-sm">
        <header className="bg-primary-200 flex items-center justify-between px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/tasker/home")}
              className="shrink-0 w-9 h-9 bg-white rounded-full p-1 flex items-center justify-center shadow-sm hover:bg-gray-50 transition text-primary-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <h1 className="text-dark-900 font-bold text-lg uppercase tracking-wide">
              Chi tiết công việc
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${order.customer?.phone || ""}`}
              className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition"
            >
              <span className="material-symbols-outlined text-dark-900">
                call
              </span>
            </a>
            <button
              onClick={openChat}
              className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition"
            >
              <span className="material-symbols-outlined text-dark-900">
                chat
              </span>
            </button>
          </div>
        </header>
      </nav>

      <main className="flex-grow p-4 md:py-6 md:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column - Details */}
          <div className="lg:col-span-7 space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 shrink-0 border border-indigo-100 p-0.5">
                  <img
                    src={order.customer?.avatar_url || "/default-avatar.png"}
                    alt="Customer"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-0.5">
                    Khách hàng
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-lg text-gray-800 leading-tight">
                        {order.customer?.full_name || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {order.customer?.phone || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChat}
                        className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-full font-bold text-xs hover:bg-blue-100 transition shadow-sm active:scale-95 border border-blue-200"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          chat
                        </span>
                        Nhắn tin
                      </button>
                      <a
                        href={`tel:${order.customer?.phone || ""}`}
                        className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-2 rounded-full font-bold text-xs hover:bg-green-100 transition shadow-sm active:scale-95 border border-green-200"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          call
                        </span>
                        Gọi ngay
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
              <h3 className="font-bold text-dark-900 text-lg flex items-center">
                <span className="material-symbols-outlined text-primary-500 mr-2">
                  info
                </span>
                Chi tiết dịch vụ
              </h3>
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {order.task_snapshot?.name || "Dịch vụ"}
                </h4>
                <div className="text-gray-600 space-y-1">
                  {order.type === "scheduled" ? (
                    <div className="bg-blue-50 p-3 rounded-lg mt-3 border border-blue-200">
                      <p className="text-sm font-semibold text-blue-700 flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">
                          schedule
                        </span>
                        Đã lên lịch
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {formatDateTime(order.scheduled_at)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 p-3 rounded-lg mt-3 border border-orange-200">
                      <p className="text-sm font-semibold text-orange-700 flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">
                          bolt
                        </span>
                        Ngay lập tức
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center mb-4">
                <span className="material-symbols-outlined text-[#3730A3] mr-2">
                  location_on
                </span>
                Địa chỉ làm việc
              </h3>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-gray-900">
                  {order.address_snapshot?.full_address ||
                    order.address_id?.full_address ||
                    "—"}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center mb-4">
                <span className="material-symbols-outlined text-[#3730A3] mr-2">
                  receipt
                </span>
                Thông tin thanh toán
              </h3>
              <div className="border-t border-gray-200 pt-3 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền dịch vụ</span>
                  <span className="font-semibold">
                    {formatCurrency(order.base_amount)}
                  </span>
                </div>
                {order.voucher_snapshot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giảm giá</span>
                    <span className="font-semibold text-green-600">
                      -{formatCurrency(order.voucher_snapshot.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 text-lg">
                    Tổng tiền
                  </span>
                  <span className="font-bold text-[#3730A3] text-xl">
                    {formatCurrency(order.final_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    sticky_note_2
                  </span>
                  Lưu ý từ khách
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-gray-700 text-sm italic">
                  {order.note}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="font-bold text-gray-800 text-lg">Tiến độ</h3>
              </div>

              {/* Timeline */}
              <div className="relative pl-2 mb-8">
                {[
                  {
                    step: 0,
                    icon: "check_circle",
                    label: "Nhận đơn hàng",
                    show: currentStep >= 0,
                  },
                  {
                    step: 1,
                    icon: "directions_car",
                    label: "Đang di chuyển",
                    show: true,
                  },
                  {
                    step: 2,
                    icon: "location_on",
                    label: "Đã đến nơi",
                    show: true,
                  },
                  {
                    step: 3,
                    icon: "play_arrow",
                    label: "Đang làm việc",
                    show: true,
                  },
                  {
                    step: 4,
                    icon: "check_circle",
                    label: "Hoàn thành",
                    show: true,
                  },
                ].map(
                  (item, index) =>
                    item.show && (
                      <div
                        key={index}
                        className={`step-item relative flex gap-4 ${index < 4 ? "pb-8" : ""}`}
                      >
                        <div className="flex flex-col items-center relative z-10">
                          <div
                            className={`step-icon w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                              currentStep >= item.step
                                ? "border-[#3730A3] bg-[#3730A3] text-white"
                                : "border-gray-200 bg-white text-gray-400"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {item.icon}
                            </span>
                          </div>
                          {index < 4 && (
                            <div
                              className={`w-0.5 h-full mt-1 ${
                                currentStep > item.step
                                  ? "bg-[#3730A3]"
                                  : "bg-gray-200"
                              }`}
                            ></div>
                          )}
                        </div>
                        <div className="pt-1">
                          <p
                            className={`font-bold text-sm uppercase transition-colors ${
                              currentStep >= item.step
                                ? "text-[#3730A3]"
                                : "text-gray-400"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.status_log?.[item.step]?.timestamp
                              ? formatDateTime(
                                  order.status_log[item.step].timestamp,
                                )
                              : "--:--"}
                          </p>
                        </div>
                      </div>
                    ),
                )}
              </div>

              {/* Review Section */}
              {currentStep === 5 && !existingReview && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">
                        star
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-amber-900 text-sm mb-1">
                        Đánh giá khách hàng
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        Hãy chia sẻ trải nghiệm của bạn
                      </p>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition"
                      >
                        Đánh giá ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {existingReview && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600 text-[20px]">
                        check_circle
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900 text-sm mb-2">
                        Đã đánh giá
                      </p>
                      <div className="text-xs text-green-700">
                        <p className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < existingReview.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </p>
                        {existingReview.comment && (
                          <p className="mt-2">{existingReview.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {actionButton && (
                <div>
                  <button
                    onClick={actionButton.action}
                    style={{ backgroundColor: "#3730A3" }}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {actionButton.icon}
                    </span>
                    <span>{actionButton.text}</span>
                  </button>

                  {currentStep < 5 && (
                    <button
                      onClick={handleCancel}
                      className="w-full mt-3 py-2 text-red-500 font-bold text-xs hover:bg-red-50 rounded-lg transition"
                    >
                      Hủy nhận đơn này
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReviewModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">
                  star
                </span>
                <div className="font-bold text-gray-800">
                  Đánh giá khách hàng
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitReview)}
              className="p-5 space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Đánh giá
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => {
                        setSelectedRating(rating);
                        setValue("rating", rating);
                      }}
                      className={`text-3xl transition ${
                        rating <= selectedRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  {...register("comment")}
                  rows="4"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#3730A3] focus:bg-white transition-all"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "#3730A3" }}
                  className="px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90 transition"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskerOrderProgress;
