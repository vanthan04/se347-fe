import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resendOtpSchema } from "@/lib/schemas/authSchemas";
import { authService } from "@/lib/services/authService";
import { APP_PATHS } from "@/lib/contants";
import FormInput from "@/components/auth/FormInput";
import ErrorMessage from "@/components/auth/ErrorMessage";

const ResendOtp = () => {
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resendOtpSchema),
  });

  const onSubmit = async (data) => {
    try {
      setApiError("");
      await authService.resendOtp(data.email);
      setSuccess(true);

      localStorage.setItem("signup_email", data.email);

      setTimeout(() => {
        navigate(APP_PATHS.AUTH.VERIFY_EMAIL);
      }, 2000);
    } catch (error) {
      setApiError(error.response?.data?.message || "Không thể gửi mã OTP.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center py-10 font-montserrat">
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

          <h1 className="text-2xl font-bold text-dark-900">
            Kích hoạt tài khoản
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            Vui lòng nhập email đã đăng ký
          </p>
        </div>

        {success ? (
          <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-lg mb-4">
            Đã gửi mã OTP đến email của bạn. Đang chuyển hướng...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-dark-900 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs -mt-5 mb-4">
                {errors.email.message}
              </p>
            )}

            <ErrorMessage message={apiError} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-400 text-white py-3 rounded-xl text-lg font-semibold mb-4 hover:bg-primary-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi lại mã xác thực"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to={APP_PATHS.AUTH.LOGIN}
            className="text-primary-400 font-medium"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendOtp;
