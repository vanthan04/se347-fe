/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";

const OrderingSuccess = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = () => {
    const raw = localStorage.getItem("orderCreated");
    if (!raw) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      navigate(APP_PATHS.ROOT);
      return;
    }

    const order = JSON.parse(raw);
    setOrderData(order);
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " VND";
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderServiceDetails = () => {
    if (!orderData?.task_snapshot) return null;

    const service = orderData.task_snapshot;
    const payload = orderData.task_payload;

    const serviceRenderers = {
      COOKING: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số người:</strong> {payload.num_people} người
          </p>
          <p>
            <strong>Số bữa:</strong> {payload.num_meals} bữa
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
          {payload.meals && payload.meals.length > 0 && (
            <div>
              <strong>Bữa ăn:</strong>
              <ul className="list-disc list-inside ml-2">
                {payload.meals.map((meal, i) => (
                  <li key={i}>{meal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),

      CLEANING: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Diện tích:</strong> {payload.area_size} m²
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
          {payload.tasks && payload.tasks.length > 0 && (
            <div>
              <strong>Công việc:</strong>
              <ul className="list-disc list-inside ml-2">
                {payload.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),

      GROCERY: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số lượng mặt hàng:</strong> {payload.num_items} món
          </p>
          <p>
            <strong>Ngân sách:</strong> {formatCurrency(payload.budget)}
          </p>
          {payload.items && payload.items.length > 0 && (
            <div>
              <strong>Danh sách:</strong>
              <ul className="list-disc list-inside ml-2">
                {payload.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),

      HOUSE_CLEANING: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số phòng:</strong> {payload.num_rooms} phòng
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
          {payload.deep_clean && (
            <p className="text-primary-500">✓ Vệ sinh sâu</p>
          )}
        </div>
      ),

      CHILDCARE: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số trẻ:</strong> {payload.num_children} trẻ
          </p>
          <p>
            <strong>Độ tuổi:</strong> {payload.age_range}
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
        </div>
      ),

      ELDERLY: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số người:</strong> {payload.num_elderly} người
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
          {payload.special_needs && (
            <p>
              <strong>Yêu cầu đặc biệt:</strong> {payload.special_needs}
            </p>
          )}
        </div>
      ),

      SICK: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số người:</strong> {payload.num_patients} người
          </p>
          <p>
            <strong>Thời gian:</strong> {payload.hours} giờ
          </p>
          {payload.condition && (
            <p>
              <strong>Tình trạng:</strong> {payload.condition}
            </p>
          )}
        </div>
      ),

      AIRCONDITIONER: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số máy:</strong> {payload.num_units} máy
          </p>
          <p>
            <strong>Loại máy:</strong> {payload.ac_type}
          </p>
          <p>
            <strong>Dịch vụ:</strong> {payload.service_type}
          </p>
        </div>
      ),

      WASHING_MACHINE: () => (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Số máy:</strong> {payload.num_units} máy
          </p>
          <p>
            <strong>Loại máy:</strong> {payload.machine_type}
          </p>
          <p>
            <strong>Dịch vụ:</strong> {payload.service_type}
          </p>
        </div>
      ),
    };

    const renderer = serviceRenderers[service.type];
    return renderer ? (
      renderer()
    ) : (
      <p className="text-sm text-gray-600">Chi tiết dịch vụ</p>
    );
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-primary-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Đặt dịch vụ thành công</h1>
        <p className="text-sm opacity-90 mt-1">Cảm ơn bạn đã sử dụng dịch vụ</p>
      </div>

      <main className="p-4 space-y-4">
        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-500 text-5xl">
              check_circle
            </span>
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            Đặt dịch vụ thành công!
          </h2>
          <p className="text-gray-600">Đang tìm Tasker phù hợp cho bạn...</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <p className="text-xs text-gray-500">Mã đơn hàng</p>
              <p className="font-bold text-dark-900">{orderData._id}</p>
            </div>
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
              {orderData.status === "pending"
                ? "Đang tìm Tasker"
                : orderData.status}
            </span>
          </div>

          {/* Service Info */}
          <div>
            <h3 className="font-bold text-dark-900 mb-2">
              {orderData.task_snapshot?.name}
            </h3>
            {renderServiceDetails()}
          </div>

          {/* Timing */}
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600">
              <strong>Thời gian:</strong>{" "}
              {orderData.scheduling_type === "instant" ? (
                <span className="text-primary-500 font-semibold">
                  Ngay lập tức
                </span>
              ) : (
                formatDateTime(orderData.scheduled_time)
              )}
            </p>
          </div>

          {/* Address */}
          {orderData.address_snapshot && (
            <div className="border-t pt-3">
              <p className="text-sm">
                <strong>Địa chỉ:</strong>{" "}
                {orderData.address_snapshot.full_address}
              </p>
            </div>
          )}

          {/* Payment */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Giá dịch vụ</span>
              <span className="font-semibold">
                {formatCurrency(orderData.base_amount)}
              </span>
            </div>

            {orderData.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-semibold text-green-600">
                  -{formatCurrency(orderData.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Tổng tiền</span>
              <span className="text-primary-600">
                {formatCurrency(orderData.final_amount)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Thanh toán: {orderData.payment_method === "cash" && "Tiền mặt"}
              {orderData.payment_method === "bank_transfer" && "Chuyển khoản"}
              {orderData.payment_method === "ewallet" && "Ví TaskGo"}
              {orderData.payment_method === "credit_card" && "Thẻ tín dụng"}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-bold text-dark-900 mb-3">Trạng thái đơn hàng</h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-sm">
                  check
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-dark-900">
                  Đơn hàng đã được tạo
                </p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(orderData.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0 animate-pulse">
                <span className="material-symbols-outlined text-white text-sm">
                  search
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-dark-900">Đang tìm Tasker</p>
                <p className="text-xs text-gray-500">
                  Chúng tôi đang tìm Tasker phù hợp nhất cho bạn
                </p>
              </div>
            </div>

            <div className="flex items-start opacity-40">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-sm">
                  person
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-600">Tasker nhận việc</p>
                <p className="text-xs text-gray-500">Chờ xác nhận</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg space-y-2">
        <button
          onClick={() => navigate(APP_PATHS.CUSTOMER.ORDERS)}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
        >
          Xem chi tiết đơn hàng
        </button>
        <button
          onClick={() => navigate(APP_PATHS.CUSTOMER.HOME)}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default OrderingSuccess;
