
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Αρχική', path: '/' },
  { name: 'Μεταφορικές', path: '/carriers' },
  { name: 'Ταχ. Κώδικες', path: '/postal-codes' },
  { name: 'Προσφορές', path: '/offers' },
  { name: 'Ζώνες', path: '/zones' },
  { name: 'Υπολογιστής', path: '/calculator' }
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold py-4">
            <Link to="/">INDE SHIPPING</Link>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-4 hover:bg-gray-800 transition",
                  location.pathname === item.path && "bg-gray-800 font-medium"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
