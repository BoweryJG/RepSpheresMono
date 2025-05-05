# Market Insights

This repository contains tools and resources for market analysis and insights.

## Features

- Dashboard for dental and aesthetic industry insights
- Company profiles and market data
- Industry news and trends
- Market analysis tools
- Mobile-responsive design
- Dark mode support

## Data Population

The application uses Supabase as its database. To populate the database with initial data:

### Option 1: Using npm script

```bash
npm run load-data
```

This script will:
1. Fetch company data for dental and aesthetic industries using Brave search
2. Fetch news articles for both industries
3. Generate trending topics based on the news content
4. Create upcoming industry events
5. Store all data in Supabase for future use

### Option 2: Using shell script

```bash
chmod +x src/services/supabase/load-data.sh
./src/services/supabase/load-data.sh
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Overview

Market Insights is a project aimed at collecting, analyzing, and visualizing market data to provide actionable insights for decision-making.

## Getting Started

More information about how to use this repository will be added as the project develops.

## License

This project is licensed under the terms of the MIT license.
