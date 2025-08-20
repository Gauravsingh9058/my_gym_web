import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, Award, Settings, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, Booking, Program } from '../lib/supabase';

interface DashboardProps {
  onClose: () => void;
}

export function Dashboard({ onClose }: DashboardProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    membership_type: profile?.membership_type || 'basic',
  });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name,
        phone: profile.phone || '',
        membership_type: profile.membership_type,
      });
    }
  }, [profile]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile(profileForm);
    if (!error) {
      setEditingProfile(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) {
      fetchBookings();
    }
  };

  const upcomingBookings = bookings.filter(
    booking => new Date(booking.booking_date) > new Date() && booking.status === 'confirmed'
  );

  const pastBookings = bookings.filter(
    booking => new Date(booking.booking_date) <= new Date() || booking.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-center mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 p-6 border-r border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{profile?.full_name}</h3>
                <p className="text-sm text-gray-400 capitalize">{profile?.membership_type} Member</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'bookings' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'
                }`}
              >
                <Calendar className="h-5 w-5" />
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'
                }`}
              >
                <Settings className="h-5 w-5" />
                Profile Settings
              </button>
            </nav>

            <div className="mt-auto pt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'bookings' && 'My Bookings'}
                {activeTab === 'profile' && 'Profile Settings'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700/50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-6 w-6 text-cyan-400" />
                      <h3 className="font-semibold">Upcoming Classes</h3>
                    </div>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-6 w-6 text-orange-400" />
                      <h3 className="font-semibold">Total Sessions</h3>
                    </div>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-6 w-6 text-green-400" />
                      <h3 className="font-semibold">Membership</h3>
                    </div>
                    <p className="text-2xl font-bold capitalize">{profile?.membership_type}</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">{booking.program?.title}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(booking.booking_date).toLocaleDateString()} at{' '}
                              {new Date(booking.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                            Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No upcoming classes. Book a session to get started!</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-700/50 p-6 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-semibold">{booking.program?.title}</h4>
                              <p className="text-gray-400">{booking.program?.description}</p>
                              <p className="text-sm text-cyan-400 mt-2">
                                {new Date(booking.booking_date).toLocaleDateString()} at{' '}
                                {new Date(booking.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                Confirmed
                              </span>
                              <button
                                onClick={() => cancelBooking(booking.id)}
                                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No upcoming bookings.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Past Classes</h3>
                  {pastBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-700/30 p-6 rounded-xl opacity-75">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-semibold">{booking.program?.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              booking.status === 'cancelled' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No past bookings.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-3 opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Membership Type</label>
                    <select
                      value={profileForm.membership_type}
                      onChange={(e) => setProfileForm({ ...profileForm, membership_type: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    {editingProfile ? (
                      <>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="border border-gray-600 px-6 py-3 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}