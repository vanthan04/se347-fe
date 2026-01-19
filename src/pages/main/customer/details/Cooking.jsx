/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const Cooking = () => {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [numPeople, setNumPeople] = useState(2);
  const [numDishes, setNumDishes] = useState(2);
  const [flavor, setFlavor] = useState("Bắc");
  const [includeDessert, setIncludeDessert] = useState(false);
  const [includeGrocery, setIncludeGrocery] = useState(false);
  const [dishList, setDishList] = useState("");
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = taskDetail?.pricing || 100000;

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

  const calculateTotalTime = () => {
    let hours = 1; // Base 1 hour
    if (numDishes >= 3) hours += 0.5;
    if (numDishes >= 4) hours += 0.5;
    if (numPeople >= 5) hours += 0.5;
    if (includeDessert) hours += 0.25;
    return hours;
  };

  const calculateBaseAmount = () => {
    let amount = basePrice;

    // Extra cost for more dishes
    if (numDishes === 3) amount += 20000;
    if (numDishes === 4) amount += 40000;

    // Extra cost for more people
    if (numPeople >= 5) amount += 30000;

    // Extra services
    if (includeDessert) amount += 10000;
    if (includeGrocery) amount += 30000;

    return amount;
  };

  const saveDraft = () => {
    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateBaseAmount(),
      final_amount: calculateBaseAmount(),
      task_snapshot: {
        code: "COOKING",
        name: taskDetail?.task_name || "Nấu ăn gia đình",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        num_people: numPeople,
        num_meals: numDishes,
        flavor: flavor,
        hours: calculateTotalTime(),
        meals: dishList ? dishList.split(",").map((s) => s.trim()) : [],
        include_dessert: includeDessert,
        include_grocery: includeGrocery,
      },
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  };

  const handleBookNow = () => {
    saveDraft();
    navigate(APP_PATHS.CUSTOMER.BOOK_NOW);
  };

  const handleSchedule = () => {
    saveDraft();
    navigate(APP_PATHS.CUSTOMER.SCHEDULED);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Nấu ăn gia đình</h1>
        <p className="text-sm opacity-90 mt-1">
          Dịch vụ nấu ăn chuẩn vị 3 miền
        </p>
      </div>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📋 Lưu ý:</span> Dịch vụ nấu ăn
              cho gia đình từ 2-8 người, chuẩn vị 3 miền. Nguyên liệu nấu ăn do
              khách hàng chuẩn bị (hoặc trả tiền cho tasker đi chợ).
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Số người ăn</h3>
            <div className="flex items-center justify-center space-x-6 bg-gray-50 p-3 rounded-lg">
              <button
                onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
                className="w-10 h-10 flex items-center justify-center border-2 border-primary-500 text-primary-500 rounded-full font-bold text-2xl hover:bg-primary-50"
              >
                &minus;
              </button>
              <span className="text-2xl font-bold text-gray-800 w-8 text-center">
                {numPeople}
              </span>
              <button
                onClick={() => setNumPeople(Math.min(8, numPeople + 1))}
                className="w-10 h-10 flex items-center justify-center border-2 border-primary-500 text-primary-500 rounded-full font-bold text-2xl hover:bg-primary-50"
              >
                +
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Số món ăn</h3>
            <div className="flex space-x-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setNumDishes(count)}
                  className={`flex-1 py-2 border border-primary-500 rounded-lg font-medium ${
                    numDishes === count
                      ? "bg-primary-500 text-white"
                      : "text-primary-500"
                  }`}
                >
                  {count} món
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Khẩu vị</h3>
            <div className="flex space-x-3">
              {["Bắc", "Trung", "Nam"].map((region) => (
                <button
                  key={region}
                  onClick={() => setFlavor(region)}
                  className={`flex-1 py-2 border border-primary-500 rounded-lg font-medium ${
                    flavor === region
                      ? "bg-primary-500 text-white"
                      : "text-primary-500"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Dịch vụ thêm</h3>

            <div className="flex items-center justify-between bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="dessert-service"
                  checked={includeDessert}
                  onChange={(e) => setIncludeDessert(e.target.checked)}
                  className="w-6 h-6 accent-primary-600 cursor-pointer"
                />
                <div>
                  <label
                    htmlFor="dessert-service"
                    className="font-bold text-gray-800 cursor-pointer"
                  >
                    Tráng miệng
                  </label>
                  <p className="text-xs text-gray-500">
                    Hỗ trợ rửa và gọt trái cây
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary-600">
                +10.000đ
              </span>
            </div>

            <div className="flex items-center justify-between bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="grocery-service"
                  checked={includeGrocery}
                  onChange={(e) => setIncludeGrocery(e.target.checked)}
                  className="w-6 h-6 accent-primary-600 cursor-pointer"
                />
                <div>
                  <label
                    htmlFor="grocery-service"
                    className="font-bold text-gray-800 cursor-pointer"
                  >
                    Người làm đi chợ
                  </label>
                  <p className="text-xs text-gray-500">
                    Thanh toán theo hóa đơn thực tế
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary-600">
                +30.000đ
              </span>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Tên các món ăn</h3>
            <textarea
              rows="4"
              value={dishList}
              onChange={(e) => setDishList(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Ví dụ: Cá kho tộ, canh chua, rau muống xào..."
            />
          </section>

          <div className="flex justify-between items-center bg-primary-400 rounded-xl p-4 text-primary transition-all duration-300 transform">
            <div>
              <p className="text-xs opacity-80">Tổng tiền tạm tính</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculateBaseAmount())}
              </p>
              <p className="text-xs mt-1 opacity-90">
                {calculateTotalTime()} giờ
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl">payments</span>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleBookNow}
              className="flex-1 text-center py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all duration-200 shadow-lg"
            >
              Đặt ngay
            </button>
            <button
              onClick={handleSchedule}
              className="flex-1 text-center py-3 rounded-xl font-bold border-2 border-primary-500 text-primary-500 hover:bg-primary-100 active:scale-95 transition-all duration-200"
            >
              Đặt lịch trước
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cooking;
