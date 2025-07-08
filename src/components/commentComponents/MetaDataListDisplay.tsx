import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/tailwind";
import CloseIcon from "../../assets/icons/close.svg?react";
import OptionIcon from "../../assets/icons/optionsDot.svg?react";
import CustomMenu from "../customMenu/CustomMenu";
import CommentCard from "./CommentCard";
import MetaDataInputBox from "./MetaDataInputBox";
import type { MetaData } from "../../types/constant";
import { useAnnotatorContext } from "../../context/AnnotatorContext";

const parentCommentOptions = ["Hide Comments", "Delete"] as const;
const commentOptions = ["Delete"] as const;

type CommentOption = (typeof commentOptions)[number];
type CommentHandlerMap = {
  [key in CommentOption]: (id: string) => void;
};

interface CommentListDisplayProps {
  comments: MetaData[];
}

const MetaDataListDisplay = ({ comments }: CommentListDisplayProps) => {
  //states
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  //hooks
  const endRef = useRef<HTMLDivElement | null>(null);
  const { curSelectedMetaDataId, handleDeleteMetaData, handleAddComment } = useAnnotatorContext();

  //const
  const CommentOptionsHandlerMap: CommentHandlerMap = {
    Delete: handleDeleteMetaData,
  };

  //methods

  function handleOpenOptionMenu(e: React.MouseEvent<HTMLButtonElement>) {
    setMenuAnchor(e.currentTarget);
  }

  function handleCloseOptionMenu() {
    setMenuAnchor(null);
  }

  function handleGenerateCommentOptions() {
    return menuAnchor?.dataset.menuType === "parent" ? parentCommentOptions : commentOptions;
  }

  function handleAddSubComment(val: string) {
    handleAddComment(val, "sub");
  }

  const getlistHandler = (e: React.MouseEvent<HTMLSpanElement>) => {
    const option = e.currentTarget.id as keyof typeof CommentOptionsHandlerMap;
    const id = curSelectedMetaDataId ?? "";
    CommentOptionsHandlerMap[option](id);
  };

  useEffect(() => {
    if (comments.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  const parentData = comments.find((c) => c.metadata_id === curSelectedMetaDataId);
  if (!parentData) return null;

  return (
    <div className="flex gap-3 relative ">
      {/* <div
        className={cn(
          "bg-white p-1 rounded-t-3xl rounded-br-3xl h-fit",
          parentData.metadata_id === curSelectedMetaDataId ? "border-2 border-blue-400" : "bg-white"
        )}
      >
        <div className="bg-blue-400  text-white p-1 px-2.5 h-fit capitalize rounded-full">
          {parentData.created_by[0]}
        </div>
      </div> */}
      {/** desktop view menu */}
      <div
        className={cn(
          "bg-white p-2 rounded-md  flex-col gap-2 absolute hidden lg:block",
          curSelectedMetaDataId === parentData.metadata_id ? "z-20" : "z-10"
        )}
      >
        <div className="flex justify-between items-center">
          <span className="border-gray-500 text-xs text-gray-400">Comment</span>
          <button
            data-menu-type="parent"
            // id={`parent_comment_options_${curSelectedMetaDataId}`}
            className="ml-auto  hover:bg-gray-200 rounded-md relative"
            onClick={handleOpenOptionMenu}
          >
            <OptionIcon className="ml-auto size-4 cursor-pointer" fill="gray" />
          </button>
          <button className=" ml-1 hover:bg-gray-200 rounded-md">
            <CloseIcon fill="gray" className="size-4" />
          </button>
        </div>
        <div className="border-b border-gray-300"></div>
        <div className="max-h-90 overflow-auto">
          {comments.map((c) => (
            <CommentCard
              key={c.metadata_id}
              type="fromTag"
              comment={c}
              curSelectedMetaDataId={curSelectedMetaDataId ?? ""}
            />
          ))}
          <div ref={endRef}></div>
        </div>

        <MetaDataInputBox handleInputValue={handleAddSubComment} input_placeholder="Reply" initial_value="" />
      </div>

      {/** mobile view  - when a comment is selected*/}
      <div className="max-h-90 overflow-auto block lg:hidden w-full">
        {comments.map((c) => (
          <CommentCard
            key={c.metadata_id}
            type="fromTag"
            comment={c}
            curSelectedMetaDataId={curSelectedMetaDataId ?? ""}
          />
        ))}
        <div ref={endRef}></div>
        <MetaDataInputBox handleInputValue={handleAddSubComment} input_placeholder="Reply" initial_value="" />
      </div>

      <CustomMenu handleClose={handleCloseOptionMenu} buttonRef={menuAnchor}>
        <div className="flex flex-col w-full">
          {handleGenerateCommentOptions().map((c) => (
            <span key={c} id={c} className="text-xs hover:bg-gray-200 py-1 px-5 " onClick={(e) => getlistHandler(e)}>
              {c}
            </span>
          ))}
        </div>
      </CustomMenu>
    </div>
  );
};

export default MetaDataListDisplay;
