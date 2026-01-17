/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/lib/contants";
import { taskService } from "@/lib/services/customerService";

const Babysitting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [childCount, setChildCount] = useState(1);
  const [childAges, setChildAges] = useState([null, null]);
  const [totalTime, setTotalTime] = useState(0);
  const [taskDetail, setTaskDetail] = useState(null);
  const basePrice = Number(searchParams.get("price")) || 100000;
  const taskId = searchParams.get("id");

  useEffect(() => {
    const confirmed = window.confirm(
      "Dịch vụ này chỉ dành cho bé từ 12 tháng tuổi đến 11 tuổi. Xin quý khách lưu ý!",
    );
    if (!confirmed) {
      navigate(-1);
    }
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

  const calculateBaseAmount = () => {
    if (!totalTime || !childCount) return 0;

    let amount = basePrice;

    if (childCount === 1 && totalTime === 120) return basePrice;

    // Mỗi trẻ thêm 30%
    if (childCount > 1) {
      amount += basePrice * 0.3 * (childCount - 1);
    }

    // Mỗi giờ thêm 50k
    if (totalTime > 120) {
      const hours = Math.round(totalTime / 60);
      amount += (hours - 2) * 50000;
    }

    return Math.round(amount);
  };

  const saveDraft = (updates = {}) => {
    const draft = {
      task_id: taskId,
      type: "immediate",
      base_amount: calculateBaseAmount(),
      final_amount: calculateBaseAmount(),
      task_snapshot: {
        code: "CHILDCARE",
        name: taskDetail?.task_name || "Chăm sóc trẻ em",
        pricing: basePrice,
        unit: taskDetail?.unit || "giờ",
      },
      task_payload: {
        num_children: childCount,
        age_ranges: childAges.filter(Boolean),
        hours: totalTime / 60,
        ...updates,
      },
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  };

  const handleBookNow = () => {
    if (!totalTime) {
      toast.error("Vui lòng chọn số giờ");
      return;
    }

    if (childAges.slice(0, childCount).some((age) => !age)) {
      toast.error("Vui lòng chọn độ tuổi cho tất cả trẻ");
      return;
    }

    saveDraft();
    navigate(APP_PATHS.CUSTOMER.BOOK_NOW);
  };

  const handleSchedule = () => {
    if (!totalTime) {
      toast.error("Vui lòng chọn số giờ");
      return;
    }

    if (childAges.slice(0, childCount).some((age) => !age)) {
      toast.error("Vui lòng chọn độ tuổi cho tất cả trẻ");
      return;
    }

    saveDraft();
    navigate(APP_PATHS.CUSTOMER.SCHEDULED);
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
            <h2 className="text-2xl font-bold text-primary-500">Trông trẻ</h2>
          </div>

          <p className="text-base mb-4">
            Đây là dịch vụ trông trẻ bao gồm 1 hoặc nhiều các công việc:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-dark-300 mb-6">
            <li>Đảm bảo sự an toàn cho trẻ trong suốt quá trình</li>
            <li>
              Hỗ trợ chuẩn bị và cho trẻ ăn theo yêu cầu và hướng dẫn của phụ
              huynh
            </li>
            <li>Tổ chức các hoạt động học và vui chơi theo độ tuổi</li>
            <li>Hướng dẫn và hỗ trợ vệ sinh cá nhân cho trẻ</li>
            <li>Hỗ trợ đưa đón trẻ đi học cự ly đi bộ gần nhà</li>
          </ul>

          <h3 className="text-lg font-bold text-dark-900">Chọn số lượng trẻ</h3>
          <div className="flex space-x-4">
            {[1, 2].map((count) => (
              <button
                key={count}
                onClick={() => {
                  setChildCount(count);
                  setChildAges(new Array(count).fill(null));
                }}
                className={`hour-btn hour-btn-hover w-50 ${
                  childCount === count ? "bg-green-500 text-white" : ""
                }`}
              >
                {count} trẻ
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-dark-900">
              Chọn độ tuổi của trẻ
            </h3>

            {Array.from({ length: childCount }).map((_, index) => (
              <div key={index}>
                <p className="text-base">Độ tuổi trẻ số {index + 1}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const newAges = [...childAges];
                      newAges[index] = "1-6";
                      setChildAges(newAges);
                    }}
                    className={`hour-btn hour-btn-hover w-50 ${
                      childAges[index] === "1-6"
                        ? "bg-green-500 text-white"
                        : ""
                    }`}
                  >
                    12 tháng - 6 tuổi
                  </button>
                  <button
                    onClick={() => {
                      const newAges = [...childAges];
                      newAges[index] = "7-11";
                      setChildAges(newAges);
                    }}
                    className={`hour-btn hour-btn-hover w-50 ${
                      childAges[index] === "7-11"
                        ? "bg-green-500 text-white"
                        : ""
                    }`}
                  >
                    7 tuổi - 11 tuổi
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-dark-900">Chọn số giờ</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[120, 180, 240, 300, 360, 420].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setTotalTime(minutes)}
                  className={`hour-btn hour-btn-hover ${
                    totalTime === minutes ? "bg-green-500 text-white" : ""
                  }`}
                >
                  {minutes / 60} giờ
                </button>
              ))}
            </div>
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

export default Babysitting;
