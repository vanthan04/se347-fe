/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const CleaningWashingMachine = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = Number(searchParams.get("price")) || 500000;
  const taskId = searchParams.get("id");

  const washingTypes = [
    { type: "top", icon: "view_agenda", label: "Máy giặt cửa trên" },
    { type: "front", icon: "view_agenda", label: "Máy giặt cửa trước" },
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
      capacity: "below_9",
      removeDrum: false,
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
      let price = device.type === "top" ? 500000 : 700000;
      if (device.capacity === "above_9") price += 200000;
      if (device.removeDrum) price += 100000;
      total += price;
    });
    return total;
  };

  const saveDraft = () => {
    if (devices.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 máy giặt");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateTotal(),
      final_amount: calculateTotal(),
      task_snapshot: {
        code: "WASHING_MACHINE",
        name: taskDetail?.task_name || "Vệ sinh máy giặt",
        pricing: basePrice,
        unit: taskDetail?.unit || "máy",
      },
      task_payload: {
        num_units: devices.length,
        machine_types: devices.map((d) => d.type),
        service_type: "cleaning",
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
    <div className="bg-primary-100 min-h-screen font-montserrat">
      <header className="bg-primary-200 py-4">
        <div className="flex items-center justify-between px-4">
          <div className="text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-70">
            <img src="/images/taskgo-logo.png" alt="TaskGo" />
          </div>
          <h1 className="font-bold text-xl text-dark-900">Chi tiết dịch vụ</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-500 text-4xl">
              menu
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-20">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-bold text-primary-500">
              Vệ sinh máy giặt
            </h2>
          </div>

          <p className="text-base mb-4">
            Đây là dịch vụ vệ sinh máy giặt với quy trình 6 bước:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-dark-300 mb-6">
            <li>Bước 1: Bật máy kiểm tra tình trạng hoạt động</li>
            <li>Bước 2: Vệ sinh lưới lọc và van cấp nước</li>
            <li>
              Bước 3: Vệ sinh khay đựng nước giặt, xả; Vệ sinh lưới lọc xơ vải
            </li>
            <li>Bước 4: Vệ sinh lồng giặt</li>
            <li>Bước 5: Lắp ráp các linh kiện sau khi đã vệ sinh, lau khô</li>
            <li>Bước 6: Hoàn tất và kiểm tra lại</li>
          </ul>

          <div className="space-y-4">
            <h3 className="font-bold text-dark-900 text-base">
              Vui lòng chọn Loại máy giặt với công suất!
            </h3>

            {washingTypes.map(({ type, icon, label }) => (
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
                            checked={device.capacity === "below_9"}
                            onChange={() =>
                              updateDevice(device.id, "capacity", "below_9")
                            }
                            className="accent-primary-500"
                          />
                          <span>Dưới 9 Kg</span>
                        </label>
                        <label className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer flex-1">
                          <input
                            type="radio"
                            checked={device.capacity === "above_9"}
                            onChange={() =>
                              updateDevice(device.id, "capacity", "above_9")
                            }
                            className="accent-primary-500"
                          />
                          <span>Từ 9 Kg trở lên</span>
                        </label>
                      </div>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-orange-500">
                            grid_view
                          </span>
                          <div>
                            <p className="font-medium">Tháo lồng giặt</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={device.removeDrum}
                          onChange={(e) =>
                            updateDevice(
                              device.id,
                              "removeDrum",
                              e.target.checked,
                            )
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

      <footer>
        <nav className="fixed bottom-0 left-0 right-0 bg-primary-200 border-t shadow-xl">
          <div className="flex justify-around py-2 text-base">
            <a href="#" className="flex flex-col items-center text-white">
              <span className="material-symbols-outlined text-4xl">house</span>
              Trang chủ
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">news</span>
              Hoạt động
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">chat</span>
              Tin nhắn
            </a>
            <a href="#" className="flex flex-col items-center text-primary-500">
              <span className="material-symbols-outlined text-4xl">
                lightbulb
              </span>
              Thông báo
            </a>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default CleaningWashingMachine;
