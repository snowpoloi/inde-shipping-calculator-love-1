
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';

import Navbar from './components/layout/Navbar';
import Index from './pages/Index';
import CarrierManagement from './pages/CarrierManagement';
import PostalCodesManagement from './pages/PostalCodesManagement';
import OffersManagement from './pages/OffersManagement';
import ShippingCalculator from './pages/ShippingCalculator';
import ZonesManagement from './pages/ZonesManagement';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/carriers" element={<CarrierManagement />} />
                <Route path="/postal-codes" element={<PostalCodesManagement />} />
                <Route path="/offers" element={<OffersManagement />} />
                <Route path="/calculator" element={<ShippingCalculator />} />
                <Route path="/zones" element={<ZonesManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </Router>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
