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

const ActionBar: React.FC<ActionToolbarProps> = ({ handleSelectedAction, className, actionIcons }) => {
  //hook
  const { selectedAction, enableDrawing } = useAnnotatorContext();
  const screenSize = useScreenSize();

  //consts
  const getIcon = (label: ActionTypes) => {
    // If user passed a custom icon, use it
    if ( actionIcons && actionIcons[label]) return actionIcons[label];

    const iconClass = "cursor-pointer group-hover:fill-gray-800";

    // Else return default icon
    switch (label) {
      case "Add comment":
        return <CommentIcon className={iconClass} />;
      case "Nearest tags":
        return <NearestTagIcon className={iconClass} />;
      case "Hide comments":
        return selectedAction === "Hide comments" ? (
          <VisibilityOffIcon className={iconClass} />
        ) : (
          <VisibilityOnIcon className={iconClass} />
        );
      case "Draw":
        return <DrawIcon className={iconClass} />;
      case "Save comments":
        return <SaveIcon className={iconClass} />;
      case "Hide Paths":
        return <HidePathsIcon className={iconClass} />;
      case "All comments":
        return <ViewAllCommentsIcon className={iconClass} />;
      default:
        return null;
    }
  };

  const defaultActions: ActionTypes[] = [
    "All comments",
    "Add comment",
    ...(screenSize === "large" ? (["Nearest tags"] as ActionTypes[]) : []),
    "Hide comments",
    ...(enableDrawing ? (["Draw"] as ActionTypes[]) : []),
    "Hide Paths",
    "Save comments",
  ];

  // If user provided actionIcons → show only those actions, else show defaults
  const ActionArr: ActionTypes[] =
    actionIcons && Object.keys(actionIcons).length > 0 ? (Object.keys(actionIcons) as ActionTypes[]) : defaultActions;

  return (
    <div className={cn("flex gap-2", className)}>
      {ActionArr.map((label, i) => (
        <Tooltip title={label} key={i}>
          <button
            id={label}
            className={cn(
              "bg-gray-700 group p-1 rounded-xl hover:bg-blue-100 text-amber-50 hover:text-gray-800 cursor-pointer",
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
