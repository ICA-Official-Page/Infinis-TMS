// cropImage.js
export const getCroppedImg = (imageSrc, crop) => {
  const canvas = document.createElement("canvas");
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.onload = () => {
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob(blob => {
        const file = new File([blob], "cropped_profile.png", { type: "image/png" });
        resolve(file);
      }, "image/png");
    };
    image.src = URL.createObjectURL(imageSrc);
  });
};
