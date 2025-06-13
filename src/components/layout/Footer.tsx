
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-primary-400">Tavara Care</h3>
            <p className="text-lg mb-4 text-primary-200 font-medium">
              Compassionately designed. Intelligently supported.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Your trusted platform for coordinated care, caregiver well-being, and connected 
              support across families, professionals, and communities.
            </p>
          </div>

          {/* Explore Tavara */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Explore Tavara</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/dashboard/family" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Family Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/professional" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Professional Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/community" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Community Dashboard
                </Link>
              </li>
              <li>
                <Link to="/support/faq" className="text-gray-300 hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/18687865357" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // This will trigger the TAV assistant panel
                    window.dispatchEvent(new CustomEvent('openTavaraAssistant'));
                  }}
                  className="text-gray-300 hover:text-primary-400 transition-colors text-left"
                >
                  Chat with TAV
                </button>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Connect With Us</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a 
                  href="mailto:TavaraCare@gmail.com" 
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  TavaraCare@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a 
                  href="tel:+18687865357" 
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  +1 (868) 786-5357
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Port of Spain, Trinidad & Tobago
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h5 className="text-md font-semibold mb-4">Follow Us</h5>
              <div className="flex gap-4">
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Tavara Care. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
