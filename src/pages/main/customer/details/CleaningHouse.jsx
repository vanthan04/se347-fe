/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const CleaningHouse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [houseType, setHouseType] = useState("");
  const [selectedTime, setSelectedTime] = useState({ hours: 0, price: 0 });
  const [extras, setExtras] = useState({
    deep_clean: false,
    sanitizer: false,
    sofa: false,
  });
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = Number(searchParams.get("price")) || 180000;
  const taskId = searchParams.get("id");

  const timeOptions = [
    { hours: 2, price: 180000, area: "≤ 50m² hoặc 2 phòng" },
    { hours: 3, price: 250000, area: "≤ 80m² hoặc 3 phòng" },
    { hours: 4, price: 300000, area: "≤ 100m² hoặc 4 phòng" },
  ];

  const extraServices = [
    {
      key: "deep_clean",
      name: "Tổng vệ sinh sâu",
      desc: "Lau kỹ các khu vực khó tiếp cận",
      price: 100000,
    },
    {
      key: "sanitizer",
      name: "Khử khuẩn",
      desc: "Phù hợp gia đình có trẻ nhỏ",
      price: 50000,
    },
    {
      key: "sofa",
      name: "Giặt sofa / rèm",
      desc: "Tính thêm thời gian",
      price: 70000,
    },
  ];

  useEffect(() => {
    fetchTaskDetail();
  }, []);

  const fetchTaskDetail = async () => {
    try {
      const data = await taskService.getTaskDetail(taskId);
      if (data.success) {
        setTaskDetail(data.task);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Không thể tải thông tin dịch vụ");
    }
  };

  const calculateTotal = () => {
    let total = selectedTime.price;
    Object.keys(extras).forEach((key) => {
      if (extras[key]) {
        const extra = extraServices.find((e) => e.key === key);
        if (extra) total += extra.price;
      }
    });
    return total;
  };

  const saveDraft = () => {
    if (!houseType) {
      toast.error("Vui lòng chọn loại nhà");
      return false;
    }

    if (selectedTime.hours === 0) {
      toast.error("Vui lòng chọn thời gian");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateTotal(),
      final_amount: calculateTotal(),
      task_snapshot: {
        code: "HOUSE_CLEANING",
        name: taskDetail?.task_name || "Dọn dẹp nhà",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        house_type: houseType,
        hours: selectedTime.hours,
        num_rooms:
          selectedTime.hours === 2 ? 2 : selectedTime.hours === 3 ? 3 : 4,
        area_size:
          selectedTime.hours === 2 ? 50 : selectedTime.hours === 3 ? 80 : 100,
        deep_clean: extras.deep_clean,
        sanitizer: extras.sanitizer,
        sofa_cleaning: extras.sofa,
      },
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    return true;
  };

  const handleBookNow = () => {
    if (saveDraft()) {
      navigate(APP_PATHS.CUSTOMER.BOOK_NOW);
    }
  };

  const handleSchedule = () => {
    if (saveDraft()) {
      navigate(APP_PATHS.CUSTOMER.SCHEDULED);
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
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
            <h2 className="text-2xl font-bold text-primary-500">Dọn dẹp nhà</h2>
          </div>

          <p className="text-base mb-4">
            Đây là dịch vụ dọn dẹp nhà với các tuỳ chọn 2 giờ, 3 giờ, 4 giờ. Bao
            gồm 1 hoặc nhiều các công việc:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-dark-300 mb-6">
            <li>Lau bụi và lau bề mặt</li>
            <li>Sắp xếp giường cho gọn gàng</li>
            <li>Hút bụi, lau sàn</li>
            <li>Làm sạch toilet</li>
            <li>Sắp xếp ngăn nắp các vật dụng</li>
            <li>Rửa chén</li>
            <li>Đổ rác</li>
          </ul>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary-500 flex items-center gap-2">
              <span className="material-symbols-outlined">home</span>
              Chọn các thông tin cho yêu cầu vệ sinh nhà cửa
            </h3>

            <div className="space-y-2">
              <p className="text-l font-medium text-dark-500">Loại nhà</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "apartment", icon: "apartment", label: "Căn hộ" },
                  { type: "townhouse", icon: "home", label: "Nhà phố" },
                  { type: "office", icon: "business", label: "Văn phòng" },
                  { type: "shop", icon: "store", label: "Cửa hàng" },
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setHouseType(type)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      houseType === type
                        ? "border-blue-500 bg-blue-50"
                        : "border-primary-500 bg-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {icon}
                    </span>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-l font-medium text-dark-500">
                Chọn thời gian và diện tích tương ứng
              </p>
              <div className="space-y-3">
                {timeOptions.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => setSelectedTime(option)}
                    className={`w-full rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      selectedTime.hours === option.hours
                        ? "border-blue-500 bg-blue-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-primary-500">
                          schedule
                        </span>
                        <span className="text-lg font-semibold">
                          {option.hours} giờ
                        </span>
                      </div>
                      <span className="text-lg font-bold">
                        {formatCurrency(option.price)}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mt-1 text-center">
                      Phù hợp nhà {option.area}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-l font-medium text-dark-500">
                Chọn dịch vụ thêm
              </p>
              <div className="space-y-2">
                {extraServices.map((extra) => (
                  <label
                    key={extra.key}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={extras[extra.key]}
                      onChange={(e) =>
                        setExtras({ ...extras, [extra.key]: e.target.checked })
                      }
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-primary-500">
                      {extra.key === "deep_clean"
                        ? "cleaning_services"
                        : extra.key === "sanitizer"
                          ? "sanitizer"
                          : "weekend"}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${extras[extra.key] ? "text-blue-600" : ""}`}
                      >
                        {extra.name}
                      </p>
                      <p className="text-xs text-dark-400">{extra.desc}</p>
                      <p className="text-xs text-primary-500 font-semibold mt-1">
                        + {formatCurrency(extra.price)}/h
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-primary-400 rounded-xl p-4 text-primary">
            <div>
              <p className="text-xs opacity-80">Tổng tiền tạm tính</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculateTotal())}
              </p>
              <p className="text-xs mt-1 opacity-90">
                {selectedTime.hours} giờ
              </p>
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

export default CleaningHouse;
