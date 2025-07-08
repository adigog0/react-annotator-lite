import { useState } from "react";
import type { CanvasPath } from "react-sketch-canvas";

interface PathOverlayProps {
  paths: CanvasPath[];
  canvasWidth: number;
  canvasHeight: number;
  denormalize: (point: { x: number; y: number }) => { x: number; y: number };
  hideAllPaths?: boolean;
  tooltipStyle?: React.CSSProperties;
  pathClassName?: string | ((path: CanvasPath, index: number, isHovered: boolean) => string);
  onPathClick?: (path: CanvasPath, index: number, event: React.MouseEvent<SVGPathElement>) => void;
  renderTooltip?: (index: number) => React.ReactNode;
}

const PathOverlay = ({
  paths,
  canvasWidth,
  canvasHeight,
  denormalize,
  hideAllPaths = false,
  tooltipStyle,
  pathClassName,
  onPathClick,
  renderTooltip,
}: PathOverlayProps) => {
  //states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  //methods
  const getPathD = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  function handleDeselectPath() {
    setHoveredIndex(null);
    setTooltipPos(null);
  }

  return (
    <div className="absolute top-0 left-0" style={{ width: canvasWidth, height: canvasHeight }}>
      <svg width={canvasWidth} height={canvasHeight} className="w-full h-full relative" onClick={handleDeselectPath}>
        {!hideAllPaths &&
          paths?.map((path, index) => {
            const denormPoints = path.paths.map(denormalize);
            const d = getPathD(denormPoints);
            const isHovered = hoveredIndex === index;

            const defaultStroke = isHovered ? "red" : path.strokeColor || "black";
            const defaultWidth = path.strokeWidth || 2;

            const dynamicClass =
              typeof pathClassName === "function" ? pathClassName(path, index, isHovered) : pathClassName ?? "";

            return (
              path.drawMode && (
                <path
                  key={index}
                  d={d}
                  className={dynamicClass}
                  stroke={defaultStroke}
                  strokeWidth={defaultWidth}
                  fill="none"
                  style={{ cursor: "pointer", pointerEvents: "stroke" }}
                  onMouseEnter={(e) => {
                    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (box) {
                      setTooltipPos({ x: e.clientX - box.left, y: e.clientY - box.top });
                    }
                    setHoveredIndex(index);
                  }}
                  onMouseMove={(e) => {
                    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (box) {
                      setTooltipPos({ x: e.clientX - box.left, y: e.clientY - box.top });
                    }
                  }}
                  // onMouseLeave={() => {
                  //   setHoveredIndex(null);
                  //   setTooltipPos(null);
                  // }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (box) {
                      setTooltipPos({ x: e.clientX - box.left, y: e.clientY - box.top });
                      setHoveredIndex(index);
                    }
                    onPathClick?.(path, index, e);
                  }}
                />
              )
            );
          })}
      </svg>

      {tooltipPos && hoveredIndex !== null && (
        <div
          className={"absolute bg-black text-white text-xs rounded px-2 py-1 pointer-events-none"}
          style={{
            ...tooltipStyle,
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(5px, 5px)",
          }}
        >
          {renderTooltip ? renderTooltip(hoveredIndex) : `Path #${hoveredIndex + 1}`}
        </div>
      )}
    </div>
  );
};

export default PathOverlay;
