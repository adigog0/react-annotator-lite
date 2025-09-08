import { memo } from "react";
import MetaDataInputBox from "./MetaDataInputBox";

interface IProps {
  offsetValues: {
    x: number;
    y: number;
    value: string;
  } | null;
  handleAddMetadata: (val: string, type: "new" | "sub") => void;
}

const AddMetaData = ({ offsetValues, handleAddMetadata }: IProps) => {
  if (offsetValues === null) return null;

  function handleAddNewComment(val: string) {
    handleAddMetadata(val, "new");
  }

  return (
    <div
      className=" absolute gap-2 -translate-y-full min-w-[15rem]"
      style={offsetValues ? { top: `${offsetValues.y}%`, left: `${offsetValues.x}%` } : {}}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-blue-400 rounded-t-2xl rounded-br-2xl text-white p-1 px-2.5 h-fit capitalize mt-auto">U</div>

      {/** desktop view */}
      <div className="gap-2 bg-white p-1 rounded-xl hidden md:block">
        <MetaDataInputBox handleInputValue={handleAddNewComment} input_placeholder="Add a comment" initial_value="" />
      </div>
    </div>
  );
};

export default memo(AddMetaData);
