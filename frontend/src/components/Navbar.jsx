import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 flex items-center">
        {/* Left: logo */}
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-white no-underline hover:text-blue-400 transition-colors">
            SportHall
          </Link>
        </div>

        {/* Center: primary nav (centered) */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-8 items-center">
            <Link to="/" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/book" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                  Book Now
                </Link>
                <Link to="/bookings" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                  My Bookings
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right: auth actions */}
        <div className="flex-1 flex justify-end">
          <div className="flex gap-8">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-slate-200 no-underline hover:text-blue-400 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="text-slate-200 text-sm px-3 py-2 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-2"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    {user?.name || 'Account'}
                    <svg className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded shadow-lg z-50">
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-slate-200 hover:bg-slate-700">Profile</Link>
                      <Link to="/bookings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-slate-200 hover:bg-slate-700">My Bookings</Link>
                      <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-700">Logout</button>
                    </div>
                  )}
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

