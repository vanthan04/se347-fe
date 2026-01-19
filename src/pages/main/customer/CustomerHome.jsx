/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileService, taskService } from "@/lib/services/customerService";

const CustomerHome = () => {
  const [stats, setStats] = useState({
    points: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [favoriteTasks, setFavoriteTasks] = useState([]);
  const [popularTasks, setPopularTasks] = useState([]);
  const [favoriteTaskers, setFavoriteTaskers] = useState([]);
  const [selectedTasker, setSelectedTasker] = useState(null);

  const navigate = useNavigate();

  const TASK_DETAIL_MAP = {
    cleaning_washing_machine: "/customer/service/cleaning-washing-machine",
    cleaning_house: "/customer/service/cleaning-house",
    cleaning_air_conditioner: "/customer/service/cleaning-air-conditioner",
    caring_elderly: "/customer/service/caring-elderly",
    caring_thesick: "/customer/service/caring-sick",
    caring_children: "/customer/service/babysitting",
    shopping: "/customer/service/shopping",
    cooking: "/customer/service/cooking",
  };

  const loadCustomerStats = async () => {
    try {
      const [statsRes, pointsRes] = await Promise.all([
        profileService.getStats(),
        profileService.getReputationScore(),
      ]);

      setStats({
        points: pointsRes?.data?.points || 0,
        completedOrders: statsRes?.data?.completed_orders || 0,
        cancelledOrders: statsRes?.data?.cancelled_orders || 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadFavoriteTasks = async () => {
    try {
      const data = await taskService.getFavoriteTasks();
      if (data.success) {
        setFavoriteTasks(data.data || []);
      }
    } catch (err) {
      console.error("Error loading favorite tasks:", err);
    }
  };

  const loadPopularTasks = async () => {
    try {
      const data = await taskService.getPopularTasks();
      if (data.success) {
        setPopularTasks(data.data || []);
      }
    } catch (err) {
      console.error("Error loading popular tasks:", err);
    }
  };

  const loadFavoriteTaskers = async () => {
    try {
      const data = await profileService.getFavoriteTaskers();
      if (data.success) {
        setFavoriteTaskers(data.data || []);
      }
    } catch (err) {
      console.error("Error loading favorite taskers:", err);
    }
  };

  useEffect(() => {
    loadCustomerStats();
    loadFavoriteTaskers();
    loadFavoriteTasks();
    loadPopularTasks();
  }, []);

  const handleTaskClick = (taskType, taskId, price) => {
    const detailPage = TASK_DETAIL_MAP[taskType];
    if (detailPage) {
      navigate(`${detailPage}?id=${taskId}&price=${price}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ, ưu đãi..."
          className="w-full bg-white shadow-md px-4 py-3 rounded-full border focus:outline-none"
        />
      </div>

      {/* Stats - Tài khoản của bạn */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-dark-900">Tài khoản của bạn</h2>
          <button
            onClick={() => navigate("/customer/profile")}
            className="text-sm text-primary-500 hover:underline"
          >
            Xem chi tiết
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon="stars"
            label="Điểm tích lũy"
            value={stats.points || "--"}
            color="primary"
          />
          <StatCard
            icon="check_circle"
            label="Đơn thành công"
            value={stats.completedOrders || "--"}
            color="green"
          />
          <StatCard
            icon="cancel"
            label="Đơn đã huỷ"
            value={stats.cancelledOrders || "--"}
            color="red"
          />
        </div>
      </section>

      {/* Favorite Taskers - Horizontal scroll */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-dark-900">Tasker yêu thích</h2>
          <button className="text-primary-500 text-sm cursor-pointer hover:underline">
            Xem tất cả
          </button>
        </div>
        <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4 scrollbar-hide">
          {favoriteTaskers.length > 0 ? (
            favoriteTaskers.map((tasker) => (
              <TaskerCard
                key={tasker._id}
                tasker={tasker}
                onClick={() => setSelectedTasker(tasker)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 px-4">
              Bạn chưa có tasker yêu thích
            </p>
          )}
        </div>
      </section>

      {/* Favorite Tasks - Dịch vụ yêu thích của bạn */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-dark-900">
            Dịch vụ yêu thích của bạn
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {favoriteTasks.length > 0 ? (
            favoriteTasks.map((task) => (
              <TaskCard
                key={task._id || task.task_id}
                task={task}
                onClick={() =>
                  handleTaskClick(
                    task.task_type,
                    task._id || task.task_id,
                    task.pricing,
                  )
                }
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl mb-2 block">
                favorite_border
              </span>
              <p>Bạn chưa có dịch vụ yêu thích</p>
              <p className="text-xs mt-1">Đặt dịch vụ để xem ở đây</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Tasks - Các dịch vụ phổ biến */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-dark-900">Các dịch vụ phổ biến</h2>
          <button
            onClick={() => navigate("/customer/services")}
            className="text-primary-500 text-sm cursor-pointer"
          >
            Xem thêm →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {popularTasks.length > 0 ? (
            popularTasks
              .slice(0, 8)
              .map((task) => (
                <PopularTaskCard
                  key={task._id || task.task_id}
                  task={task}
                  onClick={() =>
                    handleTaskClick(
                      task.task_type,
                      task._id || task.task_id,
                      task.pricing,
                    )
                  }
                />
              ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400 text-sm">
              <p>Không có dịch vụ phổ biến</p>
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="mb-6">
        <div className="relative">
          <img
            src="/images/dichvudondep.png"
            alt="Banner"
            className="rounded-2xl w-full h-60 object-cover shadow-lg"
          />
          <div className="absolute bottom-6 left-6 text-white font-bold text-3xl drop-shadow-xl">
            Dịch vụ dọn dẹp <br /> trọn gói <br /> ...
          </div>
          <button className="absolute bottom-4 left-6 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-600 transition">
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pb-10">
        <p className="text-gray-500 text-sm">Chưa thấy dịch vụ bạn cần?</p>
        <button
          onClick={() => navigate("/customer/services")}
          className="text-primary-500 font-semibold"
        >
          Xem danh sách toàn bộ dịch vụ →
        </button>
      </div>

      {/* Tasker Modal */}
      {selectedTasker && (
        <TaskerModal
          tasker={selectedTasker}
          onClose={() => setSelectedTasker(null)}
        />
      )}
    </div>
  );
};

// Components
const StatCard = ({ icon, label, value, color = "primary" }) => {
  const bgColors = {
    primary: "bg-primary-100",
    green: "bg-green-100",
    red: "bg-red-100",
    yellow: "bg-yellow-100",
  };
  const textColors = {
    primary: "text-primary-500",
    green: "text-green-600",
    red: "text-red-500",
    yellow: "text-yellow-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full ${bgColors[color]} flex items-center justify-center`}
      >
        <span
          className={`material-symbols-outlined ${textColors[color]} text-lg`}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-[11px] text-gray-500 leading-none">{label}</p>
        <p className="text-lg font-bold text-dark-900">{value}</p>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="w-full h-32 bg-primary-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
      {task.avatar_url ? (
        <img
          src={task.avatar_url}
          alt={task.task_name}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <span className="material-symbols-outlined text-4xl text-primary-500">
          design_services
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-dark-900 line-clamp-2">
      {task.task_name || "Dịch vụ"}
    </p>
    {task.pricing && (
      <p className="text-xs font-semibold text-primary-500 mt-1">
        {Number(task.pricing).toLocaleString("vi-VN")}đ/
        {task.unit === "hour" ? "giờ" : "gói"}
      </p>
    )}
    {task.total_orders && (
      <p className="text-xs text-gray-500 mt-1">
        Đã đặt {task.total_orders} lần
      </p>
    )}
  </div>
);

// Popular Task Card - h-48 image like HTML template
const PopularTaskCard = ({ task, onClick }) => (
  <div
    onClick={onClick}
    className="service-item relative cursor-pointer hover:opacity-90 transition-opacity"
  >
    <div className="w-full h-48 bg-primary-100 rounded-xl flex items-center justify-center relative overflow-hidden">
      {task.avatar_url ? (
        <img
          src={task.avatar_url}
          alt={task.task_name}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <span className="material-symbols-outlined text-5xl text-primary-500">
          design_services
        </span>
      )}
      {task.total_orders && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {task.total_orders} đơn
        </div>
      )}
    </div>
    <p className="mt-1 text-sm font-medium text-dark-900">
      {task.task_name || "Dịch vụ"}
    </p>
    {task.pricing && (
      <p className="text-xs text-primary-500 font-semibold mt-1">
        {Number(task.pricing).toLocaleString("vi-VN")}đ/
        {task.unit === "hour" ? "giờ" : "gói"}
      </p>
    )}
  </div>
);

const TaskerCard = ({ tasker, onClick }) => {
  // Handle nested structure from API: { user: {...}, tasker: {...} }
  const user = tasker.user || tasker;
  const taskerInfo = tasker.tasker || tasker;
  const avatar =
    user.avatar_url || "https://api.dicebear.com/9.x/bottts/svg?seed=Julia";
  const name = user.full_name || "Tasker";
  const rating = user.reputation_score || taskerInfo.reputation_score || 0;

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-24 flex flex-col items-center cursor-pointer group"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-primary-500 transition-colors">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <p className="text-xs font-medium text-center mt-2 text-dark-900 group-hover:text-primary-500 truncate w-full">
        {name}
      </p>
      <div className="flex items-center text-[10px] text-gray-500">
        <span className="material-symbols-outlined text-[10px] text-yellow-500 mr-0.5">
          star
        </span>
        {rating}
      </div>
    </div>
  );
};

const TaskerModal = ({ tasker, onClose }) => {
  // Handle nested structure from API: { user: {...}, tasker: {...} }
  const user = tasker.user || tasker;
  const taskerInfo = tasker.tasker || tasker;
  const avatar =
    user.avatar_url || "https://api.dicebear.com/9.x/bottts/svg?seed=Julia";
  const name = user.full_name || "Tasker";
  const rating = user.reputation_score || taskerInfo.reputation_score || 0;
  const reviewsCount = taskerInfo.reviews_count || 0;
  const skill = taskerInfo.skill || "—";
  const totalJobs = taskerInfo.total_completed_tasks || 0;
  const location = taskerInfo.location || "—";
  const bio = taskerInfo.introduction || taskerInfo.bio || "";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[90%] max-w-125 p-5 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold"
        >
          &times;
        </button>

        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={avatar}
            alt={name}
            className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-primary-500"
          />
          <h3 className="text-xl font-bold text-dark-900">{name}</h3>
          <div className="flex items-center text-yellow-500 text-sm font-medium">
            <span>{rating}</span>
            <span className="material-symbols-outlined text-sm ml-1">star</span>
            <span className="text-gray-400 ml-1">
              ({reviewsCount} đánh giá)
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Chuyên môn:</span>
            <span className="font-medium text-dark-900">{skill}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Số việc đã làm:</span>
            <span className="font-medium text-dark-900">{totalJobs} việc</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Khu vực:</span>
            <span className="font-medium text-dark-900">{location}</span>
          </div>
          {bio && (
            <div>
              <span className="text-gray-500 block mb-1">Giới thiệu:</span>
              <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                {bio}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 py-2 rounded-lg border border-primary-500 text-primary-500 font-medium hover:bg-primary-50 transition">
            Nhắn tin
          </button>
          <button className="flex-1 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 shadow-md transition">
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
