import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentMonthDates, formatDate, isWeekend, isPastDate } from '../utils/dateUtils';

const BookDate = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const currentMonthDates = getCurrentMonthDates();
    setDates(currentMonthDates);
  }, []);

  const handleDateSelect = (date) => {
    if (isWeekend(date) || isPastDate(date)) {
      return; // Disabled dates
    }
    const dateStr = formatDate(date);
    navigate(`/book/time?sport=${sport}&date=${dateStr}`);
  };

  const formatDateDisplay = (date) => {
    const d = new Date(date);
    return d.getDate();
  };

  const getDayName = (date) => {
    const d = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  };

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-center mb-2 text-white text-3xl font-bold">Select a Date</h1>
        <p className="text-center text-slate-300 mb-1 text-lg">
          Choose a date for your {sport === 'badminton' ? 'Badminton' : 'Table Tennis'} booking
        </p>
        <p className="text-center text-slate-400 mb-8 text-sm">Only dates in the current month are available. Weekends are not available.</p>

        <div className="grid grid-cols-7 gap-4 mb-8">
          {dates.map((date, index) => {
            const isDisabled = isWeekend(date) || isPastDate(date);
            return (
              <div
                key={index}
                className={`aspect-square flex flex-col justify-center items-center rounded-lg cursor-pointer transition-all border-2 ${
                  isDisabled 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 border-slate-700' 
                    : 'bg-slate-800 border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-105'
                }`}
                onClick={() => !isDisabled && handleDateSelect(date)}
              >
                <div className="text-xs md:text-sm font-bold mb-1">{getDayName(date)}</div>
                <div className="text-lg md:text-xl font-bold">{formatDateDisplay(date)}</div>
              </div>
            );
          })}
        </div>

        <button 
          className="block mx-auto mt-8 px-8 py-3 bg-slate-700 text-white rounded-lg cursor-pointer text-base hover:bg-slate-600 transition-colors" 
          onClick={() => navigate('/book')}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default BookDate;

