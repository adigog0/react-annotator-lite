import React, { useEffect, useRef, useState } from "react";

interface TooltipProps {
  title: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const Tooltip = ({ title, children, position = "top" }: TooltipProps) => {

  //states
  const [visible, setVisible] = useState(false);
  const [finalPosition, setFinalPosition] = useState(position);

  //hooks
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  //const
  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  //methods
  const updatePosition = () => {
    const tooltip = tooltipRef.current;
    const wrapper = wrapperRef.current;
    if (!tooltip || !wrapper) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const { innerWidth: winWidth, innerHeight: winHeight } = window;

    let newPosition = position;

    const overflows = {
      top: wrapperRect.top - tooltipRect.height < 0,
      bottom: wrapperRect.bottom + tooltipRect.height > winHeight,
      left: wrapperRect.left - tooltipRect.width < 0,
      right: wrapperRect.right + tooltipRect.width > winWidth,
    };

    if (position === "top" && overflows.top && !overflows.bottom) newPosition = "bottom";
    else if (position === "bottom" && overflows.bottom && !overflows.top) newPosition = "top";
    else if (position === "left" && overflows.left && !overflows.right) newPosition = "right";
    else if (position === "right" && overflows.right && !overflows.left) newPosition = "left";

    setFinalPosition(newPosition);
  };

  //lifecycle
  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible, position]);

  return (
    <div
      className="relative inline-block"
      ref={wrapperRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-400 rounded-md whitespace-nowrap ${positionClasses[finalPosition]}`}
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
