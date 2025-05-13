import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleCard } from '../ui/SimpleCard';

const CategoriesList = ({ categories = [], title, className = '' }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className={`categories-list ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className="categories-grid">
        {categories.map(category => (
          <SimpleCard key={category.name || category} className="category-card">
            <Link 
              to={`/categories/${encodeURIComponent(category.name || category)}`}
              className="category-link"
            >
              <h3 className="category-name">
                {category.name || category}
              </h3>
              {category.count && (
                <span className="category-count">
                  {category.count} procedures
                </span>
              )}
            </Link>
          </SimpleCard>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList;
