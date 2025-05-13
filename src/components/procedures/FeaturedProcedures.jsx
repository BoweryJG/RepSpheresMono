import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleCard } from '../ui/SimpleCard';

const FeaturedProcedures = ({ procedures = [], title, className = '' }) => {
  if (!procedures || procedures.length === 0) {
    return null;
  }

  return (
    <div className={`featured-procedures ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className="procedure-grid">
        {procedures.map(procedure => (
          <SimpleCard key={procedure.id} className="procedure-card">
            <div className="procedure-content">
              <h3 className="procedure-title">{procedure.procedure_name}</h3>
              
              <div className="procedure-meta">
                <span className="category-badge">{procedure.normalized_category}</span>
                <span className="industry-badge">{procedure.industry}</span>
              </div>
              
              <p className="procedure-description">
                {procedure.description && procedure.description.substring(0, 100)}
                {procedure.description && procedure.description.length > 100 ? '...' : ''}
              </p>
              
              <Link 
                to={`/procedures/${procedure.id}`} 
                className="procedure-link"
              >
                View Details
              </Link>
            </div>
          </SimpleCard>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProcedures;
