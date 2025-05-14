import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MarketInsightsApiExample from './examples/MarketInsightsApiExample';
import SupabaseExample from './examples/SupabaseExample';

const App: React.FC = () => (
  <BrowserRouter>
    <nav style={{ padding: 10 }}>
      <Link to="/api" style={{ marginRight: 10 }}>API Example</Link>
      <Link to="/supabase">Supabase Example</Link>
    </nav>
    <Routes>
      <Route path="/api" element={<MarketInsightsApiExample />} />
      <Route path="/supabase" element={<SupabaseExample />} />
      <Route path="*" element={<div>Select an example from above.</div>} />
    </Routes>
  </BrowserRouter>
);

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error('Root container not found');
}
