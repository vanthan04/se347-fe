import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const cancel = searchParams.get("cancel");

    if (cancel === "true" || status === "CANCELLED") {
      toast.warning("Bạn đã hủy thanh toán");
    } else {
      toast.error("Thanh toán thất bại");
    }
  }, [searchParams]);

  const handleRetry = () => {
    // Navigate back to payment confirmation to retry
    navigate(APP_PATHS.CUSTOMER.PAYMENT.CONFIRMATION);
  };

  const handleBackToHome = () => {
    navigate(APP_PATHS.CUSTOMER.HOME);
  };

  return (
    <div className="min-h-screen bg-primary-100 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Thanh toán không thành công</h1>
        <p className="text-sm opacity-90 mt-1">
          Vui lòng thử lại hoặc chọn phương thức khác
        </p>
      </div>

      <main className="p-4">
        <div className="max-w-md mx-auto space-y-4 mt-8">
          {/* Error Icon */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-yellow-500 text-6xl">
                cancel
              </span>
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              Thanh toán chưa hoàn tất
            </h2>
            <p className="text-gray-600">
              Giao dịch của bạn chưa được hoàn thành. Vui lòng thử lại hoặc chọn
              phương thức thanh toán khác.
            </p>
          </div>

          {/* Reason */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-dark-900 mb-3 flex items-center">
              <span className="material-symbols-outlined text-yellow-500 mr-2">
                info
              </span>
              Lý do có thể
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-base">
                  radio_button_unchecked
                </span>
                Bạn đã hủy giao dịch
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-base">
                  radio_button_unchecked
                </span>
                Thông tin thanh toán không chính xác
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-base">
                  radio_button_unchecked
                </span>
                Không đủ số dư trong tài khoản
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-gray-400 mr-2 text-base">
                  radio_button_unchecked
                </span>
                Lỗi kết nối mạng
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <h4 className="font-bold text-dark-900 mb-2 flex items-center">
              <span className="material-symbols-outlined text-primary-500 mr-2">
                support_agent
              </span>
              Cần hỗ trợ?
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Nếu bạn gặp vấn đề khi thanh toán, vui lòng liên hệ với chúng tôi
              qua:
            </p>
            <div className="space-y-1 text-sm">
              <p className="flex items-center text-primary-600">
                <span className="material-symbols-outlined mr-2 text-base">
                  phone
                </span>
                Hotline: 1900-xxxx
              </p>
              <p className="flex items-center text-primary-600">
                <span className="material-symbols-outlined mr-2 text-base">
                  email
                </span>
                Email: support@taskgo.vn
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg space-y-2">
        <button
          onClick={handleRetry}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
        >
          Thử lại thanh toán
        </button>
        <button
          onClick={handleBackToHome}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;
