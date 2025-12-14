// frontend/src/components/Footer.jsx
import React from 'react';
import { Image as ImageIcon, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand / About */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-600 text-white p-2 rounded-md">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">SkinWise</div>
              <div className="text-sm text-slate-600 dark:text-gray-400">Objective, science-backed skincare tools</div>
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-gray-400">
            Instant skin analysis, personalized routines, and evidence-based guides — no fluff, just useful skin care.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-gray-100">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-gray-400">
            <li><Link to="/analyze" className="hover:text-indigo-600 dark:hover:text-indigo-300">Skin Analyzer</Link></li>
            <li><Link to="/quiz" className="hover:text-indigo-600 dark:hover:text-indigo-300">Skin Quiz</Link></li>
            <li><Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-300">Articles</Link></li>
            <li><Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-300">About</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-300">Contact</Link></li>
          </ul>
        </div>

        {/* Resources / Legal */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-gray-100">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-gray-400">
            <li><Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-300">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-300">Privacy Policy</Link></li>
            <li><Link to="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-300">FAQ</Link></li>
            <li><Link to="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-300">Careers</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-gray-100">Get in touch</h4>

          <div className="text-sm text-slate-700 dark:text-gray-400 mb-3">
            <div>Email: <a href="mailto:hello@skinwise.example" className="hover:text-indigo-600 dark:hover:text-indigo-300">hello@skinwise.example</a></div>
            <div className="mt-1">Support: <a href="mailto:support@skinwise.example" className="hover:text-indigo-600 dark:hover:text-indigo-300">support@skinwise.example</a></div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-slate-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="text-slate-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="text-slate-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-slate-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 dark:text-gray-400">
          <div className="mb-2 md:mb-0">© {new Date().getFullYear()} SkinWise. All rights reserved.</div>
          <div>
            <span className="mr-4">Built with ♥ — Not medical advice</span>
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-300">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
