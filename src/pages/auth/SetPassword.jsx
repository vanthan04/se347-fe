import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setPasswordSchema } from "@/lib/schemas/authSchemas";
import { authService } from "@/lib/services/authService";
import PasswordInput from "@/components/auth/PasswordInput";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { toast } from "react-toastify";

const SetPassword = () => {
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setApiError("");
      const email = location.state?.email;

      if (!email) {
        setApiError("Phiên làm việc đã hết hạn. Vui lòng thử lại.");
        return;
      }

      await authService.setPassword({
        email,
        password: data.password,
      });

      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/auth/login");
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Không thể đặt lại mật khẩu.",
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center py-10 font-montserrat">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-dark-900 mb-2">
          Đặt lại mật khẩu
        </h2>
        <p className="text-gray-600 mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-dark-900 font-medium mb-1">
            Mật khẩu mới
          </label>
          <PasswordInput
            placeholder="**********"
            error={errors.password?.message}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mb-4">
              {errors.password.message}
            </p>
          )}

          <label className="block text-dark-900 font-medium mb-1 mt-3">
            Xác nhận mật khẩu
          </label>
          <PasswordInput
            placeholder="**********"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mb-4">
              {errors.confirmPassword.message}
            </p>
          )}

          <ErrorMessage message={apiError} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-400 text-white py-3 rounded-xl text-lg font-semibold hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
