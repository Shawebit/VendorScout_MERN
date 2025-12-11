import './VendorCard.css';

const VendorCard = ({ vendor, onSelectVendor }) => {
  return (
    <div className="vendor-card">
      <div className="vendor-card-content">
        <h3 className="vendor-name">{vendor.businessName}</h3>
        <p className="vendor-cuisine">{vendor.cuisineType}</p>
        <p className="vendor-pincode">{vendor.pincode}</p>
        <button 
          onClick={() => onSelectVendor(vendor)}
          className="btn btn-primary vendor-view-btn"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default VendorCard;