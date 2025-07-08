import React from "react";
import { cn } from "../../lib/tailwind";
import CommentIcon from "../../assets/icons/commentIcon.svg?react";
import NearestTagIcon from "../../assets/icons/nearestTag.svg?react";
import VisibilityOffIcon from "../../assets/icons/visibility-off.svg?react";
import DrawIcon from "../../assets/icons/draw.svg?react";
import SaveIcon from "../../assets/icons/save.svg?react";
import Tooltip from "../../components/tooltip/Tooltip";
import VisibilityOnIcon from "../../assets/icons/visibility_on.svg?react";
import HidePathsIcon from "../../assets/icons/noDraw.svg?react";
import ViewAllCommentsIcon from "../../assets/icons/viewAll.svg?react";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import useScreenSize from "../../hooks/useScreenSize";

export type ActionTypes =
  | "Add comment"
  | "Nearest tags"
  | "Hide comments"
  | "Draw"
  | "Hide Paths"
  | "Save comments"
  | "All comments";

interface ActionToolbarProps {
  handleSelectedAction: (actionType: ActionTypes) => void;
  className?: string;
  actionIcons?: Partial<Record<ActionTypes, React.ReactNode>>;
}

const ActionBar: React.FC<ActionToolbarProps> = ({ handleSelectedAction, className, actionIcons = {} }) => {
  //hook
  const { selectedAction, enableDrawing } = useAnnotatorContext();
  const screenSize = useScreenSize();

  //consts
  const getIcon = (label: ActionTypes) => {
    // If user passed a custom icon, use it
    if (actionIcons[label]) return actionIcons[label];

    // Else return default icon
    switch (label) {
      case "Add comment":
        return <CommentIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      case "Nearest tags":
        return <NearestTagIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      case "Hide comments":
        return selectedAction === "Hide comments" ? (
          <VisibilityOffIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />
        ) : (
          <VisibilityOnIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />
        );
      case "Draw":
        return <DrawIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      case "Save comments":
        return <SaveIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      case "Hide Paths":
        return <HidePathsIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      case "All comments":
        return <ViewAllCommentsIcon className="cursor-pointer fill-amber-50 hover:fill-gray-800" />;
      default:
        return null;
    }
  };

  const ActionArr: ActionTypes[] = [
    "All comments",
    "Add comment",
    ...(screenSize === "large" ? (["Nearest tags"] as ActionTypes[]) : []),
    "Hide comments",
    ...(enableDrawing ? (["Draw"] as ActionTypes[]) : []),
    "Hide Paths",
    "Save comments",
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      {ActionArr.map((label, i) => (
        <Tooltip title={label} key={i}>
          <button
            id={label}
            className={cn(
              "bg-gray-700  p-1 rounded-xl hover:bg-blue-100 hover:text-gray-800",
              selectedAction && selectedAction !== "Save comments" && selectedAction === label
                ? "bg-blue-300"
                : "bg-gray-700"
            )}
            onClick={() => handleSelectedAction(label)}
          >
            {getIcon(label)}
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ActionBar;
