import { type CanvasPath } from "react-sketch-canvas";

export const normalizePaths = (paths: CanvasPath[], width: number, height: number): CanvasPath[] => {
  return paths.map((path) => ({
    ...path,
    paths: path.paths.map((p) => ({
      x: p.x / width,
      y: p.y / height,
    })),
  }));
};

export const denormalizePaths = (paths: CanvasPath[], width: number, height: number): CanvasPath[] => {
  return paths.map((path) => ({
    ...path,
    paths: path.paths.map((p) => ({
      x: p.x * width,
      y: p.y * height,
    })),
  }));
};

export function getResponsiveDefaults() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return {
    maxWidth: isMobile ? 700 : 1120,
    maxHeight: isMobile ? 650 : 720,
  };
}

export function isPathIntersecting(pathA: CanvasPath, pathB: CanvasPath): boolean {
  const threshold = (pathA.strokeWidth + pathB.strokeWidth) / 2 + 5; // adjust buffer as needed

  for (const pointA of pathA.paths) {
    for (const pointB of pathB.paths) {
      const dx = pointA.x - pointB.x;
      const dy = pointA.y - pointB.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= threshold) {
        return true;
      }
    }
  }

  return false;
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance;
}
