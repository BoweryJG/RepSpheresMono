import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Loader = () => <div>Loading...</div>;

// Lazy-load application entrypoints
const GlobalReps = lazy(() => import('@repspheres/globalrepspheres'));
const MarketInsights = lazy(() => import('@repspheres/market-insights'));
const Workspace = lazy(() => import('@repspheres/workspace'));
const Linguistics = lazy(() => import('@repspheres/linguistics'));
const CRM = lazy(() => import('@repspheres/crm'));

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/global" replace />} />
        <Route path="/global/*" element={<GlobalReps />} />
        <Route path="/insights/*" element={<MarketInsights />} />
        <Route path="/workspace/*" element={<Workspace />} />
        <Route path="/linguistics/*" element={<Linguistics />} />
        <Route path="/crm/*" element={<CRM />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
