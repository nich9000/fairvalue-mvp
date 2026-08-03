import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Form from './pages/Form';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import DealSearch from './pages/DealSearch';
import DealDetail from './pages/DealDetail';
import SavedDeals from './pages/SavedDeals';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/valuation" element={<Form />} />
        <Route path="/results/:storeId" element={<Results />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deals" element={<DealSearch />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/saved" element={<SavedDeals />} />
      </Routes>
    </BrowserRouter>
  );
}
