import { format } from "date-fns";
import OptionIcon from "../../assets/icons/optionsDot.svg?react";
import { cn } from "../../lib/tailwind";
import CustomMenu from "../customMenu/CustomMenu";
import { memo, useState } from "react";
import type { MetaData } from "../../types/constant";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import { timeAgoFormat } from "../../utils/constants";

export type CommentOption = "Delete" | "Hide comments";
export type CommentHandlerMap = {
  [key in CommentOption]?: (id: string) => void;
};

interface CommentCardProps {
  comment: MetaData;
  type: "fromList" | "fromTag";
  curSelectedMetaDataId: string;
  onClickMetaData?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  getTotalSubCommentCount?: (id: string) => number;
  commentOptionMenuStyle?: React.CSSProperties;
  commentCardStyle?: React.CSSProperties;
  optionLabels?: Partial<Record<CommentOption, React.ReactNode>>; // for custom text/icons
}

const CommentCard = ({
  comment,
  curSelectedMetaDataId,
  onClickMetaData,
  getTotalSubCommentCount,
  commentOptionMenuStyle,
  commentCardStyle,
  optionLabels,
  type,
}: CommentCardProps) => {
  //state
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  //context
  const { hideAllMetadata, handleDeleteMetaData, setSelectedAction } = useAnnotatorContext();

  //consts
  const { metadata_id, created_by, created_at, metadata_value } = comment;
  const isParentComment = comment.parent_id === null;
  const commentOptions: CommentOption[] = isParentComment ? ["Hide comments", "Delete"] : ["Delete"];
  const optionsHandlerMap: CommentHandlerMap = {
    "Hide comments": handleHideComment,
    Delete: handleDeleteMetaData,
  };

  //handlers
  function handleHideComment() {
    hideAllMetadata();
    setSelectedAction("Hide comments");
  }

  function handleOpenOptionMenu(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  }

  function handleCloseOptionMenu() {
    setMenuAnchor(null);
  }

  return (
    <>
      <div
        className={cn(
          "p-2 rounded-md cursor-pointer",
          metadata_id === curSelectedMetaDataId && type === "fromList" ? "bg-blue-100" : "bg-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClickMetaData?.(e, metadata_id);
        }}
        style={commentCardStyle}
      >
        <div className="flex gap-2.5">
          <div className="bg-blue-400 text-white p-1 px-2.5 h-fit capitalize rounded-full">{created_by[0]}</div>

          <div className="text-black overflow-hidden w-full">
            <div className="flex items-center">
              <span className="text-[0.8rem] font-semibold mr-1">{created_by}</span>
              <span className="text-[0.6rem] text-gray-400">{timeAgoFormat(created_at)}</span>
              <button
                id={metadata_id}
                className="ml-auto hover:bg-gray-200 rounded-md relative"
                onClick={handleOpenOptionMenu}
              >
                <OptionIcon className="ml-auto size-4 cursor-pointer" fill="black" />
              </button>
            </div>
            <span className="text-[0.8rem]">{metadata_value}</span>
          </div>
        </div>

        {getTotalSubCommentCount && getTotalSubCommentCount(metadata_id) > 0 && (
          <span className="text-[11px] text-blue-500 font-semibold">
            {getTotalSubCommentCount(metadata_id)} Replies
          </span>
        )}
      </div>

      {/* Option Menu */}
      {menuAnchor && (
        <CustomMenu handleClose={handleCloseOptionMenu} buttonRef={menuAnchor}>
          <div className={cn("flex flex-col")} style={commentOptionMenuStyle}>
            {commentOptions.map((option) => (
              <span
                key={option}
                className="text-xs hover:bg-gray-200 py-1 px-5 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  optionsHandlerMap[option]?.(metadata_id);
                  handleCloseOptionMenu();
                }}
              >
                {optionLabels?.[option] ?? option}
              </span>
            ))}
          </div>
        </CustomMenu>
      )}
    </>
  );
};

export default memo(CommentCard);
