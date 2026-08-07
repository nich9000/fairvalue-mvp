import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DealsLanding from './pages/DealsLanding';
import SearchResults from './pages/SearchResults';
import DealDetail from './pages/DealDetail';
import SavedDeals from './pages/SavedDeals';
import IconTest from './pages/IconTest';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DealsLanding />} />
        <Route path="/deals" element={<DealsLanding />} />
        <Route path="/deals/results" element={<SearchResults />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/saved" element={<SavedDeals />} />
        <Route path="/dev/icons" element={<IconTest />} />
      </Routes>
    </BrowserRouter>
  );
}
