import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateTimeSlots, isTimeSlotExpired, formatTimeSlot } from '../utils/dateUtils';

const BookTime = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotExpired(date, timeSlot)) {
      return; // Disabled
    }
    setSelectedTimeSlot(timeSlot);
    navigate(`/book/court?sport=${sport}&date=${date}&timeSlot=${timeSlot}`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center mb-2 text-white text-3xl font-bold">Select a Time Slot</h1>
        <p className="text-center text-slate-300 mb-8 text-lg">
          Each time slot is 2 hours long
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {timeSlots.map((timeSlot) => {
            const isExpired = isTimeSlotExpired(date, timeSlot);
            return (
              <div
                key={timeSlot}
                className={`p-6 bg-slate-800 rounded-lg text-center cursor-pointer transition-all border-2 font-bold text-base ${
                  isExpired
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 border-slate-700'
                    : selectedTimeSlot === timeSlot
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-lg'
                }`}
                onClick={() => !isExpired && handleTimeSelect(timeSlot)}
              >
                {formatTimeSlot(timeSlot)}
              </div>
            );
          })}
        </div>

        <button 
          className="block mx-auto mt-8 px-8 py-3 bg-slate-700 text-white rounded-lg cursor-pointer text-base hover:bg-slate-600 transition-colors" 
          onClick={() => navigate(`/book/date?sport=${sport}`)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default BookTime;

