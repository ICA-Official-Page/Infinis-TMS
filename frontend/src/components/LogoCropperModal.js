import React, { useRef, useState } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

export default function LogoCropperModal({ image, onClose, onCropDone }) {
  const cropperRef = useRef(null);
  const [src, setSrc] = useState(URL.createObjectURL(image));
  const [loading, setLoading] = useState(false);

  const handleCrop = (e) => {
    e.preventDefault();
    setLoading(true);
    const cropper = cropperRef.current;
    if (cropper) {
      const canvas = cropper.getCanvas();
      canvas.toBlob((blob) => {
        const file = new File([blob], 'cropped_logo.png', { type: 'image/png' });
        onCropDone(file);
      }, 'image/png');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          border: '2px solid #ccc',
          borderRadius: '12px',
          padding: '16px',
          background: '#fff',
          width: '100%',
          maxWidth: '550px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Cropper box (black background) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px",
            height: "350px",
            margin: "0 auto",
            backgroundColor: "#000",
            border: "1px solid black",
          }}
        >
          <Cropper
            ref={cropperRef}
            src={src}
            className="cropper"
            style={{ height: "100%", width: '100%' }}
            stencilProps={{
              movable: true,
              resizable: true,
              lines: true,
            }}
            stencilSize={{
              width: 300,
              height: 150,
            }}
            imageRestriction="none"
          />
        </div>

        {/* ✅ Buttons now inside white box */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          marginTop: 15,
        }}>
          {
            loading ? <button>
              <img src="/img/loader.png" className='Loader' alt="loader" />
            </button>
              :
              <button onClick={handleCrop}>Crop</button>
          }
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
