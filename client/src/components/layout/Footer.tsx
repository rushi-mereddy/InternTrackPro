import { Link } from 'wouter';
import { FOOTER_LINKS } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Internships by Places
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.internshipsPlaces.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.path} 
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/internships" 
                  className="text-gray-400 hover:text-white text-sm font-medium"
                >
                  View all internships
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Internship by Stream
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.internshipsStream.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.path} 
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/internships" 
                  className="text-gray-400 hover:text-white text-sm font-medium"
                >
                  View all internships
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Jobs by Places
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.jobsPlaces.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.path} 
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/jobs" 
                  className="text-gray-400 hover:text-white text-sm font-medium"
                >
                  View all jobs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              About & Services
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.about.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.path} 
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mt-8 mb-4">
              Mobile Apps
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-android text-xl"></i>
                <span className="sr-only">Android app</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-apple text-xl"></i>
                <span className="sr-only">iOS app</span>
              </a>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mt-8 mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram text-xl"></i>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter text-xl"></i>
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube text-xl"></i>
                <span className="sr-only">YouTube</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-linkedin text-xl"></i>
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} InternHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
