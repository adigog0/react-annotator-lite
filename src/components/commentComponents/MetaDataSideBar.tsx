import { forwardRef, useState } from "react";
import { useAnnotatorContext } from "../../context/AnnotatorContext";
import CancelIcon from "../../assets/icons/cancel.svg?react";
import { cn } from "../../lib/tailwind";
import SideBar from "../sideBar/SideBar";
import CommentCard from "./CommentCard";

interface CommentSideBarProps {
  getTotalSubCommentCount: (parentId: string) => number;
  onClickMetaData: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  commentSidebarStyle?: React.CSSProperties;
  commentOptionMenuStyle?: React.CSSProperties;
  renderHeader?: React.ReactNode;
}

const MetaDataSideBar = forwardRef<HTMLDivElement, CommentSideBarProps>(
  ({ getTotalSubCommentCount, onClickMetaData, commentSidebarStyle, commentOptionMenuStyle, renderHeader }, ref) => {
    //context
    const { curSelectedMetaDataId, metaData, setSelectedAction, setCurSelectedMetaDataId } = useAnnotatorContext();

    //state
    const [searchQuery, setSearchQuery] = useState("");

    //methods
    function handleCloseSideBar() {
      setSelectedAction(null);
      if (curSelectedMetaDataId) {
        setCurSelectedMetaDataId(null);
      }
    }

    const filteredMetaData = metaData
      .filter((c) => c.parent_id === null)
      .filter(
        (c) =>
          c.metadata_value?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
          c.metadata_value?.toLowerCase().startsWith(searchQuery.toLowerCase())
      );

    return (
      <div className="fixed inset-0 z-40 lg:z-20 flex" onClick={handleCloseSideBar}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-300 opacity-20 block lg:hidden" />

        {/* Sidebar */}
        <SideBar className={cn("relative z-50 bg-blue-50 h-full", commentSidebarStyle)}>
          <div className="h-full shadow-md flex flex-col" ref={ref}>
            {renderHeader || (
              <div className="p-3 border-b border-gray-300 flex items-center justify-between">
                <span className="text-sm font-semibold">Comments</span>
                <button className="hover:bg-gray-300 rounded-full p-0.5" onClick={handleCloseSideBar}>
                  <CancelIcon fill="black" className="size-4 cursor-pointer" />
                </button>
              </div>
            )}

            {metaData.length > 0 ? (
              <div className="p-3 gap-2 flex flex-col">
                <input
                  autoFocus
                  placeholder="Search"
                  className="w-full outline-none border border-gray-300 py-1 px-2 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e)=>e.stopPropagation()}
                />
                {filteredMetaData.length > 0 ? (
                  filteredMetaData.map((c) => (
                    <CommentCard
                      key={c.metadata_id}
                      type="fromList"
                      comment={c}
                      curSelectedMetaDataId={curSelectedMetaDataId ?? ""}
                      getTotalSubCommentCount={getTotalSubCommentCount}
                      onClickMetaData={onClickMetaData}
                      commentOptionMenuStyle={commentOptionMenuStyle}
                    />
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-400 pt-2">No results found</div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center">
                <span className="text-sm text-gray-400">No Annotation added</span>
              </div>
            )}
          </div>
        </SideBar>
      </div>
    );
  }
);

export default MetaDataSideBar;
