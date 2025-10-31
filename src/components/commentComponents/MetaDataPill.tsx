import { useRef, useEffect, useState, memo } from "react";
import { cn } from "../../lib/tailwind";
import { format } from "date-fns";
import OptionIcon from "../../assets/icons/optionsDot.svg?react";
import CloseIcon from "../../assets/icons/close.svg?react";
import type { MetaData } from "../../types/constant";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import { UserPill } from "./UserPill";
import CommentCard from "./CommentCard";
import MetaDataInputBox from "./MetaDataInputBox";
import CustomMenu from "../customMenu/CustomMenu";
import useScreenSize from "../../hooks/useScreenSize";
import { timeAgoFormat } from "../../utils/constants";
import { getUserNameInitials } from "../../utils/getUserNameInitials";

const ParentOptions = ["Delete", "Hide Comments"];

interface UserCommentPillProps {
  metadata: MetaData;
  isSelected: boolean;
  comments?: MetaData[];
  onReply: (val: string) => void;
}

const MetaDataPill = ({ metadata, isSelected, comments = [], onReply }: UserCommentPillProps) => {
  //state
  const [parentOptionMenu, setParentOptionMenu] = useState<HTMLButtonElement | null>(null);

  //hooks
  const { curSelectedMetaDataId, hideAllMetadata, handleDeleteMetaData, commentHoverMenuStyle, commentPillStyle } =
    useAnnotatorContext();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const screenSize = useScreenSize();
  const isMobile = screenSize !== "large";

  //const
  const initial = metadata.created_by?.[0]?.toUpperCase() || "U";

  //methods
  function handleCloseParentOptionMenu() {
    setParentOptionMenu(null);
  }

  function handleGetSelectedOptionHandler(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    if (e.currentTarget.id === "Delete") {
      handleDeleteMetaData(curSelectedMetaDataId ?? "");
    } else if (e.currentTarget.id === "Hide Comments") {
      hideAllMetadata();
    }
  }

  function handleOpenParentOptionMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setParentOptionMenu(e.currentTarget);
  }

  // Scroll to bottom when comments change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  return (
    <div
      className={cn(
        "relative group gap-1 bg-white p-1 rounded-t-3xl rounded-br-3xl box-border ",
        isSelected ? "outline-2 outline-blue-500" : "outline-2 outline-transparent"
      )}
    >
      <div
        className={cn(
          "flex justify-center gap-2",
          curSelectedMetaDataId === metadata.metadata_id ? "group-hover:m-0" : "group-hover:m-2 "
        )}
      >
        {/* Pill */}
        <UserPill name={getUserNameInitials(metadata.created_by.userName)} style={commentPillStyle ?? {}} />

        {/* Hover Info */}
        {curSelectedMetaDataId !== metadata.metadata_id && (
          <div
            className={cn(
              "transition-all duration-300 hidden group-hover:block bg-white text-black left-full top-0 min-w-12  max-w-[15rem] overflow-hidden rounded-md z-10 gap-4",
              isSelected ? "z-0" : "z-1"
            )}
            style={commentHoverMenuStyle}
          >
            <div className="flex gap-5 justify-between">
              <span className="text-[0.8rem] font-semibold">{metadata.created_by.userName}</span>
              <span className="text-[0.8rem] text-gray-400 break-normal">
                {timeAgoFormat(metadata.created_at)}
              </span>
            </div>
            <span className="text-[0.8rem]">{metadata.metadata_value}</span>
          </div>
        )}
      </div>

      {/* Comment Menu */}
      {isMobile && isSelected && (
        <div
          ref={menuRef}
          className={cn(
            "bg-white p-2 rounded-md flex-col gap-2 absolute left-10 top-0 z-20 w-[20rem] shadow-lg"
          )}
        >
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-400">Comments</span>
            <div className="flex items-center">
              <button
                data-menu-type="parent"
                onClick={(e) => handleOpenParentOptionMenu(e)}
                className="ml-auto hover:bg-gray-200 rounded-md"
              >
                <OptionIcon className="size-4 cursor-pointer" fill="gray" />
              </button>
              <button className="ml-1 hover:bg-gray-200 rounded-md cursor-pointer">
                <CloseIcon fill="gray" className="size-4" />
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-auto pr-1">
            {comments.map((c) => (
              <CommentCard
                key={c.metadata_id}
                type="fromTag"
                comment={c}
                curSelectedMetaDataId={metadata.metadata_id}
              />
            ))}
            <div ref={endRef}></div>
          </div>

          <MetaDataInputBox handleInputValue={onReply} input_placeholder="Reply" initial_value="" />
        </div>
      )}

      {parentOptionMenu && (
        <CustomMenu handleClose={handleCloseParentOptionMenu} buttonRef={parentOptionMenu}>
          <div className="flex flex-col w-full">
            {ParentOptions.map((c) => (
              <span
                key={c}
                id={c}
                className="text-xs hover:bg-gray-200 py-1 px-5 "
                onClick={(e) => handleGetSelectedOptionHandler(e)}
              >
                {c}
              </span>
            ))}
          </div>
        </CustomMenu>
      )}
    </div>
  );
};

export default memo(MetaDataPill);
