export default function LoadingSpinner({ skeleton }) {
  if (skeleton) {
    return (
      <div className="skeleton-page">
        <div className="skeleton-block" style={{ width: '60%', height: '2rem', marginBottom: '1.5rem' }} />
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img" />
              <div className="skeleton-block" style={{ width: '70%' }} />
              <div className="skeleton-block" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  );
}
