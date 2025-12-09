import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const handleLogout = () => {
    dialogRef.current?.showModal();
  };

  const handleConfirmLogout = () => {
    dialogRef.current?.close();
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    dialogRef.current?.close();
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white no-underline hover:text-blue-400 transition-colors">
          SportHall
        </Link>
        <div className="flex gap-8">
          <Link to="/" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/book" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                Book Now
              </Link>
              <Link to="/profile" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                My Bookings
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-4">
                <span className="text-slate-200 text-sm">Welcome, {user?.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded text-sm cursor-pointer hover:bg-slate-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <dialog
        ref={dialogRef}
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-0 text-white max-w-md w-full"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Confirm Logout</h3>
          <p className="text-slate-300 mb-6">Are you sure you want to logout?</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelLogout}
              className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded text-sm cursor-pointer hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm cursor-pointer hover:bg-blue-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </dialog>
    </nav>
  );
};

export default Navbar;

