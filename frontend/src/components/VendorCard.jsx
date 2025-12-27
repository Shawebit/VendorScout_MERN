import './VendorCard.css';

const VendorCard = ({ vendor, onSelectVendor }) => {
  // Get the first image URL or use a placeholder
  const imageUrl = vendor.images && vendor.images.length > 0 
    ? vendor.images[0].url 
    : null;
  
  return (
    <div className="vendor-card" onClick={() => onSelectVendor(vendor)}>
      <div className="vendor-card-content">
        {/* Vendor image on top */}
        <div className="vendor-card-image-container">
          <img 
            src={imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E`}
            alt={vendor.businessName}
            className="vendor-card-image"
          />
        </div>
        
        {/* Vendor info below */}
        <div className="vendor-card-info">
          <h3 className="vendor-name">{vendor.businessName}</h3>
          <p className="vendor-cuisine">{vendor.cuisineType}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="vendor-pincode">{vendor.pincode}</p>
            <p style={{ margin: 0, color: '#000000', fontSize: '0.875rem', fontWeight: '600' }}>
              {vendor.ratings?.average ? `${vendor.ratings.average.toFixed(1)} ★` : vendor.rating ? `${vendor.rating.toFixed(1)} ★` : 'No ratings'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;