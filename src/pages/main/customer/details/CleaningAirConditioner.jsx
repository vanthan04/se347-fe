/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const CleaningAirConditioner = () => {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [devices, setDevices] = useState([]);
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = taskDetail?.pricing || 300000;

  const acTypes = [
    { type: "wall", icon: "ac_unit", label: "Máy lạnh treo tường" },
    { type: "standing", icon: "view_agenda", label: "Máy lạnh đứng" },
    { type: "ceiling", icon: "grid_view", label: "Máy lạnh âm trần" },
  ];

  useEffect(() => {
    fetchTaskDetail();
  }, []);

  const fetchTaskDetail = async () => {
    try {
      const data = await taskService.getTaskDetail(taskId);
      if (data.success) setTaskDetail(data.task);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải thông tin dịch vụ");
    }
  };

  const addDevice = (type) => {
    const newDevice = {
      id: Date.now(),
      type,
      hp: "below_2",
      hasGas: false,
    };
    setDevices([...devices, newDevice]);
  };

  const updateDevice = (id, field, value) => {
    setDevices(
      devices.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };

  const removeDevice = (id) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  const calculateTotal = () => {
    let total = 0;
    devices.forEach((device) => {
      let price = basePrice;
      if (device.hp === "above_2") price *= 1.25;
      if (device.hasGas) price += 150000;
      total += price;
    });
    return total;
  };

  const saveDraft = () => {
    if (devices.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 máy lạnh");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateTotal(),
      final_amount: calculateTotal(),
      task_snapshot: {
        code: "AIRCONDITIONER",
        name: taskDetail?.task_name || "Vệ sinh máy lạnh",
        pricing: basePrice,
        unit: taskDetail?.unit || "máy",
      },
      task_payload: {
        num_units: devices.length,
        ac_types: devices.map((d) => d.type),
        service_type: "cleaning",
        has_gas: devices.some((d) => d.hasGas),
      },
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    return true;
  };

  const handleBookNow = () => {
    if (saveDraft()) navigate(APP_PATHS.CUSTOMER.BOOK_NOW);
  };

  const handleSchedule = () => {
    if (saveDraft()) navigate(APP_PATHS.CUSTOMER.SCHEDULED);
  };

  return (
    <div className="bg-primary-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Vệ sinh máy lạnh</h1>
        <p className="text-sm opacity-90 mt-1">
          Dịch vụ vệ sinh và bão dưỡng máy lạnh
        </p>
      </div>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📋 Quy trình 6 bước:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mt-2">
              <li>
                Bước 1: Bật, kiểm tra và xác nhận tình trạng máy với Khách hàng
                trước khi vệ sinh
              </li>
              <li>Bước 2: Vệ sinh bộ lọc và vỏ máy</li>
              <li>Bước 3: Vệ sinh giàn lạnh</li>
              <li>Bước 4: Vệ sinh giàn nóng</li>
              <li>Bước 5: Bơm ga máy lạnh (nếu có)</li>
              <li>Bước 6: Lắp lại và kiểm tra</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              <span className="font-semibold">💰 Giá dịch vụ:</span> 300.000 VNĐ
              cho 1 máy lạnh với công suất 2HP trở xuống và không kèm theo dịch
              vụ bơm gas. Dịch vụ Bơm gas kèm theo sẽ tính thêm 150.000 VNĐ cho
              mỗi máy.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-dark-900 text-base">
              Vui lòng chọn Loại máy lạnh với Công suất!
            </h3>

            {acTypes.map(({ type, icon, label }) => (
              <div key={type} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-500">
                      {icon}
                    </span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => addDevice(type)}
                    className="w-8 h-8 rounded-full border text-lg hover:bg-primary-50"
                  >
                    +
                  </button>
                </div>

                {devices
                  .filter((d) => d.type === type)
                  .map((device) => (
                    <div key={device.id} className="border-t pt-3 space-y-2">
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer flex-1">
                          <input
                            type="radio"
                            checked={device.hp === "below_2"}
                            onChange={() =>
                              updateDevice(device.id, "hp", "below_2")
                            }
                            className="accent-primary-500"
                          />
                          <span>Dưới 2 HP</span>
                        </label>
                        <label className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer flex-1">
                          <input
                            type="radio"
                            checked={device.hp === "above_2"}
                            onChange={() =>
                              updateDevice(device.id, "hp", "above_2")
                            }
                            className="accent-primary-500"
                          />
                          <span>Từ 2 HP trở lên</span>
                        </label>
                      </div>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-orange-500">
                            local_gas_station
                          </span>
                          <div>
                            <p className="font-medium">Bơm gas máy lạnh</p>
                            <p className="text-sm text-gray-400">
                              Chỉ áp dụng khi thiếu gas
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={device.hasGas}
                          onChange={(e) =>
                            updateDevice(device.id, "hasGas", e.target.checked)
                          }
                          className="accent-primary-500"
                        />
                      </label>

                      <button
                        onClick={() => removeDevice(device.id)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Xóa máy này
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-primary-400 rounded-xl p-4 text-primary">
            <div>
              <p className="text-xs opacity-80">Tổng tiền tạm tính</p>
              <p className="text-2xl font-bold">
                {calculateTotal().toLocaleString("vi-VN")}đ
              </p>
              <p className="text-xs mt-1 opacity-90">{devices.length} máy</p>
            </div>
            <span className="material-symbols-outlined text-4xl">payments</span>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleBookNow}
              className="action-btn action-btn-hover"
            >
              Đặt ngay
            </button>
            <button
              onClick={handleSchedule}
              className="action-btn action-btn-hover"
            >
              Đặt lịch trước
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CleaningAirConditioner;
