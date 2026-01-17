/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskerProfileService } from "@/lib/services/taskerService";
import { profileUpdateSchema } from "@/lib/schemas/taskerSchemas";
import { toast } from "react-toastify";

const TaskerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await taskerProfileService.getProfile();
      if (response.success) {
        setProfile(response);

        // Set form values
        // eslint-disable-next-line no-unused-vars
        const { user, tasker } = response;
        setValue("full_name", user.full_name || "");
        setValue("phone", user.phone || "");
        setValue("date_of_birth", user.date_of_birth?.split("T")[0] || "");
        setValue("gender", user.gender || "male");
        setValue("address.street", user.address?.street || "");
        setValue("address.ward", user.address?.ward || "");
        setValue("address.district", user.address?.district || "");
        setValue("address.province", user.address?.province || "");
        setValue("address.full_address", user.address?.full_address || "");

        setAvatarPreview(user.avatar_url);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await taskerProfileService.updateProfile(data);
      if (response.success) {
        toast.success("Cập nhật thông tin thành công");
        loadProfile();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await taskerProfileService.uploadAvatar(formData);
      if (response.success) {
        toast.success("Cập nhật ảnh đại diện thành công");
        loadProfile();
      } else {
        toast.error(response.message || "Tải ảnh thất bại");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-[#111827] mb-2">
            Hồ sơ cá nhân
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Avatar Section */}
          <div
            style={{ backgroundColor: "#3730A3" }}
            className="p-8 pb-16 relative"
          >
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                  <span className="material-symbols-outlined text-[#3730A3] text-[20px]">
                    photo_camera
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-8 -mt-8 pb-6 relative z-10">
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <span className="block text-lg font-bold text-gray-800">
                  {profile?.user?.reputation_score || "—"}{" "}
                  <span className="text-[#FFBE18] text-sm">★</span>
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  Uy tín
                </span>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <span className="block text-lg font-bold text-gray-800">
                  {profile?.tasker?.completed_jobs || 0}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  Hoàn thành
                </span>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <span className="block text-lg font-bold text-gray-800">
                  {profile?.tasker?.total_earnings?.toLocaleString("vi-VN") ||
                    0}
                  đ
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  Tổng thu
                </span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-6"
          >
            {/* Personal Information */}
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <span className="material-symbols-outlined text-[#3730A3] mr-2">
                  person
                </span>
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("full_name")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Nhập họ và tên"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    {...register("date_of_birth")}
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                  />
                  {errors.date_of_birth && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <span className="material-symbols-outlined text-[#3730A3] mr-2">
                  location_on
                </span>
                Địa chỉ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Địa chỉ cụ thể
                  </label>
                  <input
                    {...register("address.street")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phường/Xã
                  </label>
                  <input
                    {...register("address.ward")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Nhập phường/xã"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <input
                    {...register("address.district")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Nhập quận/huyện"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    {...register("address.province")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
                    placeholder="Nhập tỉnh/thành phố"
                  />
                </div>
              </div>
            </div>

            {/* Work Experience */}
            {profile?.tasker?.work_experience && (
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                  <span className="material-symbols-outlined text-[#3730A3] mr-2">
                    work
                  </span>
                  Kinh nghiệm làm việc
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {profile.tasker.work_experience}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{ backgroundColor: "#3730A3" }}
                className="px-6 py-2.5 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TaskerProfile;
