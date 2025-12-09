import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { courtService } from '../services/bookingService';

const BookCourt = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableCourts = async () => {
      try {
        setLoading(true);
        const availableCourts = await courtService.getAvailableCourts(sport, date, timeSlot);
        setCourts(availableCourts);
        if (availableCourts.length === 0) {
          setError('No courts available for this time slot. Please select another time.');
        }
      } catch (err) {
        setError('Failed to load available courts. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourts();
  }, [sport, date, timeSlot]);

  const handleCourtSelect = (courtId) => {
    navigate(`/book/participants?sport=${sport}&date=${date}&timeSlot=${timeSlot}&courtId=${courtId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-slate-300">Loading available courts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-center mb-2 text-white text-3xl font-bold">Select a Court</h1>
        <p className="text-center text-slate-300 mb-8 text-lg">
          Available courts for {sport === 'badminton' ? 'Badminton' : 'Table Tennis'} on {new Date(date).toLocaleDateString()} at {timeSlot}
        </p>

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-4 rounded-lg mb-8 text-center border border-red-700">
            {error}
          </div>
        )}

        {courts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courts.map((court) => (
              <div
                key={court._id}
                className="bg-slate-800 p-8 rounded-xl text-center cursor-pointer transition-all border-2 border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:-translate-y-1 hover:shadow-lg"
                onClick={() => handleCourtSelect(court._id)}
              >
                <h3 className="mb-2 text-2xl text-white">{court.name}</h3>
                <p className="text-base text-slate-300">{court.sport === 'badminton' ? '🏸' : '🏓'} {court.sport}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-xl mb-8 border border-slate-700">
            <p className="text-lg text-slate-300 mb-6">No courts available for this time slot.</p>
            <button 
              className="px-8 py-3 bg-slate-700 text-white rounded-lg cursor-pointer text-base hover:bg-slate-600 transition-colors" 
              onClick={() => navigate(`/book/time?sport=${sport}&date=${date}`)}
            >
              Select Another Time
            </button>
          </div>
        )}

        <button 
          className="block mx-auto mt-8 px-8 py-3 bg-slate-700 text-white rounded-lg cursor-pointer text-base hover:bg-slate-600 transition-colors" 
          onClick={() => navigate(`/book/time?sport=${sport}&date=${date}`)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default BookCourt;

