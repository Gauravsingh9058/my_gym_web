import React, { useState } from 'react';
import { X, Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, Program } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

export function BookingModal({ isOpen, onClose, program }: BookingModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !program) return;

    setLoading(true);
    setError(null);

    try {
      const bookingDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          program_id: program.id,
          booking_date: bookingDateTime.toISOString(),
          status: 'confirmed'
        });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setSelectedDate('');
          setSelectedTime('');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedDate('');
    setSelectedTime('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen || !program) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center border border-gray-700">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
          <p className="text-gray-400 mb-6">
            Your class has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">{program.title}</h4>
            <p className="text-sm text-gray-400">
              {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString()} at {selectedTime}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Book a Class</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {program.duration}
            </span>
            <span>{program.level}</span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {program.trainer?.name}
            </span>
          </div>
          <p className="text-gray-400 mt-2">{program.description}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Select Date</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getNextWeekDates().map((date) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDate === date.toISOString().split('T')[0]
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Select Time</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedTime === time
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}