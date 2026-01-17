import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AppHeader = ({ active }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine active page from location if active prop is not provided
  const activePage = active || location.pathname.split('/').pop() || 'home';
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'chat':
        return 'Tin nhắn';
      case 'notification':
        return 'Thông báo';
      case 'activity':
        return 'Hoạt động';
      default:
        return 'Trang chủ';
    }
  };

  const navLinks = [
    { path: '/customer/home', label: 'Trang chủ', key: 'home' },
    { path: '/customer/activity', label: 'Hoạt động', key: 'activity' },
    { path: '/chat', label: 'Tin nhắn', key: 'chat' },
    { path: '/notification', label: 'Thông báo', key: 'notification' },
  ];

  return (
    <header className="bg-primary-200 py-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-4 relative">
        {/* Logo */}
        <div className="text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-70">
          <Link to="/">
            <img src="/images/taskgo-logo.png" alt="Logo" />
          </Link>
        </div>

        {/* Mobile Title */}
        <h1 className="md:hidden font-bold text-xl text-dark-900 absolute left-1/2 -translate-x-1/2">
          {getPageTitle()}
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
          {navLinks.map(({ path, label, key }) => (
            <Link
              key={key}
              to={path}
              className={
                activePage === key
                  ? "text-dark-900 font-bold border-b-2 border-primary-500"
                  : "text-primary-500 hover:text-dark-900"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div
          id="menu-btn"
          className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-primary-500 text-4xl">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden md:block w-10"></div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden bg-primary-100 mt-2 py-4 px-4 space-y-3 shadow-inner">
          {navLinks.map(({ path, label, key }) => (
            <Link
              key={key}
              to={path}
              className={`block py-2 ${
                activePage === key
                  ? "text-dark-900 font-bold"
                  : "text-primary-500"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default AppHeader;
