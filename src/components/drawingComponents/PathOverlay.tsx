import { useState } from "react";
import type { CanvasPath } from "react-sketch-canvas";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import { CurUserData } from "../../types/constant";
import { UserCanvasPath } from "./SketchCanvas";

interface PathOverlayProps {
  paths: UserCanvasPath[];
  canvasWidth: number;
  canvasHeight: number;
  denormalize: (point: { x: number; y: number }) => { x: number; y: number };
  hideAllPaths?: boolean;
  tooltipStyle?: React.CSSProperties;
  pathClassName?: string | ((path: CanvasPath, index: number, isHovered: boolean) => string);
  onPathClick?: (path: CanvasPath, index: number, event: React.MouseEvent<SVGPathElement>) => void;
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
}: PathOverlayProps) => {
  //states
  const [hoveredIndex, setHoveredIndex] = useState<{
    index: number;
    user: CurUserData;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  //hooks
  const { renderPathTooltip } = useAnnotatorContext();

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
            const isHovered = hoveredIndex?.index === index;

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
                    setHoveredIndex({
                      index: index,
                      user: path.user,
                    });
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
                      setHoveredIndex({
                        index: index,
                        user: path.user,
                      });
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
          {renderPathTooltip
            ? renderPathTooltip(hoveredIndex.index, hoveredIndex.user)
            : `${hoveredIndex.user.userName}`}
        </div>
      )}
    </div>
  );
};

export default PathOverlay;
