import React, { useState } from 'react';
import { User, Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage('');
    
    // Simulate API call
    console.log("Contact form submitted:", formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackMessage('Thank you for your message! We will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' }); // Clear form
    }, 1500);
  };

  return (
            <><SEO title="Contact Us" description="Get in touch with us for any inquiries or support." />

    // The main background is handled by index.css
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          
          {/* --- Contact Info & Map Panel --- */}
          <div className="w-full md:w-2/5 bg-blue-600 text-white p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
            <p className="mb-8 text-blue-100">Fill up the form and our team will get back to you within 24 hours.</p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Phone size={20} />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={20} />
                <span>help@renthub.com</span>
              </div>
              <div className="flex items-start gap-4">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>City Centre, Gwalior, Madhya Pradesh, India</span>
              </div>
            </div>

            <div className="mt-10 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57297.9258169225!2d78.14815418193895!3d26.216335193988544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c5d1792291fb%3A0xff4fb56d65bc3adf!2sGwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1692882181513!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gwalior Map"
                className="dark:filter dark:grayscale-[50%] dark:invert-[90%]" // Style map for dark mode
              ></iframe>
            </div>
          </div>

          {/* --- Form Panel --- */}
          <div className="w-full md:w-3/5 p-8 md:p-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Send a Message</h2>
            
            {feedbackMessage && (
              <div className="p-4 mb-4 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 font-semibold">
                {feedbackMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                <User size={20} className="absolute left-3 bottom-3.5 text-gray-400" />
                <input
                  type="text" id="name" name="name"
                  value={formData.name} onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Email</label>
                <Mail size={20} className="absolute left-3 bottom-3.5 text-gray-400" />
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  id="message" name="message"
                  value={formData.message} onChange={handleChange}
                  rows="5" required
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
   </>
  );
};

export default ContactPage;
