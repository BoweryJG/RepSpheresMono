import { lazy } from 'react';
import { RouteConfig } from './types';

const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProcedureDetailsPage = lazy(() => import('./pages/ProcedureDetailsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    exact: true,
  },
  {
    path: '/category/:categoryId',
    element: CategoryPage,
  },
  {
    path: '/procedure/:procedureId',
    element: ProcedureDetailsPage,
  },
  {
    path: '/search',
    element: SearchPage,
  },
  {
    path: '*',
    element: NotFoundPage,
  },
];
