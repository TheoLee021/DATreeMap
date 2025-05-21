import { Outlet, NavLink } from 'react-router-dom';
import { Suspense } from 'react';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4 px-8 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">De Anza Campus Tree Map</div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `transition hover:text-gray-200 ${isActive ? 'font-bold' : ''}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `transition hover:text-gray-200 ${isActive ? 'font-bold' : ''}`
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <a 
                  href="/admin/" 
                  className="transition hover:text-gray-200"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Admin
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Suspense fallback={<div className="flex justify-center items-center h-[calc(100vh-130px)]">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="bg-gray-800 text-white py-4 px-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="font-bold">Environmental Monitoring Society</div>
          <div className="text-sm">&copy; 2025 All Rights Reserved</div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 