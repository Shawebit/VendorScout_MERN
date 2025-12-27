const Card = ({ children, className = "", title = null, subtitle = null, variant = "default" }) => {
  // Determine the class based on variant
  const cardClass = variant === "dashboard" ? `vendor-dashboard-card ${className}` : `card ${className}`;
  
  return (
    <div className={cardClass}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;