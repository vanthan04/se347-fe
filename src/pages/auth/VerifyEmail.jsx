import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { authService } from "@/lib/services/authService";
import { APP_PATHS } from "@/lib/contants";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;

const VerifyEmail = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const contact =
    searchParams.get("contact") || localStorage.getItem("signup_email") || "";

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto focus next input
    if (numericValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all filled
    if (index === OTP_LENGTH - 1 && numericValue) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === OTP_LENGTH) {
        handleSubmit(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpCode) => {
    if (otpCode.length !== OTP_LENGTH) {
      setApiError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError("");
      await authService.verifyEmail({ code: otpCode });

      toast.success("Xác thực thành công!");
      navigate(APP_PATHS.AUTH.LOGIN);
    } catch (error) {
      setApiError(error.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(otp.join(""));
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setApiError("");
      const email = contact || localStorage.getItem("signup_email");

      if (!email) {
        setApiError("Không tìm thấy email. Vui lòng đăng ký lại.");
        return;
      }

      await authService.resendOtp(email);
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      setApiError(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center py-10 font-montserrat min-h-screen">
      <div className="w-full max-w-md h-fit bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <div className="mb-6">
          <Link
            to={APP_PATHS.AUTH.LOGIN}
            className="inline-block p-1 mb-6 -ml-2 text-gray-500 hover:text-dark-900 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <h1 className="text-2xl font-bold text-dark-900 mb-3">
            Nhập mã xác thực
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            Vui lòng nhập mã gồm {OTP_LENGTH} chữ số đã được gửi cho bạn.
          </p>
          <p className="text-gray-500 text-sm">
            Mã có hiệu lực trong 1h kể từ khi email được gửi.
          </p>
        </div>

        {apiError && (
          <div className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded-lg border border-red-300">
            {apiError}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12.5 h-12.5 text-center text-2xl font-semibold border border-gray-300 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full bg-primary-400 text-white py-3 rounded-xl text-lg font-semibold mb-6 hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-gray-500 text-sm">Chưa nhận được mã? </span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend}
            className={`font-medium ${
              canResend
                ? "text-primary-400 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {canResend ? "Gửi lại" : `Gửi lại sau (${countdown})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
