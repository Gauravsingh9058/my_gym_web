import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Dumbbell, 
  Users, 
  Award, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  User,
  LogIn
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase, Program, Trainer } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { BookingModal } from './components/BookingModal';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState('all');
  const [scrollY, setScrollY] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchPrograms();
    fetchTrainers();
  }, []);

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        trainer:trainers(*)
      `)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPrograms(data);
    }
  };

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setTrainers(data);
    }
  };

  const filteredPrograms = activeProgram === 'all' 
    ? programs 
    : programs.filter(program => program.category === activeProgram);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleBookProgram = (program: Program) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    setSelectedProgram(program);
    setBookingModalOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        });

      if (!error) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setContactLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>;
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                FitCore
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="hover:text-cyan-400 transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-cyan-400 transition-colors">About</button>
              <button onClick={() => scrollToSection('programs')} className="hover:text-cyan-400 transition-colors">Programs</button>
              <button onClick={() => scrollToSection('trainers')} className="hover:text-cyan-400 transition-colors">Trainers</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-cyan-400 transition-colors">Pricing</button>
              {user ? (
                <button 
                  onClick={() => setDashboardOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 bg-gray-800/95 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col space-y-4 px-4">
                <button onClick={() => scrollToSection('home')} className="text-left hover:text-cyan-400 transition-colors">Home</button>
                <button onClick={() => scrollToSection('about')} className="text-left hover:text-cyan-400 transition-colors">About</button>
                <button onClick={() => scrollToSection('programs')} className="text-left hover:text-cyan-400 transition-colors">Programs</button>
                <button onClick={() => scrollToSection('trainers')} className="text-left hover:text-cyan-400 transition-colors">Trainers</button>
                <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-cyan-400 transition-colors">Pricing</button>
                {user ? (
                  <button 
                    onClick={() => setDashboardOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-2 rounded-full text-center"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-2 rounded-full text-center"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=1600')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/50"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                Body & Mind
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join FitCore and unlock your potential with world-class trainers, 
              cutting-edge equipment, and personalized workout programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection('programs')}
                className="bg-gradient-to-r from-cyan-500 to-orange-500 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-gray-600 px-8 py-4 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose FitCore?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're more than just a gym. We're a community dedicated to helping you achieve your fitness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-600/20 hover:bg-gray-700/70 transition-all group">
              <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full w-fit mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Trainers</h3>
              <p className="text-gray-400">
                Our certified trainers bring years of experience and personalized attention to every session.
              </p>
            </div>

            <div className="bg-gray-700/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-600/20 hover:bg-gray-700/70 transition-all group">
              <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full w-fit mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Equipment</h3>
              <p className="text-gray-400">
                State-of-the-art machines and equipment to support all your fitness goals and preferences.
              </p>
            </div>

            <div className="bg-gray-700/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-600/20 hover:bg-gray-700/70 transition-all group">
              <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full w-fit mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Supportive Community</h3>
              <p className="text-gray-400">
                Join a motivated community that celebrates every victory and supports you through challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Programs</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Discover the perfect workout program tailored to your fitness level and goals.
            </p>
            
            {/* Program Filter */}
            <div className="flex flex-wrap justify-center gap-4">
              {['all', 'strength', 'cardio', 'yoga'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveProgram(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    activeProgram === category
                      ? 'bg-gradient-to-r from-cyan-500 to-orange-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="bg-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 transition-all group">
                <div className="relative overflow-hidden">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </span>
                      <span>{program.level}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                  <p className="text-gray-400 mb-4">{program.description}</p>
                  <button 
                    onClick={() => handleBookProgram(program)}
                    className="bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-3 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    {user ? 'Book Now' : 'Sign In to Book'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section id="trainers" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Trainers</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our expert team is here to guide, motivate, and help you reach your fitness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <div key={index} className="bg-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-600/20 hover:border-cyan-500/50 transition-all group">
                <div className="relative overflow-hidden">
                  <img 
                    src={trainer.image_url || 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                    alt={trainer.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{trainer.name}</h3>
                  <p className="text-cyan-400 font-semibold mb-1">{trainer.specialty}</p>
                  <p className="text-gray-400">{trainer.experience}</p>
                  <div className="flex items-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(trainer.rating) ? 'text-orange-400 fill-current' : 'text-gray-600'}`} />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">({trainer.rating})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Flexible membership options designed to fit your lifestyle and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Access to gym equipment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Locker room access
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Basic fitness assessment
                </li>
              </ul>
              <button className="w-full border border-gray-600 py-3 rounded-full hover:bg-gray-700 transition-all">
                {user ? 'Current Plan' : 'Get Started'}
              </button>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-gradient-to-b from-cyan-500/10 to-orange-500/10 p-8 rounded-2xl border-2 border-cyan-500/50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-orange-500 px-6 py-2 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$59</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Everything in Basic
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Group fitness classes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Personal training (2 sessions)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Nutrition consultation
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 py-3 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                {user ? 'Upgrade Plan' : 'Get Started'}
              </button>
            </div>

            {/* Elite Plan */}
            <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30">
              <h3 className="text-2xl font-bold mb-4">Elite</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Unlimited personal training
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  VIP amenities access
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Priority booking
                </li>
              </ul>
              <button className="w-full border border-gray-600 py-3 rounded-full hover:bg-gray-700 transition-all">
                {user ? 'Upgrade Plan' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ready to start your fitness journey? Contact us today or visit our location.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Location</h4>
                    <p className="text-gray-400">123 Fitness Street, Gym City, GC 12345</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Phone</h4>
                    <p className="text-gray-400">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Email</h4>
                    <p className="text-gray-400">info@fitcore.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-orange-500 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Hours</h4>
                    <p className="text-gray-400">Mon-Fri: 5AM-11PM<br />Sat-Sun: 7AM-9PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-600/20">
              {contactSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">Thank you! Your message has been sent successfully.</p>
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Your Email"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Your Message"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 py-3 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Dumbbell className="h-6 w-6 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                FitCore
              </span>
            </div>
            <p className="text-gray-400">© 2025 FitCore. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode}
      />
      
      {dashboardOpen && (
        <Dashboard onClose={() => setDashboardOpen(false)} />
      )}
      
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        program={selectedProgram}
      />
    </div>
  );
}

export default App;