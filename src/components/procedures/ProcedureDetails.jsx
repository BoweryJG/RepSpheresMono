import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SimpleCard } from '../ui/SimpleCard';
import { getProcedureDetails } from '../../services/procedureService';

const ProcedureDetails = () => {
  const { id } = useParams();
  const [procedure, setProcedure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProcedureDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProcedureDetails(id);
        setProcedure(data);
      } catch (err) {
        console.error('Failed to load procedure details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProcedureDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="procedure-details-loading">
        <h2>Loading procedure details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="procedure-details-error">
        <h2>Error Loading Procedure</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="procedure-not-found">
        <h2>Procedure Not Found</h2>
        <p>The procedure you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="procedure-details">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <SimpleCard className="procedure-details-card">
        <header className="procedure-header">
          <h1>{procedure.procedure_name}</h1>
          <div className="procedure-meta">
            <span className="category-badge">{procedure.normalized_category}</span>
            <span className="industry-badge">{procedure.industry}</span>
          </div>
        </header>

        <div className="procedure-content">
          <section className="procedure-description">
            <h2>Description</h2>
            <p>{procedure.description}</p>
          </section>

          {procedure.technical_details && (
            <section className="procedure-technical">
              <h2>Technical Details</h2>
              <p>{procedure.technical_details}</p>
            </section>
          )}

          {procedure.benefits && (
            <section className="procedure-benefits">
              <h2>Benefits</h2>
              <p>{procedure.benefits}</p>
            </section>
          )}

          {procedure.considerations && (
            <section className="procedure-considerations">
              <h2>Considerations</h2>
              <p>{procedure.considerations}</p>
            </section>
          )}
        </div>

        {procedure.related_procedures && procedure.related_procedures.length > 0 && (
          <section className="related-procedures">
            <h2>Related Procedures</h2>
            <div className="related-procedures-list">
              {procedure.related_procedures.map(relatedProc => (
                <Link 
                  key={relatedProc.id} 
                  to={`/procedures/${relatedProc.id}`}
                  className="related-procedure-link"
                >
                  {relatedProc.procedure_name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </SimpleCard>
    </div>
  );
};

export default ProcedureDetails;
