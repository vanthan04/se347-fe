/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/lib/stores/userStore";
import { APP_PATHS } from "@/lib/contants";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const CustomerHome = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    ongoingOrders: 0,
  });
  const [favoriteTasks, setFavoriteTasks] = useState([]);
  const [popularTasks, setPopularTasks] = useState([]);
  const [favoriteTaskers, setFavoriteTaskers] = useState([]);
  const [selectedTasker, setSelectedTasker] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { token } = useUserStore();
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

  useEffect(() => {
    loadCustomerStats();
    loadFavoriteTaskers();
    loadFavoriteTasks();
    loadPopularTasks();
  }, []);

  const loadCustomerStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/customer/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats({
          totalOrders: data.total_orders || 0,
          completedOrders: data.completed_orders || 0,
          ongoingOrders: data.ongoing_orders || 0,
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadFavoriteTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/task/favorite", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFavoriteTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Error loading favorite tasks:", err);
    }
  };

  const loadPopularTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/task/popular", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPopularTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Error loading popular tasks:", err);
    }
  };

  const loadFavoriteTaskers = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/customer/favorite-taskers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setFavoriteTaskers(data.taskers || []);
      }
    } catch (err) {
      console.error("Error loading favorite taskers:", err);
    }
  };

  const handleTaskClick = (taskType, taskId, price) => {
    const detailPage = TASK_DETAIL_MAP[taskType];
    if (detailPage) {
      navigate(`${detailPage}?id=${taskId}&price=${price}`);
    }
  };

  return (
    <div className="min-h-screen bg-primary-100 flex flex-col">
      <AppHeader
        title="Trang chủ"
        showMenu={true}
        onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-18 left-0 w-full bg-primary-200 shadow-xl z-40 border-b border-primary-300 md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            <button
              onClick={() => navigate(APP_PATHS.CUSTOMER.HOME)}
              className="flex items-center space-x-3 text-dark-900 font-bold"
            >
              <span className="material-symbols-outlined">house</span>
              <span>Trang chủ</span>
            </button>
            <button
              onClick={() => navigate(APP_PATHS.CUSTOMER.ACTIVITY)}
              className="flex items-center space-x-3 text-primary-500 font-medium"
            >
              <span className="material-symbols-outlined">news</span>
              <span>Hoạt động</span>
            </button>
            <button
              onClick={() => navigate(APP_PATHS.CHAT)}
              className="flex items-center space-x-3 text-primary-500 font-medium"
            >
              <span className="material-symbols-outlined">chat</span>
              <span>Tin nhắn</span>
            </button>
            <button
              onClick={() => navigate(APP_PATHS.NOTIFICATION)}
              className="flex items-center space-x-3 text-primary-500 font-medium"
            >
              <span className="material-symbols-outlined">lightbulb</span>
              <span>Thông báo</span>
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 p-4 pb-24">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ, ưu đãi..."
            className="w-full bg-white shadow-md px-4 py-3 rounded-full border focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <StatCard
            icon="shopping_bag"
            label="Tổng đơn"
            value={stats.totalOrders}
          />
          <StatCard
            icon="check_circle"
            label="Hoàn thành"
            value={stats.completedOrders}
            color="green"
          />
          <StatCard
            icon="pending"
            label="Đang thực hiện"
            value={stats.ongoingOrders}
            color="yellow"
          />
        </section>

        {/* Banner */}
        <section className="mb-6">
          <div className="relative">
            <img
              src="/images/banner.jpg"
              alt="Banner"
              className="w-full h-40 object-cover rounded-2xl shadow-md"
            />
          </div>
        </section>

        {/* Favorite Tasks */}
        {favoriteTasks.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-dark-900">Dịch vụ yêu thích</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {favoriteTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() =>
                    handleTaskClick(task.task_type, task._id, task.pricing)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Tasks */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-dark-900">Dịch vụ phổ biến</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {popularTasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() =>
                  handleTaskClick(task.task_type, task._id, task.pricing)
                }
              />
            ))}
          </div>
        </section>

        {/* Favorite Taskers */}
        {favoriteTaskers.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-dark-900 mb-2">
              Tasker yêu thích
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {favoriteTaskers.map((tasker) => (
                <TaskerCard
                  key={tasker._id}
                  tasker={tasker}
                  onClick={() => setSelectedTasker(tasker)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="text-center pb-10">
          <p className="text-gray-500 text-sm">Chưa thấy dịch vụ bạn cần?</p>
          <button
            onClick={() => navigate(APP_PATHS.CUSTOMER.SERVICES)}
            className="text-primary-500 font-semibold"
          >
            Xem danh sách toàn bộ dịch vụ →
          </button>
        </div>
      </main>

      <AppFooter />

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
const StatCard = ({ icon, label, value, color = "primary" }) => (
  <div className="bg-white rounded-xl shadow-md p-3 text-center">
    <span className={`material-symbols-outlined text-3xl text-${color}-500`}>
      {icon}
    </span>
    <p className="text-2xl font-bold text-dark-900 mt-1">{value}</p>
    <p className="text-xs text-gray-600">{label}</p>
  </div>
);

const TaskCard = ({ task, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-md p-3 flex flex-col items-center text-center hover:shadow-lg transition"
  >
    <span className="material-symbols-outlined text-primary-500 text-4xl mb-2">
      {task.icon || "handyman"}
    </span>
    <p className="text-sm font-medium text-dark-900">{task.task_name}</p>
    <p className="text-xs text-gray-500 mt-1">
      {Number(task.pricing || 0).toLocaleString()} VND
    </p>
  </button>
);

const TaskerCard = ({ tasker, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3 hover:shadow-lg transition"
  >
    <img
      src={tasker.avatar_url || "/images/default-avatar.png"}
      alt={tasker.full_name}
      className="w-12 h-12 rounded-full object-cover"
    />
    <div className="flex-1 text-left">
      <p className="font-medium text-dark-900">{tasker.full_name}</p>
      <div className="flex items-center gap-1 text-yellow-500 text-sm">
        <span className="material-symbols-outlined text-sm">star</span>
        <span>{tasker.rating || 0}</span>
      </div>
    </div>
  </button>
);

const TaskerModal = ({ tasker, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-dark-900">Thông tin Tasker</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={tasker.avatar_url || "/images/default-avatar.png"}
          alt={tasker.full_name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <p className="font-bold text-lg text-dark-900">{tasker.full_name}</p>
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="material-symbols-outlined">star</span>
            <span className="font-semibold">{tasker.rating || 0}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Kinh nghiệm:</span>{" "}
          {tasker.working_year || 0} năm
        </p>
        <p>
          <span className="font-semibold">Giá/giờ:</span>{" "}
          {Number(tasker.hourly_rate || 0).toLocaleString()} VND
        </p>
        {tasker.bio && (
          <p>
            <span className="font-semibold">Giới thiệu:</span> {tasker.bio}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default CustomerHome;
