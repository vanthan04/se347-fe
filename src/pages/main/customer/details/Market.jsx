/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const MARKET_ITEMS = [
  "Gạo",
  "Mì gói",
  "Bún tươi",
  "Bánh mì",
  "Thịt heo",
  "Thịt bò",
  "Thịt gà",
  "Cá hồi",
  "Cá thu",
  "Cá basa",
  "Tôm",
  "Mực",
  "Rau cải",
  "Rau muống",
  "Cà chua",
  "Khoai tây",
  "Hành tây",
  "Trứng gà",
  "Trứng vịt",
  "Sữa tươi",
];

const Market = () => {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productInput, setProductInput] = useState("");
  const [selectedQuick, setSelectedQuick] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = taskDetail?.pricing || 80000;

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

  const handleAddProduct = () => {
    const product = selectedQuick || productInput;
    if (!product) {
      toast.error("Vui lòng chọn hoặc nhập tên sản phẩm");
      return;
    }

    if (selectedProducts.some((p) => p.name === product)) {
      toast.warning("Sản phẩm đã có trong danh sách");
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      { name: product, quantity: "1kg" },
    ]);
    setProductInput("");
    setSelectedQuick("");
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const handleQuantityChange = (index, quantity) => {
    const updated = [...selectedProducts];
    updated[index].quantity = quantity;
    setSelectedProducts(updated);
  };

  const calculateBaseAmount = () => {
    const numItems = selectedProducts.length;
    let serviceFee = basePrice;

    // Every 10 items add 20k
    if (numItems > 10) {
      const extra = Math.floor((numItems - 10) / 10);
      serviceFee += extra * 20000;
    }

    return serviceFee;
  };

  const saveDraft = () => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return false;
    }

    if (!estimatedAmount) {
      toast.error("Vui lòng nhập số tiền ước tính");
      return false;
    }

    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateBaseAmount(),
      final_amount: calculateBaseAmount(),
      task_snapshot: {
        code: "GROCERY",
        name: taskDetail?.task_name || "Đi chợ hộ",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        num_items: selectedProducts.length,
        budget: Number(estimatedAmount),
        items: selectedProducts.map((p) => `${p.name} - ${p.quantity}`),
        hours: 1,
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
    return amount.toLocaleString("vi-VN") + " VND";
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Đi chợ hộ</h1>
        <p className="text-sm opacity-90 mt-1">
          Dịch vụ mua sắm tạp hóa tiện lợi
        </p>
      </div>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📋 Lưu ý:</span> Bạn có thể chọn
              các sản phẩm từ danh sách có sẵn hoặc nhập sản phẩm nếu chưa có.
              Sau đó chọn khối lượng của từng món mà bạn muốn tasker mua hộ nhé.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 bg-white p-3 border border-gray-300 rounded-lg">
              <select
                value={selectedQuick}
                onChange={(e) => setSelectedQuick(e.target.value)}
                className="border-dashed bg-transparent flex-1 focus:outline-none px-3"
              >
                <option value="">-- Chọn nhanh sản phẩm --</option>
                {MARKET_ITEMS.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Hoặc nhập sản phẩm khác"
                className="flex-1 border-dashed focus:outline-none bg-transparent"
              />

              <button onClick={handleAddProduct}>
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="flex-1 text-base text-dark-900 font-bold my-2">
              Danh sách sản phẩm:
            </h3>
            <button
              onClick={handleClearAll}
              className="font-bold text-dark-900 hover:text-red-500"
            >
              Xoá tất cả
            </button>
          </div>

          <ul className="space-y-2 text-base mb-6">
            {selectedProducts.map((product, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span className="flex-1">{product.name}</span>
                <input
                  type="text"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  className="w-24 px-2 py-1 border rounded"
                  placeholder="Số lượng"
                />
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </li>
            ))}

            {selectedProducts.length === 0 && (
              <li className="text-center text-gray-400 py-4">
                Chưa có sản phẩm nào
              </li>
            )}
          </ul>

          <div>
            <h3 className="flex-1 text-base text-dark-900 font-bold my-2">
              Số tiền đi chợ ước tính:
            </h3>
            <p className="text-sm text-dark-100 mb-2">
              Bạn sẽ cần phải trả trước số tiền này
            </p>
            <div className="flex space-x-2">
              <select
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                className="p-3 border rounded-lg"
              >
                <option value="">Chọn nhanh</option>
                <option value="200000">200.000</option>
                <option value="300000">300.000</option>
                <option value="500000">500.000</option>
                <option value="700000">700.000</option>
                <option value="1000000">1.000.000</option>
              </select>

              <input
                type="number"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                placeholder="Nhập số tiền"
                className="flex-1 p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <p className="text-sm text-dark-900 font-medium">
            Phí dịch vụ ban đầu: {formatCurrency(calculateBaseAmount())} cho{" "}
            {selectedProducts.length} món
          </p>

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

export default Market;
