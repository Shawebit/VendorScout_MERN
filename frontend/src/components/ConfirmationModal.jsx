import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "danger"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getButtonStyle = (styleType) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      border: '1px solid #000',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500'
    };

    switch (styleType) {
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#000',
          color: '#fff'
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#f0f0f0',
          color: '#000'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#000',
          color: '#fff'
        };
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '90%',
          padding: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {title}
          </h2>
          <p>{message}</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={getButtonStyle('secondary')}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={getButtonStyle(confirmButtonStyle)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;