import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatTimeSlot, formatDateDisplay } from '../utils/dateUtils';

const BookParticipants = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const courtId = searchParams.get('courtId');
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([{ name: '', email: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    if (participants.length < 6) {
      setParticipants([...participants, { name: '', email: '' }]);
    }
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const updated = participants.filter((_, i) => i !== index);
      setParticipants(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const validParticipants = participants.filter(p => p.name.trim() && p.email.trim());
    if (validParticipants.length === 0) {
      setError('Please add at least one participant');
      return;
    }

    if (validParticipants.length > 6) {
      setError('Maximum 6 participants allowed');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const participant of validParticipants) {
      if (!emailRegex.test(participant.email)) {
        setError(`Invalid email address: ${participant.email}`);
        return;
      }
    }

    try {
      setLoading(true);
      await bookingService.createBooking({
        sport,
        courtId,
        date,
        timeSlot,
        participants: validParticipants,
      });
      navigate('/profile?bookingSuccess=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center mb-2 text-white text-3xl font-bold">Participant Information</h1>
        <p className="text-center text-slate-300 mb-8 text-lg">
          Add up to 6 participants for your booking
        </p>

        <div className="bg-slate-800 p-6 rounded-lg mb-8 border-l-4 border-blue-500 border border-slate-700">
          <h3 className="mb-4 text-blue-400 text-xl font-semibold">Booking Summary</h3>
          <p className="my-2 text-slate-300"><strong className="text-white">Sport:</strong> {sport === 'badminton' ? 'Badminton' : 'Table Tennis'}</p>
          <p className="my-2 text-slate-300"><strong className="text-white">Date:</strong> {formatDateDisplay(date)}</p>
          <p className="my-2 text-slate-300"><strong className="text-white">Time:</strong> {formatTimeSlot(timeSlot)}</p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-4 rounded-lg mb-8 text-center border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
          {participants.map((participant, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-slate-700 last:border-b-0">
              <div className="font-bold text-blue-400 mb-2">Participant {index + 1}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <input
                  type="text"
                  placeholder="Name"
                  value={participant.name}
                  onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                  required={index === 0}
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={participant.email}
                  onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                  required={index === 0}
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {participants.length > 1 && (
                  <button
                    type="button"
                    className="px-4 py-3 bg-red-600 text-white rounded cursor-pointer text-sm hover:bg-red-500 transition-colors"
                    onClick={() => removeParticipant(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {participants.length < 6 && (
            <button
              type="button"
              className="w-full px-3 py-3 bg-green-600 text-white rounded-lg cursor-pointer text-base mb-8 hover:bg-green-500 transition-colors"
              onClick={addParticipant}
            >
              + Add Participant
            </button>
          )}

          <div className="flex flex-col md:flex-row gap-4 justify-between mt-8">
            <button
              type="button"
              className="flex-1 px-8 py-3 bg-slate-700 text-white rounded-lg cursor-pointer text-base hover:bg-slate-600 transition-colors"
              onClick={() => navigate(`/book/court?sport=${sport}&date=${date}&timeSlot=${timeSlot}`)}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg cursor-pointer text-base hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookParticipants;

