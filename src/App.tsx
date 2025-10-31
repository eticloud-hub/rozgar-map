import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import DistrictDashboard from './pages/DistrictDashboard';
import ComparisonView from './pages/ComparisonView';
import About from './pages/About';
import './utils/i18n';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/:districtId" element={<DistrictDashboard />} />
            <Route path="/comparison" element={<ComparisonView />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
