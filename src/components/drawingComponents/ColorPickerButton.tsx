import React, { useRef } from "react";
import type { FC } from "react";
import ColorPickIcon from "../../assets/icons/colorPicker.svg?react"; // Your SVG icon
import Tooltip from "../tooltip/Tooltip";

interface ColorPickButtonProps {
  strokeColor: string;
  onChange: (color: string) => void;
  customIcon?: React.ReactNode;
}

const ColorPickerButton: FC<ColorPickButtonProps> = ({ strokeColor, onChange, customIcon }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Tooltip title="Pick Color">
      <div className="relative w-8 h-8">
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-full rounded-lg bg-gray-700 border border-transparent hover:border-gray-400 flex items-center justify-center"
        >
          {customIcon ?? <ColorPickIcon className="w-5 h-5 pointer-events-none" style={{ fill: strokeColor }} />}
        </button>
        <input
          ref={inputRef}
          type="color"
          value={strokeColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </Tooltip>
  );
};

export default ColorPickerButton;
