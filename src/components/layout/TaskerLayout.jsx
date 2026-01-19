import { Outlet } from "react-router-dom";
import TaskerHeader from "./TaskerHeader";
import TaskerFooter from "./TaskerFooter";

const TaskerLayout = () => {
  return (
    <div className="bg-primaryTasker-100 text-dark-900 min-h-screen flex flex-col">
      <TaskerHeader />

      <main className="grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <TaskerFooter />
    </div>
  );
};

export default TaskerLayout;
