import { useEffect, useState } from "react";

export function useResponsiveCanvasSize(imageUrl: string, maxWidth: number, maxHeight: number) {

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageUrl) return;

    const updateSize = () => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        // Get current viewport size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Limit canvas max width & height (like 70rem = 1120px, 45rem = 720px)
        const limitWidth = Math.min(screenWidth, maxWidth);
        const limitHeight = Math.min(screenHeight, maxHeight);

        // Scale image proportionally to fit within the limits
        let width = limitWidth;
        let height = width / aspectRatio;

        if (height > limitHeight) {
          height = limitHeight;
          width = height * aspectRatio;
        }

        setSize({ width, height });
      };
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [imageUrl, maxWidth, maxHeight]);

  return size;
}
