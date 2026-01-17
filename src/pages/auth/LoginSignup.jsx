import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, signupSchema } from "@/lib/schemas/authSchemas";
import { authService } from "@/lib/services/authService";
import { getRedirectPath } from "@/lib/utils/auth";
import useUserStore from "@/lib/stores/userStore";
import { cn } from "@/lib/utils/cn";
import { APP_PATHS } from "@/lib/contants";
import PasswordInput from "@/components/auth/PasswordInput";
import FormInput from "@/components/auth/FormInput";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { toast } from "react-toastify";

const LoginSignup = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onLoginSubmit = async (data) => {
    try {
      setApiError("");
      const response = await authService.login(data);
      console.log("Login response:", response);

      login(response, response.token);

      const redirectPath = getRedirectPath(response.system_role);
      console.log("Redirect path:", redirectPath);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setApiError(
        error.response?.data?.message || "Không thể kết nối máy chủ.",
      );
    }
  };

  const onSignupSubmit = async (data) => {
    try {
      setApiError("");
      await authService.signupCustomer(data);

      toast.success("Đăng ký thành công! Vui lòng xác thực email.");
      navigate(APP_PATHS.AUTH.VERIFY_EMAIL);
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Không thể kết nối máy chủ.",
      );
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center py-10 font-montserrat">
      <div className="w-full max-w-md h-fit bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-10 text-lg font-semibold">
            <button
              onClick={() => setActiveTab("login")}
              className={cn(
                "pb-1 cursor-pointer",
                activeTab === "login"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400",
              )}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={cn(
                "pb-1 cursor-pointer",
                activeTab === "signup"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400",
              )}
            >
              Đăng ký
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className={cn(
              "flex transition-transform duration-300 ease-in-out",
              activeTab === "signup" && "-translate-x-full",
            )}
          >
            {/* LOGIN FORM */}
            <form
              onSubmit={handleLoginSubmit(onLoginSubmit)}
              className="w-full shrink-0 px-1"
            >
              <FormInput
                label="Địa chỉ email"
                type="email"
                placeholder="example@gmail.com"
                error={loginErrors.email?.message}
                {...loginRegister("email")}
              />

              <label className="block text-dark-900 font-medium mb-1 mt-4">
                Mật khẩu
              </label>
              <PasswordInput
                placeholder="**********"
                error={loginErrors.password?.message}
                {...loginRegister("password")}
              />
              {loginErrors.password && (
                <p className="text-red-500 text-xs mb-2 mt-1">
                  {loginErrors.password.message}
                </p>
              )}

              <div className="flex justify-between my-4">
                <Link
                  to={APP_PATHS.AUTH.RESEND_OTP}
                  className="text-primary-400 text-sm font-medium"
                >
                  Chưa kích hoạt?
                </Link>
                <Link
                  to={APP_PATHS.AUTH.FORGOT_PASSWORD}
                  className="text-primary-400 text-sm font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <ErrorMessage message={apiError} />

              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="cursor-pointer w-full bg-primary-400 text-white py-3 rounded-xl text-lg font-semibold mb-6 hover:bg-primary-500 transition-colors disabled:opacity-50"
              >
                {isLoginSubmitting ? "Đang xử lý..." : "Tiếp tục"}
              </button>

              <div className="flex items-center my-4">
                <div className="grow border-t"></div>
                <span className="px-3 text-gray-400">Hoặc</span>
                <div className="grow border-t"></div>
              </div>

              <button
                type="button"
                className="w-full border rounded-xl py-3 flex justify-center gap-3 mb-3"
              >
                <span className="text-xl"></span> Đăng nhập với Apple
              </button>

              <button
                type="button"
                className="w-full border rounded-xl py-3 flex justify-center items-center gap-3"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-6"
                  alt="Google"
                />
                Đăng nhập với Google
              </button>

              <div className="text-center mt-8">
                <span className="text-gray-400">Chưa có tài khoản?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-primary-400 font-medium ml-1 cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            </form>

            {/* SIGNUP FORM */}
            <form
              onSubmit={handleSignupSubmit(onSignupSubmit)}
              className="w-full shrink-0 px-1 flex flex-col gap-4"
            >
              <FormInput
                label="Số điện thoại"
                type="text"
                placeholder="0123456789"
                error={signupErrors.phone_number?.message}
                {...signupRegister("phone_number")}
              />

              <FormInput
                label="Email"
                type="email"
                placeholder="example@gmail.com"
                error={signupErrors.email?.message}
                {...signupRegister("email")}
              />

              <FormInput
                label="Họ tên"
                type="text"
                placeholder="Nguyễn Văn A"
                error={signupErrors.full_name?.message}
                {...signupRegister("full_name")}
              />

              <FormInput
                label="Căn cước công dân"
                type="text"
                placeholder="0513xxxxyyyy"
                error={signupErrors.identification?.message}
                {...signupRegister("identification")}
              />
              <div>
                <label className="block text-dark-900 font-medium mb-1">
                  Mật khẩu
                </label>
                <PasswordInput
                  placeholder="**********"
                  error={signupErrors.password?.message}
                  {...signupRegister("password")}
                />
                {signupErrors.password && (
                  <p className="text-red-500 text-xs mb-2">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              <ErrorMessage message={apiError} />

              <button
                type="submit"
                disabled={isSignupSubmitting}
                className="cursor-pointer w-full bg-primary-400 text-white py-3 rounded-xl text-lg font-semibold mb-6 hover:bg-primary-500 transition-colors disabled:opacity-50"
              >
                {isSignupSubmitting ? "Đang xử lý..." : "Tiếp tục"}
              </button>

              <div className="text-center mt-8">
                <span className="text-gray-400">Đăng ký làm Tasker?</span>
                <Link
                  to={APP_PATHS.AUTH.TASKER_SIGNUP}
                  className="text-primary-400 font-medium ml-1"
                >
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
