// frontend/src/components/FeaturesSection.jsx
// This component now supports dark mode.

import React from 'react';
import { Bot, Bell, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <Bot size={40} className="text-blue-500 dark:text-blue-400" />,
    title: 'AI-Powered Recommendations',
    description: 'Our smart algorithm finds properties tailored to your tastes, so you can find your perfect home faster.',
  },
  {
    icon: <Bell size={40} className="text-green-500 dark:text-green-400" />,
    title: 'Get Instant Alerts',
    description: 'Get real-time notifications about new listings and visit request updates so you never miss an opportunity.',
  },
  {
    icon: <ShieldCheck size={40} className="text-red-500 dark:text-red-400" />,
    title: 'Direct & Secure Communication',
    description: 'Chat directly with property owners and manage visit requests through our secure, integrated platform.',
  },
];

const FeaturesSection = () => {
  return (
    <div className="bg-white dark:bg-gray-800 py-16 sm:py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Finding a home is hard.</h2>
        <h3 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-12">RentHub solves it.</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
