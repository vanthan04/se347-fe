import { Link } from "react-router-dom";

const CustomerFooter = () => {
  return (
    <footer className="bg-primary-200 border-t border-primary-300 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tech Stack Section */}
          <div className="flex flex-row md:flex-col justify-between md:justify-center gap-4 md:gap-0 md:space-y-3">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-dark-900/40 uppercase tracking-tighter">
                Frontend
              </h4>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 bg-white/50 text-[10px] font-bold rounded border border-primary-300 text-primary-600">
                  #ReactJS
                </span>
                <span className="px-2 py-0.5 bg-white/50 text-[10px] font-bold rounded border border-primary-300 text-primary-600">
                  #TailwindCSS
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-dark-900/40 uppercase tracking-tighter">
                Backend & Database
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-green-50 text-[10px] font-bold rounded border border-green-200 text-green-600">
                  #NodeJS
                </span>
                <span className="px-2 py-0.5 bg-green-50 text-[10px] font-bold rounded border border-green-200 text-green-600">
                  #MongoDB
                </span>
              </div>
            </div>
          </div>

          {/* Logo and Project Info Section */}
          <div className="md:border-x border-primary-300 px-8 text-center flex flex-col justify-center space-y-2">
            <Link
              to="/customer/home"
              className="flex justify-center items-center space-x-2"
            >
              <img
                src="/images/taskgo-logo.png"
                alt="Logo"
                className="w-6 h-6 opacity-60"
              />
              <span className="text-lg font-black tracking-tighter text-dark-900">
                TaskGo
              </span>
            </Link>
            <p className="text-xs font-bold text-dark-900 uppercase">
              Công nghệ Web và ứng dụng
            </p>
            <p className="text-[11px] font-medium text-primary-600">
              SE347.Q14 - NHÓM 8
            </p>
          </div>

          {/* Instructor and Copyright Section */}
          <div className="flex flex-col justify-between md:items-end text-center md:text-right py-1">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-dark-900/40 uppercase tracking-tighter">
                Giảng viên hướng dẫn
              </h4>
              <p className="text-sm font-bold text-dark-900">
                ThS. Trần Thị Hồng Yến
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                Đại học Công nghệ Thông tin - ĐHQG TP.HCM
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                © 2025 NHÓM 8 • UIT
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
