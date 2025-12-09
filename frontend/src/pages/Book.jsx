import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Book = () => {
  const [selectedSport, setSelectedSport] = useState(null);
  const navigate = useNavigate();

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    navigate(`/book/date?sport=${sport}`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center mb-2 text-white text-3xl font-bold">Select a Sport</h1>
        <p className="text-center text-slate-300 mb-12 text-lg">Choose the sport you want to book</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div 
            className="bg-slate-800 p-12 rounded-xl text-center cursor-pointer transition-all border-2 border-slate-700 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 hover:bg-slate-700"
            onClick={() => handleSportSelect('badminton')}
          >
            <div className="text-6xl mb-4">🏸</div>
            <h2 className="text-white mb-2 text-2xl font-semibold">Badminton</h2>
            <p className="text-slate-300">Book a badminton court</p>
          </div>
          
          <div 
            className="bg-slate-800 p-12 rounded-xl text-center cursor-pointer transition-all border-2 border-slate-700 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 hover:bg-slate-700"
            onClick={() => handleSportSelect('table-tennis')}
          >
            <div className="text-6xl mb-4">🏓</div>
            <h2 className="text-white mb-2 text-2xl font-semibold">Table Tennis</h2>
            <p className="text-slate-300">Reserve a table tennis court</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;

