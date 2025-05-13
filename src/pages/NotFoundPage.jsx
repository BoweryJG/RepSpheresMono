import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleCard } from '../components/ui/SimpleCard';
import { GradientButton } from '../components/ui/GradientButton';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <SimpleCard className="not-found-card">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <GradientButton className="home-button">
            Return to Home
          </GradientButton>
        </Link>
      </SimpleCard>
    </div>
  );
}

export default NotFoundPage;
