import { useEffect, useRef, useState } from "react";

type CustomMenuProps = {
  buttonRef: HTMLElement | null;
  handleClose: () => void;
  children: React.ReactNode;
};

const CustomMenu = ({ buttonRef, handleClose, children }: CustomMenuProps) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const calculatePosition = () => {
    if (buttonRef && menuContainerRef.current) {
      const parent = buttonRef.offsetParent as HTMLElement;
      const rect = buttonRef.getBoundingClientRect();
      const parentRect = parent?.getBoundingClientRect();
      const menuRect = menuContainerRef.current.getBoundingClientRect();

      let top = rect.bottom - parentRect.top + 4;
      let left = rect.left - parentRect.left;

      // Clamp to right edge
      if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - parentRect.left - 8;
      }

      // Clamp to bottom edge
      if (top + menuRect.height > window.innerHeight) {
        top = rect.top - parentRect.top - menuRect.height - 4;
      }

      // Minimum clamp
      left = Math.max(left, 8);
      top = Math.max(top, 8);

      setPosition({ top, left });
    }
  };

  useEffect(() => {
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef &&
        !buttonRef.contains(e.target as Node) &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        console.log("clicked outside")
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [buttonRef, handleClose]);

  return (
    <div
      ref={menuContainerRef}
      className="absolute z-50 bg-white rounded-md py-2 shadow-md"
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: position ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
};

export default CustomMenu;
