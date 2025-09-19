import { useState } from "react";
import CloseIcon from "../../assets/icons/close.svg?react";
import type { MetaData } from "../../types/constant";
import { cn } from "../../lib/tailwind";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import MetaDataListDisplay from "./MetaDataListDisplay";

interface BottomCommentMenuProps {
  isOpen: boolean;
  handleCloseMenu: () => void;
  handleAddMetadata: (val: string, type: "new" | "sub") => void;
  subComments: MetaData[];
  allowCloseOnOverlayClick?: boolean;
  doneButtonLabel?: string;
  bottomMenuClassName?: string;
  overlayClassName?: string;
  renderCustomCommentList?: React.ReactNode;
}

const BottomMetaDataMenu = ({
  isOpen,
  handleCloseMenu,
  handleAddMetadata,
  subComments,
  allowCloseOnOverlayClick = true,
  doneButtonLabel = "Done",
  bottomMenuClassName,
  overlayClassName,
  renderCustomCommentList,
}: BottomCommentMenuProps) => {
  //states
  const [comment, setComment] = useState("");

  //context
  const { curSelectedMetaDataId } = useAnnotatorContext();

  //methods
  function handleAddComment() {
    if (!comment.trim()) return;
    handleAddMetadata(comment.trim(), "new");
    setComment("");
    handleCloseMenu();
  }

  return (
    <>
      {isOpen && (
        <>
          <div
            className={cn("fixed top-0 left-0 right-0 bottom-0 z-[1000] bg-[rgba(0,0,0,0.3)]", overlayClassName)}
            onClick={() => allowCloseOnOverlayClick && handleCloseMenu()}
          />
          <div
            className={cn(
              "fixed left-0 right-0 p-4 bg-white shadow-lg rounded-t-xl z-[1001] transition-all duration-300",
              bottomMenuClassName
            )}
            style={{ bottom: isOpen ? 0 : "-50vh" }}
          >
            {/* Header */}
            <div className="mb-2 flex justify-between items-center font-semibold text-lg">
              <span>{subComments.length > 0 ? "Comments" : "Add a comment"}</span>
              <button onClick={handleCloseMenu} className="hover:bg-gray-200 rounded-md p-1">
                <CloseIcon fill="gray" className="size-4" />
              </button>
            </div>

            {/* Render external comment list if passed */}
            {renderCustomCommentList ? (
              renderCustomCommentList
            ) : curSelectedMetaDataId ? (
              <MetaDataListDisplay comments={subComments} />
            ) : (
              <>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your comment here..."
                  className="w-full resize-none p-2 text-base border rounded-lg border-gray-300 outline-none"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={comment.trim() === ""}
                  className={cn(
                    "mt-3 w-full py-2 px-4 rounded-lg text-white",
                    comment.trim() === "" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {doneButtonLabel}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default BottomMetaDataMenu;
