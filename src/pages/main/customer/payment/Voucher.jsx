/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APP_PATHS } from "@/lib/contants";
import { voucherService } from "@/lib/services/customerService";
import { voucherSchema } from "@/lib/schemas/customerSchemas";
import { toast } from "react-toastify";

const Voucher = () => {
  const navigate = useNavigate();
  const [bookingDraft, setBookingDraft] = useState(null);
  const [voucherDraft, setVoucherDraft] = useState(null);
  const [eligibleVouchers, setEligibleVouchers] = useState([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [applying, setApplying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(voucherSchema),
  });

  useEffect(() => {
    loadBookingDraft();
    loadEligibleVouchers();
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

    const storedVoucherDraft = JSON.parse(localStorage.getItem("voucherDraft"));
    const initialVoucherDraft = storedVoucherDraft || {
      base_amount: draft.base_amount,
      voucher_code: null,
      discount_amount: 0,
      final_amount: draft.base_amount,
    };

    setVoucherDraft(initialVoucherDraft);
  };

  const loadEligibleVouchers = async () => {
    try {
      const response = await voucherService.getEligibleVouchers();
      if (response.success && response.data) {
        setEligibleVouchers(response.data);
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast.error("Không thể tải danh sách voucher");
    }
  };

  const onSubmitManualCode = async (data) => {
    await applyVoucherCode(data.voucher_code);
    setShowManualInput(false);
    reset();
  };

  const applyVoucherCode = async (voucherCode) => {
    if (!voucherCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setApplying(true);

    try {
      const response = await voucherService.applyVoucher(voucherCode);

      if (!response.success) {
        toast.error(response.message || "Mã giảm giá không hợp lệ");
        return;
      }

      const voucher = response.data;
      const baseAmount = bookingDraft.base_amount;
      let discountAmount = 0;

      if (voucher.discount_type === "percentage") {
        discountAmount = (baseAmount * voucher.discount_value) / 100;
        if (voucher.max_discount && discountAmount > voucher.max_discount) {
          discountAmount = voucher.max_discount;
        }
      } else {
        discountAmount = voucher.discount_value;
      }

      const finalAmount = Math.max(0, baseAmount - discountAmount);

      const newVoucherDraft = {
        base_amount: baseAmount,
        voucher_code: voucherCode,
        discount_amount: discountAmount,
        final_amount: finalAmount,
      };

      localStorage.setItem("voucherDraft", JSON.stringify(newVoucherDraft));
      setVoucherDraft(newVoucherDraft);

      // Update booking draft with final amount
      const updatedBookingDraft = {
        ...bookingDraft,
        final_amount: finalAmount,
      };
      localStorage.setItem("bookingDraft", JSON.stringify(updatedBookingDraft));
      setBookingDraft(updatedBookingDraft);

      toast.success(
        `Áp dụng voucher thành công! Giảm ${formatCurrency(discountAmount)}`,
      );
    } catch (error) {
      console.error("Error applying voucher:", error);
      toast.error("Không thể áp dụng voucher");
    } finally {
      setApplying(false);
    }
  };

  const removeVoucher = () => {
    const baseAmount = bookingDraft.base_amount;
    const newVoucherDraft = {
      base_amount: baseAmount,
      voucher_code: null,
      discount_amount: 0,
      final_amount: baseAmount,
    };

    localStorage.setItem("voucherDraft", JSON.stringify(newVoucherDraft));
    setVoucherDraft(newVoucherDraft);

    const updatedBookingDraft = { ...bookingDraft, final_amount: baseAmount };
    localStorage.setItem("bookingDraft", JSON.stringify(updatedBookingDraft));
    setBookingDraft(updatedBookingDraft);

    toast.info("Đã hủy voucher");
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " VND";
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-primary-100"
          >
            <span className="material-symbols-outlined text-3xl">
              arrow_back
            </span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Voucher</h1>
            <p className="text-sm opacity-90 mt-1">Chọn mã giảm giá của bạn</p>
          </div>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* Manual Code Input */}
        {!showManualInput ? (
          <button
            onClick={() => setShowManualInput(true)}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-gray-700">Nhập mã giảm giá</span>
            <span className="material-symbols-outlined text-primary-500">
              add
            </span>
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-4">
            <form
              onSubmit={handleSubmit(onSubmitManualCode)}
              className="space-y-3"
            >
              <input
                {...register("voucher_code")}
                placeholder="Nhập mã voucher"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.voucher_code && (
                <p className="text-red-500 text-xs">
                  {errors.voucher_code.message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {applying ? "Đang áp dụng..." : "Áp dụng"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInput(false);
                    reset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applied Voucher Summary */}
        {voucherDraft?.voucher_code && (
          <div className="bg-linear-to-r from-primary-400 to-primary-600 rounded-xl shadow-md p-4 text-white">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm opacity-90">Mã đã áp dụng</p>
                <p className="text-xl font-bold">{voucherDraft.voucher_code}</p>
              </div>
              <button
                onClick={removeVoucher}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span>Giảm giá:</span>
              <span className="font-semibold">
                -{formatCurrency(voucherDraft.discount_amount)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-white/30">
              <span>Tổng tiền:</span>
              <span>{formatCurrency(voucherDraft.final_amount)}</span>
            </div>
          </div>
        )}

        {/* Eligible Vouchers List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-dark-900">Voucher khả dụng</h2>

          {eligibleVouchers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <span className="material-symbols-outlined text-6xl mb-2 opacity-30">
                confirmation_number
              </span>
              <p>Không có voucher khả dụng</p>
            </div>
          ) : (
            eligibleVouchers.map((voucher) => (
              <div
                key={voucher._id}
                className={`bg-white rounded-xl shadow-md p-4 border-2 ${
                  voucherDraft?.voucher_code === voucher.code
                    ? "border-primary-500 bg-primary-50"
                    : "border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-dark-900">{voucher.code}</h3>
                    <p className="text-sm text-gray-600">
                      {voucher.description}
                    </p>
                  </div>

                  {voucherDraft?.voucher_code === voucher.code ? (
                    <button
                      onClick={removeVoucher}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      onClick={() => applyVoucherCode(voucher.code)}
                      disabled={applying}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {voucher.discount_type === "percentage"
                      ? `Giảm ${voucher.discount_value}%`
                      : `Giảm ${formatCurrency(voucher.discount_value)}`}
                  </span>

                  {voucher.max_discount && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Tối đa {formatCurrency(voucher.max_discount)}
                    </span>
                  )}

                  {voucher.min_order_value && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Đơn tối thiểu {formatCurrency(voucher.min_order_value)}
                    </span>
                  )}
                </div>

                {voucher.expiry_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    HSD:{" "}
                    {new Date(voucher.expiry_date).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={() => navigate(APP_PATHS.CUSTOMER.PAYMENT.CONFIRMATION)}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default Voucher;
