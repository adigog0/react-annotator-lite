import { cn } from "../../lib/tailwind";
import { memo, useMemo } from "react";

import { useAnnotatorContext } from "../../context/AnnotatorContext";
import UserCommentPill from "./UserCommentPill";

interface IProps {
  handleClickMetaData: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string) => void;
  commentItems?: React.ReactNode;
  disableDrag?: boolean;
}

const MetaDataLayer = ({ handleClickMetaData, commentItems, disableDrag = false }: IProps) => {
  const { curSelectedMetaDataId, metaData, setMetaData, handleAddComment } = useAnnotatorContext();

  //consts
  const subComments = useMemo(() => {
    return metaData.filter((v) => v.metadata_id === curSelectedMetaDataId || v.parent_id === curSelectedMetaDataId);
  }, [metaData, curSelectedMetaDataId]);

  //methods

  const handleOnDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", e.currentTarget.id.split("_")[2]);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.style.cursor = "grabbing";
  };

  const handleOnDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
     e.currentTarget.style.cursor = "grab";
    const currentImage = document.getElementById("current_image");
    const draggedId = e.currentTarget.id.split("_")[2];
    const idx = metaData.findIndex((v) => v.metadata_id === draggedId);

    if (!currentImage || idx === -1) return;

    const rect = currentImage.getBoundingClientRect();
    const { left, top, width, height, right, bottom } = rect;

    const inside = e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom;
    if (!inside) return;

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    const updated = [...metaData];
    updated[idx] = { ...updated[idx], offsetx: x, offsety: y };
    setMetaData(updated);
  };

  const handleAddSubComment = (val: string) => {
    handleAddComment(val, "sub");
  };

  return (
    <>
      {metaData
        .filter((v) => v.parent_id === null)
        .map((v) => {
          const isSelected = curSelectedMetaDataId === v.metadata_id;

          return (
            <div
              key={v.metadata_id}
              id={`metadata_id_${v.metadata_id}`}
              style={{
                top: `${v.offsety}%`,
                left: `${v.offsetx}%`,
                cursor: "grab",
              }}
              className={cn("absolute group flex -translate-y-full", isSelected ? "z-20" : "z-10")}
              onClick={(e) => handleClickMetaData(e, v.metadata_id)}
              draggable={!disableDrag}
              onDragStart={!disableDrag ? handleOnDragStart : undefined}
              onDragEnd={!disableDrag ? handleOnDragEnd : undefined}
            >
              {commentItems ? (
                commentItems
              ) : (
                <UserCommentPill
                  isSelected={isSelected}
                  metadata={v}
                  comments={subComments}
                  onReply={handleAddSubComment}
                />
              )}
            </div>
          );
        })}
    </>
  );
};

export default memo(MetaDataLayer);
