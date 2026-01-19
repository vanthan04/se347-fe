/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_PATHS } from "@/lib/contants";
import { paymentService } from "@/lib/services/customerService";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const orderCode = searchParams.get("orderCode");

      if (!orderCode) {
        setError("Không tìm thấy thông tin thanh toán");
        setVerifying(false);
        return;
      }

      //   // Get payment pending info from localStorage
      //   const pendingPayment = JSON.parse(
      //     localStorage.getItem("paymentPending") || "{}",
      //   );

      // Check payment status
      const response = await paymentService.checkPaymentStatus(orderCode);

      if (response.success && response.data) {
        setPaymentData(response.data);

        // Clear drafts on successful payment
        localStorage.removeItem("bookingDraft");
        localStorage.removeItem("voucherDraft");
        localStorage.removeItem("paymentPending");

        toast.success("Thanh toán thành công!");
      } else {
        setError("Không thể xác thực thanh toán");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setError("Có lỗi xảy ra khi kiểm tra thanh toán");
    } finally {
      setVerifying(false);
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " VND";
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">
            Đang xác thực thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-100 font-montserrat p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-5xl">
                error
              </span>
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <button
              onClick={() => navigate(APP_PATHS.CUSTOMER.HOME)}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Thanh toán thành công</h1>
        <p className="text-sm opacity-90 mt-1">Giao dịch đã được xác nhận</p>
      </div>

      <main className="p-4">
        <div className="max-w-md mx-auto space-y-4 mt-8">
          {/* Success Icon */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-500 text-6xl">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600">
              Cảm ơn bạn đã sử dụng dịch vụ TaskGo
            </p>
          </div>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <h3 className="font-bold text-dark-900 text-lg border-b pb-2">
                Thông tin thanh toán
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-semibold">{paymentData.orderCode}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(paymentData.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-semibold text-green-600">
                    Đã thanh toán
                  </span>
                </div>

                {paymentData.transactionDateTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-semibold">
                      {new Date(paymentData.transactionDateTime).toLocaleString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <h4 className="font-bold text-dark-900 mb-2 flex items-center">
              <span className="material-symbols-outlined text-primary-500 mr-2">
                info
              </span>
              Bước tiếp theo
            </h4>
            <p className="text-sm text-gray-700">
              Chúng tôi đang tìm Tasker phù hợp cho bạn. Bạn sẽ nhận được thông
              báo khi có Tasker nhận việc.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg space-y-2">
        <button
          onClick={() => navigate(APP_PATHS.CUSTOMER.ORDERS)}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
        >
          Xem đơn hàng
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

export default PaymentSuccess;
