/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APP_PATHS } from "@/lib/contants";
import {
  addressService,
  orderService,
  paymentService,
} from "@/lib/services/customerService";
import { addressSchema } from "@/lib/schemas/customerSchemas";
import { toast } from "react-toastify";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const [bookingDraft, setBookingDraft] = useState(null);
  const [voucherDraft, setVoucherDraft] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Map refs
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Address form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    loadBookingDraft();
    loadAddresses();
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

    initialVoucherDraft.base_amount = draft.base_amount;
    setVoucherDraft(initialVoucherDraft);
    localStorage.setItem("voucherDraft", JSON.stringify(initialVoucherDraft));

    if (initialVoucherDraft.discount_amount) {
      draft.final_amount = initialVoucherDraft.final_amount;
    }
    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  };

  const loadAddresses = async () => {
    try {
      const response = await addressService.getMyAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);

        // Auto-select default address
        const defaultAddr = response.data.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          saveSelectedAddress(defaultAddr._id, response.data);
        }
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ");
    }
  };

  const saveSelectedAddress = (addressId, addressList = addresses) => {
    const addr = addressList.find((a) => a._id === addressId);
    if (!addr) return;

    const draft = JSON.parse(localStorage.getItem("bookingDraft"));
    draft.address_id = addressId;
    draft.address_snapshot = {
      full_address: addr.full_address,
      latitude: addr.latitude,
      longitude: addr.longitude,
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    setBookingDraft(draft);
  };

  const handleAddressChange = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    saveSelectedAddress(addressId);
  };

  const initMap = () => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const marker = L.marker([10.8231, 106.6297], { draggable: true }).addTo(
      map,
    );

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setValue("latitude", pos.lat);
      setValue("longitude", pos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 200);
  };

  const handleOpenAddressModal = () => {
    setShowAddressModal(true);
    setValue("street", "");
    setValue("ward", "");
    setValue("district", "");
    setValue("city", "");
    setValue("latitude", 10.8231);
    setValue("longitude", 106.6297);

    setTimeout(() => {
      initMap();
    }, 100);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  };

  const onSubmitAddress = async (data) => {
    try {
      const full_address = [data.street, data.ward, data.district, data.city]
        .filter(Boolean)
        .join(", ");

      const addressData = {
        ...data,
        full_address,
      };

      const response = await addressService.addAddress(addressData);
      if (response.success) {
        toast.success("Thêm địa chỉ thành công");
        await loadAddresses();
        handleCloseAddressModal();
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Không thể thêm địa chỉ");
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ làm việc");
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = { ...bookingDraft };

      // Create order
      const orderResponse = await orderService.createOrder(orderPayload);
      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Tạo đơn hàng thất bại");
        return;
      }

      const newOrder = orderResponse.order;
      const orderId = newOrder._id;
      localStorage.setItem("orderCreated", JSON.stringify(newOrder));

      // Create receipt
      const receiptResponse = await orderService.createReceipt(
        orderId,
        paymentMethod,
      );

      if (paymentMethod === "cash") {
        navigate(APP_PATHS.CUSTOMER.PAYMENT.SUCCESS);
      } else if (paymentMethod === "bank_transfer") {
        // Create payment link
        const shortOrderId = orderId.slice(-6);
        const amount = bookingDraft.final_amount;

        const paymentLinkResponse = await paymentService.createPaymentLink(
          newOrder.customer_id,
          {
            order_id: orderId,
            receipt_id: receiptResponse.data._id,
            amount,
            description: `TT DH ${shortOrderId}`,
            items: [
              {
                name: bookingDraft.task_snapshot?.name || "TaskGo service",
                quantity: 1,
                price: amount,
              },
            ],
          },
        );

        if (
          !paymentLinkResponse.success ||
          !paymentLinkResponse.data?.checkoutUrl
        ) {
          toast.error("Không tạo được link thanh toán");
          return;
        }

        localStorage.setItem(
          "paymentPending",
          JSON.stringify({
            order_id: orderId,
            paymentId: paymentLinkResponse.data.id,
            orderCode: paymentLinkResponse.data.orderCode,
          }),
        );

        // Redirect to PayOS
        window.location.href = paymentLinkResponse.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Có lỗi xảy ra khi tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
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
    <div className="bg-primary-100 min-h-screen font-montserrat">
      <header className="bg-primary-200 py-4">
        <div className="flex items-center justify-between px-4">
          <div className="text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-70">
            <img src="/images/taskgo-logo.png" alt="TaskGo" />
          </div>

          <h1 className="font-bold text-xl text-dark-900">Dịch vụ của bạn</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-500 text-4xl">
              menu
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-32">
        {/* Address Selection */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
          <h3 className="font-bold text-dark-900">Địa chỉ làm việc</h3>

          <select
            value={selectedAddressId}
            onChange={handleAddressChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Chọn địa chỉ --</option>
            {addresses.map((addr) => (
              <option key={addr._id} value={addr._id}>
                {addr.full_address}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAddressModal}
            className="text-primary-500 hover:text-primary-700 flex items-center"
          >
            Thêm địa chỉ
            <span className="material-symbols-outlined ml-1">
              edit_location
            </span>
          </button>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
          <h3 className="font-bold text-dark-900">Phương thức thanh toán</h3>

          {["cash", "bank_transfer", "ewallet", "credit_card"].map((method) => (
            <label key={method} className="flex items-center space-x-3">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                {method === "cash" && "Tiền mặt"}
                {method === "bank_transfer" && "Chuyển khoản ngân hàng (Mã QR)"}
                {method === "ewallet" && "Ví TaskGo"}
                {method === "credit_card" && "Thẻ tín dụng"}
              </span>
            </label>
          ))}
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2 text-base">
          <div className="flex justify-between">
            <span className="text-gray-100">Tổng tiền dịch vụ</span>
            <span className="font-semibold text-gray-100">
              {formatCurrency(bookingDraft.base_amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-100">Mã giảm</span>
            <span className="font-semibold text-gray-100">
              {voucherDraft?.discount_amount
                ? `-${formatCurrency(voucherDraft.discount_amount)}`
                : "0 VND"}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-400 pb-2">
            <span className="text-gray-100">Phí dịch vụ (nếu có)</span>
            <span className="font-semibold text-gray-100">0 VND</span>
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
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="action-btn action-btn-hover disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận thông tin thanh toán"}
            </button>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 border border-gray-200 max-h-[80vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary-400 border-b-2 border-primary-400 pb-2 inline-block">
                Thêm địa chỉ mới
              </h3>
              <p className="text-gray-500 mt-2">Chọn địa chỉ cư trú của bạn</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitAddress)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-bold mb-2">
                    Số nhà, tên đường <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("street")}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="VD: 123 Nguyễn Văn Linh"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("ward")}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="VD: Phường Tân Phú"
                  />
                  {errors.ward && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ward.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("district")}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="VD: Quận 7"
                  />
                  {errors.district && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("city")}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="VD: Thành phố Hồ Chí Minh"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Chọn vị trí trên bản đồ{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  ref={mapRef}
                  className="h-64 rounded-xl border border-gray-300"
                ></div>
                {(errors.latitude || errors.longitude) && (
                  <p className="text-red-500 text-xs mt-1">
                    Vui lòng chọn vị trí trên bản đồ
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAddressModal}
                  className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
