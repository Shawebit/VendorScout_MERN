import { useState, useEffect } from 'react';

const ImageUpload = ({ onImagesChange, maxImages = 5, initialImages = [] }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Initialize with existing images
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      // Set previews for existing images
      const existingPreviews = initialImages.map(img => img.url);
      setPreviews(existingPreviews);
      
      // Create placeholder objects for existing images
      const existingImages = initialImages.map(img => ({
        url: img.url,
        publicId: img.publicId
      }));
      setImages(existingImages);
    }
  }, [initialImages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. You currently have ${images.length} images selected.`);
      return;
    }
    
    // Create previews for the new images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    // Update state
    const updatedImages = [...images, ...files.map(file => ({ file }))];
    setImages(updatedImages);
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Notify parent component with image data
    const imageData = updatedImages.map((imgObj, index) => {
      if (imgObj.file) {
        // New image with file object
        return {
          file: imgObj.file,
          preview: newPreviews[newPreviews.length - files.length + (index - (updatedImages.length - files.length))]
        };
      } else {
        // Existing image
        return {
          url: imgObj.url,
          publicId: imgObj.publicId,
          preview: previews[index]
        };
      }
    });
    
    onImagesChange(imageData);
  };

  const removeImage = (index) => {
    // Clean up the preview URL if it's a newly added image
    if (images[index].file) {
      URL.revokeObjectURL(previews[index]);
    }
    
    // Remove the image and preview
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setPreviews(newPreviews);
    
    // Notify parent component
    const imageData = newImages.map((imgObj, i) => {
      if (imgObj.file) {
        // New image with file object
        return {
          file: imgObj.file,
          preview: newPreviews[i]
        };
      } else {
        // Existing image
        return {
          url: imgObj.url,
          publicId: imgObj.publicId,
          preview: newPreviews[i]
        };
      }
    });
    
    onImagesChange(imageData);
  };

  return (
    <div>
      <div>
        <label>
          <div style={{ border: '2px dashed #ccc', borderRadius: '4px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" style={{ width: '2rem', height: '2rem', margin: '0 auto' }}>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              PNG, JPG, GIF up to 10MB
            </p>
            {images.length >= maxImages && (
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                Maximum {maxImages} images reached
              </p>
            )}
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageChange}
            disabled={images.length >= maxImages}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      {previews.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ position: 'relative', width: '150px', height: '150px' }}>
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
};

export default ImageUpload;