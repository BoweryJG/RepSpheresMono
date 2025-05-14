import { ComponentType, LazyExoticComponent } from 'react';

export interface RouteConfig {
  path: string;
  element: LazyExoticComponent<ComponentType<any>>;
  exact?: boolean;
  children?: RouteConfig[];
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  category: string;
  averageCost: number;
  popularity: number;
  growthRate: number;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  procedureCount: number;
  marketSize: number;
  growthRate: number;
  imageUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  marketShare: number;
  revenue: number;
  employeeCount: number;
  foundedYear: number;
  headquarters: string;
  website: string;
  logoUrl?: string;
}

export interface MarketGrowth {
  year: number;
  quarter: number;
  marketSize: number;
  growthRate: number;
  region?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishDate: string;
  url: string;
  imageUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}
