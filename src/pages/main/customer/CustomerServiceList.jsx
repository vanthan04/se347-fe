/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "@/lib/services/customerService";
import { cn } from "@/lib/utils/cn";
import { APP_PATHS } from "@/lib/contants";

const CustomerServiceList = () => {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const TASK_DETAIL_MAP = {
    cleaning_washing_machine:
      APP_PATHS.CUSTOMER.DETAILS.CLEANING_WASHING_MACHINE,
    cleaning_house: APP_PATHS.CUSTOMER.DETAILS.CLEANING_HOUSE,
    cleaning_air_conditioner:
      APP_PATHS.CUSTOMER.DETAILS.CLEANING_AIR_CONDITIONER,
    caring_elderly: APP_PATHS.CUSTOMER.DETAILS.TAKE_CARE_OF_ELDER,
    caring_thesick: APP_PATHS.CUSTOMER.DETAILS.TAKE_CARE_OF_SICK_PEOPLE,
    caring_children: APP_PATHS.CUSTOMER.DETAILS.BABYSITTING,
    shopping: APP_PATHS.CUSTOMER.DETAILS.MARKET,
    cooking: APP_PATHS.CUSTOMER.DETAILS.COOKING,
    checking_equipments: APP_PATHS.CUSTOMER.DETAILS.CLEANING_AIR_CONDITIONER,
  };

  useEffect(() => {
    loadCategories();
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [selectedCategory, searchTerm, tasks]);

  const loadCategories = async () => {
    try {
      const data = await taskService.getAllServices({ status: "active" });
      if (data.success) {
        setCategories(data.services || []);
      }
      console.log("Loaded categories:", data.services);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getAllTasks({ status: "active" });
      if (data.success) {
        setTasks(data.tasks || []);
      }
      console.log("Loaded tasks:", data.tasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (task) => task.service_id === selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.task_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredTasks(filtered);
  };

  const handleTaskClick = (taskType, taskId) => {
    const detailPage = TASK_DETAIL_MAP[taskType];
    console.log("detailPage", detailPage);
    if (detailPage) {
      navigate(`${detailPage}/${taskId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="sticky top-18 bg-primary-100 p-4 shadow-sm z-10">
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white shadow-md px-4 py-3 rounded-full border focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Category Filter */}
      <div className="sticky top-36 bg-primary-100 p-4 pt-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-full font-semibold whitespace-nowrap transition",
              selectedCategory === "all"
                ? "bg-primary-500 text-white shadow-md"
                : "bg-white text-gray-600",
            )}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={cn(
                "cursor-pointer px-4 py-2 rounded-full font-semibold whitespace-nowrap transition",
                selectedCategory === category._id
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white text-gray-600",
              )}
            >
              {category.category_name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-primary-500 animate-spin">
              progress_activity
            </span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">
              search_off
            </span>
            <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTasks.map((task) => (
              <ServiceCard
                key={task._id}
                task={task}
                onClick={() => handleTaskClick(task.task_type, task._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Components
const ServiceCard = ({ task, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg hover:scale-105 transition-transform"
  >
    {/* Icon or Image */}
    {task.avatar_url ? (
      <img
        src={task.avatar_url}
        alt={task.category_name}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
    ) : (
      <div className="w-full h-32 bg-primary-50 rounded-lg mb-3 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-500 text-5xl">
          {task.icon || "handyman"}
        </span>
      </div>
    )}

    {/* Name */}
    <h3 className="font-semibold text-dark-900 mb-1 line-clamp-2">
      {task.task_name}
    </h3>

    {/* Description */}
    {task.description && (
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
        {task.description}
      </p>
    )}

    {/* Price */}
    <div className="mt-auto">
      <p className="text-primary-500 font-bold">
        {Number(task.pricing || 0).toLocaleString()} VND
      </p>
      <p className="text-xs text-gray-500">Giá khởi điểm</p>
    </div>

    {/* Badge */}
    {task.is_popular && (
      <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
        Phổ biến
      </div>
    )}
  </button>
);

export default CustomerServiceList;
