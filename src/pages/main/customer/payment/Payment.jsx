/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";

const Payment = () => {
  const navigate = useNavigate();
  const [bookingDraft, setBookingDraft] = useState(null);
  const [voucherDraft, setVoucherDraft] = useState(null);

  useEffect(() => {
    loadBookingDraft();
  }, []);

  const loadBookingDraft = () => {
    const raw = localStorage.getItem("bookingDraft");
    if (!raw) {
      toast.error("Không tìm thấy thông tin đặt dịch vụ");
      navigate(APP_PATHS.ROOT);
      return;
    }

    const draft = JSON.parse(raw);
    setBookingDraft(draft);

    // Initialize voucher draft
    const storedVoucherDraft = JSON.parse(localStorage.getItem("voucherDraft"));
    const initialVoucherDraft = storedVoucherDraft || {
      base_amount: draft.base_amount,
      voucher_code: null,
      discount_amount: 0,
      final_amount: draft.base_amount,
    };

    initialVoucherDraft.base_amount = draft.base_amount;
    setVoucherDraft(initialVoucherDraft);
    localStorage.setItem("voucherDraft", JSON.stringify(initialVoucherDraft));

    // Update booking draft final amount if voucher applied
    if (initialVoucherDraft.discount_amount) {
      draft.final_amount = initialVoucherDraft.final_amount;
    }
    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " VND";
  };

  const renderServiceDetails = () => {
    if (!bookingDraft) return null;

    const serviceCode = bookingDraft.task_snapshot?.code || "DEFAULT";
    const payload = bookingDraft.task_payload || {};

    const serviceRenderers = {
      COOKING: (p) => (
        <>
          <p>👥 Nấu cho: {p.people} người</p>
          <p>🍽️ Số món: {p.dishes}</p>
          <p>
            ⏱️ Thời gian làm việc: {Math.floor(p.total_time / 60)}h{" "}
            {p.total_time % 60}p
          </p>
          {p.has_dessert && <p>🍎 Có tráng miệng</p>}
          {p.do_grocery && <p>🛒 Có đi chợ</p>}
        </>
      ),
      CLEANING: (p) => (
        <>
          <p>🏠 Diện tích: {p.area} m²</p>
          <p>🧹 Loại hình: {p.cleaning_type}</p>
          <p>👥 Nhân viên: {p.staff_count}</p>
          <p>⏱️ Thời gian: {p.total_time} giờ</p>
        </>
      ),
      GROCERY: (p) => (
        <>
          <p>
            🛒 Tổng số sản phẩm: <strong>{p.items?.length || 0}</strong>
          </p>
          <div className="mt-2 space-y-1">
            {(p.items || []).map((item, i) => (
              <p key={i}>
                🧺 {item.name} - {item.quantity} {item.unit}
              </p>
            ))}
          </div>
          {p.estimated_budget && (
            <p className="mt-2">
              💰 Ngân sách ước tính:{" "}
              {Number(p.estimated_budget).toLocaleString()}đ
            </p>
          )}
          <p>
            <strong>
              Lưu ý tổng tiền cần thanh toán sẽ là tổng phí dịch vụ + số tiền
              ước tính
            </strong>
          </p>
        </>
      ),
      HOUSE_CLEANING: (p) => {
        const extrasArr = p.extras ? Object.values(p.extras) : [];
        return (
          <div className="space-y-1">
            <p>
              ⏱️ Thời gian combo dọn dẹp gốc: <strong>{p.base_time} giờ</strong>
            </p>
            {p.total_time && p.total_time > p.base_time && (
              <p>
                ⏱️ Thời gian thực hiện tổng: <strong>{p.total_time} giờ</strong>
              </p>
            )}
            {p.house_type && (
              <p>
                🏠 Loại nhà: <strong>{p.house_type}</strong>
              </p>
            )}
            {extrasArr.length > 0 ? (
              <div className="mt-2">
                <p>🧩 Dịch vụ thêm:</p>
                <ul className="ml-4 list-disc space-y-1">
                  {extrasArr.map((e, i) => (
                    <li key={i} className="pl-30 text-m text-dark-300">
                      {e.name} (+{Number(e.price).toLocaleString()}đ/giờ)
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                🧩 Dịch vụ thêm: <span className="text-gray-500">Không có</span>
              </p>
            )}
          </div>
        );
      },
      CHILDCARE: (p) => (
        <>
          <p>👶 Số lượng trẻ: {p.child_count} bé</p>
          <p>
            ⏱️ Thời gian làm việc: {Math.floor(p.total_time / 60)}h{" "}
            {p.total_time % 60}p
          </p>
          <p>📋 Độ tuổi các bé:</p>
          <ul className="pl-5 list-disc">
            {(p.child_ages || []).map((age, i) => (
              <li key={i}>
                🧒 Bé {i + 1}:{" "}
                {age === "1-6" ? "12 tháng – 6 tuổi" : "7 – 11 tuổi"}
              </li>
            ))}
          </ul>
        </>
      ),
      ELDERLY: (p) => (
        <>
          <p>
            ⏱️ Thời gian làm việc: {Math.floor(p.total_time / 60)}h{" "}
            {p.total_time % 60}p
          </p>
          <p className="mt-2 font-semibold">
            🧾 Tổng cộng: {(p.final_amount || 0).toLocaleString()}đ
          </p>
        </>
      ),
      SICK: (p) => (
        <>
          <p>
            ⏱️ Thời gian làm việc: {Math.floor(p.total_time / 60)}h{" "}
            {p.total_time % 60}p
          </p>
          <p className="mt-2 font-semibold">
            🧾 Tổng cộng: {(p.final_amount || 0).toLocaleString()}đ
          </p>
        </>
      ),
      AIRCONDITIONER: (p) => (
        <>
          {(p.devices || []).map((d, i) => (
            <div key={i} className="ml-3 mt-2">
              <p>
                🔧{" "}
                <strong>
                  Thiết bị {i + 1}: {d.label}
                </strong>
              </p>
              <p>
                ⚡ Công suất:{" "}
                {d.hp === "below_2" ? "Dưới 2 HP" : "Từ 2 HP trở lên"}
              </p>
              <p>🛢️ Bơm gas: {d.has_gas ? "Có" : "Không"}</p>
              <p>💰 Giá: {d.amount.toLocaleString()}đ</p>
            </div>
          ))}
          <p className="mt-2 font-semibold">
            🧾 Tổng cộng: {(p.final_amount || 0).toLocaleString()}đ
          </p>
        </>
      ),
      WASHING_MACHINE: (p) => (
        <>
          {(p.devices || []).map((d, i) => (
            <div key={i} className="ml-3 mt-2">
              <p>
                🔧{" "}
                <strong>
                  Thiết bị {i + 1}: {d.label}
                </strong>
              </p>
              <p>
                ⚡ Khối lượng lồng giặt:{" "}
                {d.capacity === "below_9" ? "Dưới 9 Kg" : "Từ 9 Kg trở lên"}
              </p>
              <p>🛢️ Tháo lồng giặt: {d.remove ? "Có" : "Không"}</p>
              <p>💰 Giá: {d.amount.toLocaleString()}đ</p>
            </div>
          ))}
          <p className="mt-2 font-semibold">
            🧾 Tổng cộng: {(p.final_amount || 0).toLocaleString()}đ
          </p>
        </>
      ),
      DEFAULT: () => <p className="text-gray-400">Không có chi tiết dịch vụ</p>,
    };

    const renderer = serviceRenderers[serviceCode] || serviceRenderers.DEFAULT;

    return (
      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        <div>
          <p className="text-dark-400 font-bold">Thông tin Dịch vụ đã đặt</p>
        </div>

        <div className="border-b pb-2">
          <p className="text-dark-400 font-semibold">
            {bookingDraft.task_snapshot?.name || "Dịch vụ"}
          </p>
        </div>

        <div className="text-l semibold text-dark-500 space-y-1">
          {renderer(payload)}
        </div>

        {bookingDraft.note && (
          <div className="bg-gray-50 p-2 rounded text-m">
            <strong className="text-red-600">Ghi chú:</strong>{" "}
            {bookingDraft.note}
          </div>
        )}
      </div>
    );
  };

  if (!bookingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-primary-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Dịch vụ của bạn</h1>
        <p className="text-sm opacity-90 mt-1">
          Kiểm tra thông tin dịch vụ và thanh toán
        </p>
      </div>

      <main className="p-4 space-y-4">
        {/* Service Summary */}
        {renderServiceDetails()}

        {/* Voucher */}
        <button
          onClick={() => navigate(APP_PATHS.CUSTOMER.PAYMENT.VOUCHER)}
          className="flex justify-between items-center bg-white rounded-xl shadow-md p-4 text-gray-400 font-medium hover:bg-gray-50 w-full"
        >
          <span className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-gray-100 text-xl">
              confirmation_number
            </span>
            <span>Thêm mã giảm giá</span>
          </span>
          <span className="material-symbols-outlined text-gray-400">
            chevron_right
          </span>
        </button>

        {/* Total Amount */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2 text-base">
          <div className="flex justify-between">
            <span className="text-gray-800">Tổng tiền dịch vụ</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(bookingDraft.base_amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-800">Mã giảm</span>
            <span className="font-semibold text-gray-800">
              {voucherDraft?.discount_amount
                ? `-${formatCurrency(voucherDraft.discount_amount)}`
                : "0 VND"}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-400 pb-2">
            <span className="text-gray-800">Phí dịch vụ (nếu có)</span>
            <span className="font-semibold text-gray-800">0 VND</span>
          </div>

          <div className="flex justify-between text-base pt-2">
            <span className="font-bold text-dark-900">Tổng tiền</span>
            <span className="font-bold text-dark-900">
              {formatCurrency(bookingDraft.final_amount)}
            </span>
          </div>

          <div className="flex justify-between items-center space-y-4 space-x-4">
            <span className="text-2xl font-bold text-dark-900">
              {formatCurrency(bookingDraft.final_amount)}
            </span>
            <button
              onClick={() => navigate(APP_PATHS.CUSTOMER.PAYMENT.CONFIRMATION)}
              className="action-btn action-btn-hover"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
