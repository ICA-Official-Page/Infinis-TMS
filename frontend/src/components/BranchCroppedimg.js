export const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(imageSrc);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 👇 Maintain proper scale
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "cropped_profile.png", {
          type: "image/png",
        });
        resolve(file);
      }, "image/png");
    };
    image.onerror = reject;
  });
};
