/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "@/lib/stores/userStore";
import {
  profileUpdateSchema,
  addressSchema,
} from "@/lib/schemas/customerSchemas";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [map, setMap] = useState(null);

  const { token, user, setUser } = useUserStore();
  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
  });

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: addressErrors },
    setValue: setAddressValue,
    reset: resetAddress,
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.customer);
        setProfileValue("full_name", data.customer.full_name || "");
        setProfileValue("phone", data.customer.phone || "");
        setProfileValue("cccd", data.customer.cccd || "");
        setProfileValue("bin", data.customer.bin || "");
        setProfileValue("account_number", data.customer.account_number || "");
        setAvatarPreview(data.customer.avatar_url);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/customer/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      const res = await fetch("http://localhost:3000/api/customer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Cập nhật thông tin thành công!");
        setUser({ ...user, ...data });
        loadProfile();
      } else {
        toast.error(result.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật thông tin");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:3000/api/customer/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setAvatarPreview(data.avatar_url);
        toast.success("Cập nhật ảnh đại diện thành công!");
      } else {
        toast.error(data.message || "Upload ảnh thất bại");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Đã xảy ra lỗi khi upload ảnh");
    }
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      setAddressValue("full_address", address.full_address || "");
      setAddressValue("street", address.street || "");
      setAddressValue("ward", address.ward || "");
      setAddressValue("district", address.district || "");
      setAddressValue("city", address.city || "");
      setAddressValue("latitude", address.latitude || "");
      setAddressValue("longitude", address.longitude || "");
    } else {
      resetAddress();
    }
    setShowAddressModal(true);

    // Initialize map after modal renders
    setTimeout(() => initMap(address), 100);
  };

  const initMap = (address) => {
    if (typeof window.L === "undefined") {
      console.error("Leaflet not loaded");
      return;
    }

    const lat = address?.latitude || 10.762622;
    const lng = address?.longitude || 106.660172;

    const mapInstance = window.L.map("map").setView([lat, lng], 13);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    const markerInstance = window.L.marker([lat, lng], {
      draggable: true,
    }).addTo(mapInstance);

    markerInstance.on("dragend", async (e) => {
      const position = e.target.getLatLng();
      setAddressValue("latitude", position.lat);
      setAddressValue("longitude", position.lng);

      // Reverse geocoding
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`,
        );
        const data = await res.json();
        if (data.address) {
          setAddressValue("street", data.address.road || "");
          setAddressValue(
            "ward",
            data.address.suburb || data.address.neighbourhood || "",
          );
          setAddressValue(
            "district",
            data.address.city_district || data.address.county || "",
          );
          setAddressValue(
            "city",
            data.address.city || data.address.state || "",
          );
          setAddressValue("full_address", data.display_name || "");
        }
      } catch (err) {
        console.error("Error reverse geocoding:", err);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const onSubmitAddress = async (data) => {
    try {
      const url = editingAddress
        ? `http://localhost:3000/api/customer/addresses/${editingAddress._id}`
        : "http://localhost:3000/api/customer/addresses";

      const method = editingAddress ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(
          editingAddress
            ? "Cập nhật địa chỉ thành công!"
            : "Thêm địa chỉ thành công!",
        );
        loadAddresses();
        closeAddressModal();
      } else {
        toast.error(result.message || "Lưu địa chỉ thất bại");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error("Đã xảy ra lỗi khi lưu địa chỉ");
    }
  };

  const deleteAddress = async (addressId) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/customer/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Xóa địa chỉ thành công!");
        loadAddresses();
      } else {
        toast.error(data.message || "Xóa địa chỉ thất bại");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error("Đã xảy ra lỗi khi xóa địa chỉ");
    }
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    if (map) {
      map.remove();
      setMap(null);
    }
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth/login");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary-500 animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100 flex flex-col">
      <AppHeader
        title="Hồ sơ"
        showBack={true}
        onBackClick={() => navigate("/customer")}
      />

      <main className="flex-1 p-4 pb-24">
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={avatarPreview || "/images/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition"
            >
              <span className="material-symbols-outlined text-sm">
                photo_camera
              </span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h2 className="text-xl font-bold text-dark-900 mt-3">
            {profile.full_name}
          </h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmitProfile(onSubmitProfile)}
          className="bg-white rounded-xl shadow-md p-4 mb-4"
        >
          <h3 className="font-semibold text-dark-900 mb-4">
            Thông tin cá nhân
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                {...registerProfile("full_name")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              />
              {profileErrors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {profileErrors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                {...registerProfile("phone")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              />
              {profileErrors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {profileErrors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CCCD/CMND (tùy chọn)
              </label>
              <input
                type="text"
                {...registerProfile("cccd")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã BIN ngân hàng (tùy chọn)
              </label>
              <input
                type="text"
                {...registerProfile("bin")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tài khoản (tùy chọn)
              </label>
              <input
                type="text"
                {...registerProfile("account_number")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
          >
            Cập nhật thông tin
          </button>
        </form>

        {/* Addresses */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900">Địa chỉ của tôi</h3>
            <button
              onClick={() => openAddressModal()}
              className="text-primary-500 font-semibold text-sm"
            >
              + Thêm mới
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Chưa có địa chỉ nào
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address._id} className="border rounded-lg p-3">
                  <p className="font-medium text-dark-900">
                    {address.full_address}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.street}, {address.ward}, {address.district},{" "}
                    {address.city}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openAddressModal(address)}
                      className="text-primary-500 text-sm font-semibold"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteAddress(address._id)}
                      className="text-red-500 text-sm font-semibold"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
        >
          Đăng xuất
        </button>
      </main>

      <AppFooter />

      {/* Address Modal */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50"
          onClick={closeAddressModal}
        >
          <div
            className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-dark-900">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                onClick={closeAddressModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Map */}
            <div id="map" className="w-full h-64"></div>

            {/* Form */}
            <form
              onSubmit={handleSubmitAddress(onSubmitAddress)}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ đầy đủ
                </label>
                <input
                  type="text"
                  {...registerAddress("full_address")}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                />
                {addressErrors.full_address && (
                  <p className="text-red-500 text-sm mt-1">
                    {addressErrors.full_address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đường
                  </label>
                  <input
                    type="text"
                    {...registerAddress("street")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    {...registerAddress("ward")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    {...registerAddress("district")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thành phố/Tỉnh
                  </label>
                  <input
                    type="text"
                    {...registerAddress("city")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vĩ độ
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...registerAddress("latitude")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinh độ
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...registerAddress("longitude")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                    readOnly
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
              >
                {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
