import { memo, useEffect, useRef, useState } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef, type CanvasPath, type Point } from "react-sketch-canvas";
import { cn } from "../../lib/tailwind";
import RedoIcon from "../../assets/icons/redo.svg?react";
import UndoIcon from "../../assets/icons/undo.svg?react";
import DoneIcon from "../../assets/icons/done.svg?react";
import Stroke1 from "../../assets/icons/stroke1.svg?react";
import Stroke2 from "../../assets/icons/stroke2.svg?react";
import Stroke3 from "../../assets/icons/stroke3.svg?react";
import Stroke4 from "../../assets/icons/stroke4.svg?react";
import EraseIcon from "../../assets/icons/Eraser.svg?react";
import { useDebounceFn } from "../../hooks/useDebounce";
import ColorPickerButton from "./ColorPickerButton";

export type SketchActions = "Redo" | "Undo" | "Cancel" | "Done";
export type SketchOptions = "Erase" | "Pen" | "pick color";

interface SketchCanvasProps {
  image_url: string;
  canvasPath?: CanvasPath[] | null;
  handleUpdatePath: (path: CanvasPath[]) => void;
  handleSetMainAction: () => void;
  drawingOptions?: {
    strokeColor?: string;
    strokeWidth?: number;
  };
  inDrawMode: boolean;
  sketchCanvasStyle?: React.CSSProperties;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  toolbarOptions?: {
    topToolbarIcons?: Partial<Record<SketchActions, React.ReactNode>>;
    strokeIcons?: {
      colorPickerIcon?: React.ReactNode;
      eraserIcon?: React.ReactNode;
      strokeWidthIcons?: Record<number, React.ReactNode>;
    };
    topToolbarStyle?: React.CSSProperties;
    bottomToolbarStyle?: React.CSSProperties;
  };
}

const SketchCanvas = ({
  image_url,
  handleUpdatePath,
  handleSetMainAction,
  canvasPath,
  drawingOptions,
  inDrawMode,
  sketchCanvasStyle,
  onDrawStart,
  onDrawEnd,
  toolbarOptions,
}: SketchCanvasProps) => {
  //states
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(drawingOptions?.strokeWidth ?? 5);
  const [strokeColor, setStrokeColor] = useState(drawingOptions?.strokeColor ?? "#000000");
  const [sketchOptions, setSketchOptions] = useState<SketchOptions | null>("Pen");
  const [isStrokeMenuOpen, setIsStrokeMenuOpen] = useState(false);

  //hooks
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const strokeMenuRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<SVGSVGElement | null>(null);
  const debouncedUpdatePath = useDebounceFn((paths: CanvasPath[]) => {
    handleUpdatePath(paths);
  }, 1000);

  //consts
  const defaultStrokeIcons: Record<number, React.ReactNode> = {
    2: <Stroke1 className="size-6 cursor-pointer fill-gray-500" />,
    5: <Stroke2 className="size-6 cursor-pointer fill-gray-500" />,
    10: <Stroke3 className="size-6 cursor-pointer fill-gray-500" />,
    15: <Stroke4 className="size-6 cursor-pointer fill-gray-500" />,
  };

  const sketchActions: { label: SketchActions; icon: React.ReactNode }[] = [
    // { label: "Cancel", icon: toolbarOptions?.topToolbarIcons?.Cancel ?? <CancelIcon fill="white" /> },
    { label: "Redo", icon: toolbarOptions?.topToolbarIcons?.Redo ?? <RedoIcon fill="white" /> },
    { label: "Undo", icon: toolbarOptions?.topToolbarIcons?.Undo ?? <UndoIcon fill="white" /> },
    { label: "Done", icon: toolbarOptions?.topToolbarIcons?.Done ?? <DoneIcon fill="white" /> },
  ];

  //methods
  function getStrokeLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  /**
   * Bounding box intersection check
   * Checks if two paths intersect — but it does so approximately, by comparing their bounding rectangles instead of   their actual curves. (a quick heuristic)
   * @param path1 - Array of points
   * @param path2 - Array of points
   * @returns boolean
   */
  function isPathIntersecting(path1: Point[], path2: Point[]): boolean {
    let xMin1 = Infinity,
      xMax1 = -Infinity,
      yMin1 = Infinity,
      yMax1 = -Infinity;
    for (const { x, y } of path1) {
      if (x < xMin1) xMin1 = x;
      if (x > xMax1) xMax1 = x;
      if (y < yMin1) yMin1 = y;
      if (y > yMax1) yMax1 = y;
    }

    let xMin2 = Infinity,
      xMax2 = -Infinity,
      yMin2 = Infinity,
      yMax2 = -Infinity;
    for (const { x, y } of path2) {
      if (x < xMin2) xMin2 = x;
      if (x > xMax2) xMax2 = x;
      if (y < yMin2) yMin2 = y;
      if (y > yMax2) yMax2 = y;
    }

    return xMin1 < xMax2 && xMax1 > xMin2 && yMin1 < yMax2 && yMax1 > yMin2;
  }

  function handleDrawOptions(type: SketchOptions, value?: number | string) {
    switch (type) {
      case "Erase":
        setSketchOptions("Erase");
        canvasRef.current?.eraseMode(true);
        break;
      case "Pen":
        setSketchOptions("Pen");
        canvasRef.current?.eraseMode(false);
        console.log("w value", value);
        if (typeof value === "number") {
          setStrokeWidth(value);
        }
        setIsStrokeMenuOpen(false);
        break;
      case "pick color":
        setStrokeColor(value as string);
        break;
    }
  }

  function handleSelectedAction(action: SketchActions) {
    switch (action) {
      case "Done":
        exportPaths();
        if (sketchOptions === "Erase") {
          setSketchOptions("Pen");
          canvasRef.current?.eraseMode(false);
        }
        break;
      case "Cancel":
        handleSetMainAction();
        break;
      case "Undo":
        canvasRef.current?.undo();
        break;
      case "Redo":
        canvasRef.current?.redo();
        break;
    }
  }

  const exportPaths = async () => {
    if (canvasRef.current) {
      const paths = await canvasRef.current.exportPaths();
      handleUpdatePath(paths);
    }
    setTimeout(() => {
      handleSetMainAction(); // to avoid React update during render
    }, 0);
  };

  // If the stroke is long enough, it checks for path intersections and deletes intersected paths.
  const handleStrokeEnd = (() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return async (newStroke: Point[]) => {
      if (!canvasPath || !newStroke?.length) return;

      const length = getStrokeLength(newStroke);
      if (length < 10) return;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const updatedPaths = canvasPath.filter((existingPath) => !isPathIntersecting(existingPath.paths, newStroke));

        if (updatedPaths.length !== canvasPath.length) {
          handleUpdatePath(updatedPaths);
          if (canvasRef.current) {
            await canvasRef.current.clearCanvas();
            await canvasRef.current.loadPaths(updatedPaths);
          }
        }
      }, 500);
    };
  })();

  //Called on a pointer click. It checks if the click is near any path and deletes those.
  const handlePathPointerUp = (e: PointerEvent) => {
    if (sketchOptions !== "Erase" || !canvasPath?.length) return;

    const svg = document.getElementById("current_image") as SVGSVGElement | null;
    if (!svg) return;

    const point = {
      x: e.clientX - svg.getBoundingClientRect().left,
      y: e.clientY - svg.getBoundingClientRect().top,
    };

    const updatedPaths = canvasPath.filter((p) => !isPathIntersecting(p.paths, [point, point]));

    if (updatedPaths.length !== canvasPath.length) {
      handleUpdatePath(updatedPaths);
      canvasRef.current?.clearCanvas();
      canvasRef.current?.loadPaths(updatedPaths);
    }
  };

  useEffect(() => {
    const svg = document.getElementById("current_image") as SVGSVGElement | null;
    if (!svg) return;

    const handleStartDraw = () => {
      setIsDrawing(true);
      onDrawStart?.();
    };

    const handleEndDraw = async () => {
      console.log("draing end");
      setIsDrawing(false);
      if (canvasRef.current && sketchOptions !== "Erase") {
        const paths = await canvasRef.current.exportPaths();
        debouncedUpdatePath(paths);
      }
      onDrawEnd?.();
    };

    const addListeners = () => {
      svg.addEventListener("pointerdown", handleStartDraw);
      svg.addEventListener("pointerup", handleEndDraw);
      svg.querySelectorAll("path").forEach((path) => path.addEventListener("pointerup", handlePathPointerUp));
    };

    const removeListeners = () => {
      svg.removeEventListener("pointerdown", handleStartDraw);
      svg.removeEventListener("pointerup", handleEndDraw);
      const paths = svg.querySelectorAll("path");
      paths.forEach((path) => {
        path.removeEventListener("pointerup", handlePathPointerUp); // ensure no duplicates
        path.addEventListener("pointerup", handlePathPointerUp);
      });
    };

    addListeners();
    const observer = new MutationObserver(() => {
      removeListeners();
      addListeners();
    });

    observer.observe(svg, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      removeListeners();
    };
  }, [canvasPath, sketchOptions]);

  useEffect(() => {
    if (canvasPath && canvasPath.length && canvasRef.current && inDrawMode) {
      canvasRef.current.loadPaths(canvasPath);
    } else {
      canvasRef.current?.clearCanvas();
    }
  }, [canvasPath, inDrawMode]);

  useEffect(() => {
    const canvas = document.getElementById("current_image");
    if (!canvas || sketchOptions !== "Erase") return;

    let frame: number | null = null;

    const throttledMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (pointerRef.current) {
          pointerRef.current.style.left = `${e.clientX}px`;
          pointerRef.current.style.top = `${e.clientY}px`;
        }
      });
    };

    canvas.addEventListener("pointermove", throttledMove);

    return () => {
      canvas.removeEventListener("pointermove", throttledMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sketchOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (strokeMenuRef.current && !strokeMenuRef.current.contains(event.target as Node)) {
        setIsStrokeMenuOpen(false);
      }
    }

    if (isStrokeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStrokeMenuOpen]);

  return (
    <>
      <ReactSketchCanvas
        id="current_image"
        className={cn("rounded-md", sketchOptions === "Erase" && "cursor-none")}
        style={{
          ...sketchCanvasStyle,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        width="100%"
        height="100%"
        allowOnlyPointerType={inDrawMode ? "all" : "Pen"}
        preserveBackgroundImageAspectRatio="xMidyMid"
        ref={canvasRef}
        backgroundImage={image_url}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        onStroke={async (path, isEraser) => {
          if (isEraser) {
            console.log("erase path", isEraser);
            handleStrokeEnd(path.paths);
          }
        }}
      />

      {inDrawMode && !isDrawing && (
        <div
          className={cn(
            "fixed md:absolute top-3 md:-top-25 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 backdrop-blur-md shadow-md rounded-xl",
            toolbarOptions?.bottomToolbarStyle
          )}
        >
          {/* Color Picker */}
          <ColorPickerButton onChange={(val) => handleDrawOptions("pick color", val)} strokeColor={strokeColor} />

          {/* Eraser */}
          <button
            onClick={() => handleDrawOptions("Erase")}
            className={cn(
              "p-1 rounded-xl border border-transparent hover:border-gray-400",
              sketchOptions === "Erase" ? "bg-blue-300" : "bg-gray-700"
            )}
          >
            {toolbarOptions?.strokeIcons?.eraserIcon ?? (
              <EraseIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />
            )}
          </button>

          {/* Stroke Width Dropdown */}
          <div className="relative group" ref={strokeMenuRef}>
            <button
              className={cn(
                "p-1 rounded-xl bg-gray-700 hover:border-gray-400 cursor-pointer",
                sketchOptions === "Pen" ? "bg-blue-300" : "bg-gray-700"
              )}
              onClick={() => setIsStrokeMenuOpen((prev) => !prev)}
            >
              ✏️
            </button>
            {isStrokeMenuOpen && (
              <div className="absolute top-full bg-gray-100 mt-1 left-1/2 -translate-x-1/2 border rounded-md shadow-md p-1 z-50 cursor-pointer">
                {Object.entries(toolbarOptions?.strokeIcons?.strokeWidthIcons ?? defaultStrokeIcons).map(
                  ([w, icon]) => (
                    <button
                      key={w}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDrawOptions("Pen", Number(w));
                      }}
                      className={cn(
                        "p-1 block w-full text-left rounded cursor-pointer hover:bg-blue-200",
                        sketchOptions === "Pen" && strokeWidth === Number(w) ? "bg-blue-200" : ""
                      )}
                    >
                      {icon}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Other Drawing Actions */}
          {sketchActions.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => handleSelectedAction(label)}
              className="p-1 rounded-xl bg-gray-700 border border-transparent hover:border-gray-400 cursor-pointer"
            >
              {icon}
            </button>
          ))}
        </div>
      )}

      {sketchOptions === "Erase" && (
        <EraseIcon
          ref={pointerRef}
          className="fixed z-50 pointer-events-none drop-shadow-xl text-white"
          style={{
            width: "20px",
            height: "20px",
            left: 0,
            top: 0,
            position: "fixed",
          }}
        />
      )}
    </>
  );
};

export default memo(SketchCanvas);
