import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-60px)] flex justify-center items-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl mb-4 drop-shadow-lg text-white">Welcome to SportHall</h1>
        <p className="text-xl md:text-2xl mb-12 text-slate-300">Book your favorite sports facilities with ease</p>
        
        {isAuthenticated ? (
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/book" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg no-underline inline-block font-bold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-blue-500"
            >
              Book Now
            </Link>
            <Link 
              to="/bookings" 
              className="px-8 py-4 bg-slate-700 text-white border-2 border-slate-600 rounded-lg no-underline inline-block font-bold text-lg transition-all hover:bg-slate-600 hover:-translate-y-0.5"
            >
              My Bookings
            </Link>
          </div>
        ) : (
          <div className="flex justify-center mb-16">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg no-underline inline-block font-bold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-blue-500 w-full md:w-auto max-w-xs"
            >
              Login to Book
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-slate-800/80 p-8 rounded-xl backdrop-blur-md border border-slate-700 hover:border-blue-500 transition-colors">
            <h3 className="text-3xl mb-4 text-white">🏸 Badminton</h3>
            <p className="text-lg text-slate-300">Book a badminton court for your game</p>
          </div>
          <div className="bg-slate-800/80 p-8 rounded-xl backdrop-blur-md border border-slate-700 hover:border-blue-500 transition-colors">
            <h3 className="text-3xl mb-4 text-white">🏓 Table Tennis</h3>
            <p className="text-lg text-slate-300">Reserve a table tennis court</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

