// CropperModal.js
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
// import { getCroppedImg } from "./cropImage"; 
import { getCroppedImg } from "./getCroppedImg";
import { v4 as uuidv4 } from 'uuid';

export default function CropperModal({ image, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async (e) => {
    e.preventDefault();
    setLoading(true);
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropDone(croppedImage);
    setLoading(false);
  };

  return (
    <div className="cropper-modal">
      <div className="cropper-wrapper" style={{ position: "relative", height: "300px", background: "#333" }}>
        <Cropper
          image={URL.createObjectURL(image)}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div style={{ marginTop: 10 }}>
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
  );
}
