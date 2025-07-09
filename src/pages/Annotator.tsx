import React, { useState, useRef, useMemo, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { CanvasPath } from "react-sketch-canvas";
import type { ActionTypes, AnnotatorProps, MetaData } from "../types/constant";
import { useResponsiveCanvasSize } from "../hooks/useResponsiveCanvasSize";
import { cn } from "../lib/tailwind";
import { AnnotatorContext } from "../context/AnnotatorContext";
import SketchCanvas, { UserCanvasPath } from "../components/drawingComponents/SketchCanvas";
import PathOverlay from "../components/drawingComponents/PathOverlay";
import ActionBar from "../components/actionBar/ActionBar";
import MetaDataSideBar from "../components/commentComponents/MetaDataSideBar";
import BottomMetaDataMenu from "../components/commentComponents/BottomMetaDataMenu";
import MetaDataLayer from "../components/commentComponents/MetaDataLayer";
import AddMetaData from "../components/commentComponents/AddMetaData";
import { calculateDistance, getResponsiveDefaults } from "../utils/constants";
import useScreenSize from "../hooks/useScreenSize";

const Annotator = ({
  image_url,
  initial_Annotations = [],
  initial_Paths = [],
  onCommentAdd,
  onReplyAdd,
  enableDrawing = true,
  drawingOptions,
  commentPillStyle,
  commentHoverMenuStyle,
  commentSidebarStyle,
  commentOptionMenuStyle,
  actionIcons,
  actionToolbarStyle,
  sketchCanvasStyle,
  imageContainerStyle,
  currentUserData,
  onSave,
  onDelete,
  maxWidth,
  maxHeight,
  commentItems,
  disableAnnotationDragging,
  renderPathTooltip
}: AnnotatorProps) => {
  //states
  const [metaData, setMetaData] = useState<MetaData[]>(initial_Annotations);
  const [selectedAction, setSelectedAction] = useState<ActionTypes | null>(null);
  const [canvasPaths, setCanvasPaths] = useState<UserCanvasPath[]>(initial_Paths);
  const [curSelectedMetaDataId, setCurSelectedMetaDataId] = useState<string | null>(null);
  const [offsetValue, setOffsetValue] = useState<{ x: number; y: number; value: string } | null>(null);
  const [openBottomMenu, setOpenBottomMenu] = useState(false);

  //const
  const { maxWidth: defaultWidth, maxHeight: defaultHeight } = getResponsiveDefaults();
  const screenSize = useScreenSize();
  const MAX_WIDTH = maxWidth ?? defaultWidth;
  const MAX_HEIGHT = maxHeight ?? defaultHeight;
 
  //hooks
  const { width, height } = useResponsiveCanvasSize(image_url, MAX_WIDTH, MAX_HEIGHT);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  //consts
  const subComments = useMemo(() => {
    if (!curSelectedMetaDataId) return [];
    return metaData.filter((v) => v.metadata_id === curSelectedMetaDataId || v.parent_id === curSelectedMetaDataId);
  }, [curSelectedMetaDataId, metaData]);

  const shouldShowSidebar = () => {
    if (screenSize === "small" || screenSize === "medium") {
      return selectedAction === "All comments";
    } else {
      return selectedAction === "All comments" || curSelectedMetaDataId !== null;
    }
  };

  //handlers
  const handleAddComment = useCallback(
    (val: string, type: "new" | "sub") => {
      if (val.trim() === "") return;
      let tmpObj: MetaData | null = null;
      if (type === "new" && offsetValue !== null) {
        tmpObj = {
          metadata_id: uuid(),
          parent_id: null,
          metadata_value: val,
          offsetx: offsetValue.x,
          offsety: offsetValue.y,
          created_at: new Date(),
          created_by: currentUserData.userName || "Unknown",
        };
      } else {
        const curParentObj = metaData.find((v) => v.metadata_id === curSelectedMetaDataId);
        if (!curParentObj) return;
        tmpObj = {
          metadata_id: uuid(),
          parent_id: curSelectedMetaDataId,
          metadata_value: val,
          offsetx: curParentObj.offsetx,
          offsety: curParentObj.offsety,
          created_at: new Date(),
          created_by: currentUserData.userName || "Unknown",
        };
      }
      if (tmpObj) {
        setMetaData((prev) => [...prev, tmpObj!]);
        setOffsetValue(null);
        if (type === "new") onCommentAdd?.(tmpObj);
        else if (type === "sub") onReplyAdd?.(tmpObj, curSelectedMetaDataId!);
      }
    },
    [offsetValue, curSelectedMetaDataId, metaData, currentUserData]
  );

  function handleClickMetaData(e: React.MouseEvent<HTMLDivElement>, id: string) {
    e.stopPropagation();
    setSelectedAction(null);
    setOffsetValue(null);
    setCurSelectedMetaDataId(id);
    setOpenBottomMenu(true);
  }

  function handleAddAnnotation(e: React.MouseEvent<HTMLDivElement>) {
    setCurSelectedMetaDataId(null);
    if (selectedAction !== "Add comment") return;
    setOffsetValue(null);
    setOpenBottomMenu(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOffsetValue({ x, y, value: "" });
  }

  function handleHideAllMetadata() {
    const elements = document.querySelectorAll('[id^="metadata_id_"]');
    elements.forEach((el) => {
      if (el instanceof HTMLElement) el.style.visibility = "hidden";
    });
    setCurSelectedMetaDataId(null);
  }

  function showAllMetadata() {
    const elements = document.querySelectorAll('[id^="metadata_id_"]');
    elements.forEach((el) => {
      if (el instanceof HTMLElement) el.style.visibility = "visible";
    });
  }

  function getTotalSubCommentCount(parentId: string) {
    if (parentId === "") return 0;
    const subCommentArr = metaData.filter((c) => c.parent_id === parentId);
    if (subCommentArr) return subCommentArr.length;
    else return 0;
  }

  function handleSetMainAction() {
    setSelectedAction(null);
    showAllMetadata();
  }

  function handleDeleteMetaData(metadata_id: string) {
    console.log("metadata id", metadata_id);

    // Find the comment being deleted
    const deletedComment = metaData.find((c) => c.metadata_id === metadata_id);
    if (!deletedComment) return;

    // Filter out the deleted comment and any of its subcomments if it's a parent
    const modifiedArr = metaData.filter((c) => c.metadata_id !== metadata_id && c.parent_id !== metadata_id);

    console.log("modified", modifiedArr);
    setMetaData(modifiedArr);
    onDelete(metadata_id);

    let shouldKeepBottomMenuOpen = false;

    if (deletedComment.parent_id) {
      // This was a subcomment → check if parent still exists
      const parentStillExists = modifiedArr.some((c) => c.metadata_id === deletedComment.parent_id);
      shouldKeepBottomMenuOpen = parentStillExists;
    } else {
      // This was a parent → check if subcomments still exist
      const subCommentsExist = modifiedArr.some((c) => c.parent_id === deletedComment.metadata_id);
      shouldKeepBottomMenuOpen = subCommentsExist;
    }

    if (!shouldKeepBottomMenuOpen) {
      setOpenBottomMenu(false);
    }
  }

  function handleEnableComment() {
    setOffsetValue(null);
    showAllMetadata();
  }

  function handleDraw() {
    handleHideAllMetadata();
  }

  function handleGetNearestElems(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (selectedAction !== "Nearest tags") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - Math.round(rect.left)) / rect.width) * 100;
    const mouseY = ((e.clientY - Math.round(rect.top)) / rect.height) * 100;

    const THRESHOLD = 20;

    metaData.forEach((v) => {
      const minDist = calculateDistance(mouseX, mouseY, v.offsetx, v.offsety);
      const tagEl = document.getElementById(`metadata_id_${v.metadata_id}`);
      if (!tagEl) return;
      tagEl.style.visibility = minDist <= THRESHOLD ? "visible" : "hidden";
    });
  }

  function handleNearestTag() {
    handleHideAllMetadata();
  }

  function handleSelectedAction(actionType: ActionTypes) {
    setSelectedAction((prev) => {
      const isSameAction = prev === actionType;
      switch (actionType) {
        case "Add comment":
          handleEnableComment();
          break;
        case "Draw":
          handleDraw();
          break;
        case "Hide comments":
          isSameAction ? showAllMetadata() : handleHideAllMetadata();
          break;
        case "Nearest tags":
          isSameAction ? showAllMetadata() : handleNearestTag();
          break;
        case "Save comments":
          onSave?.(metaData, canvasPaths);
          break;
        default:
          break;
      }

      return isSameAction ? null : actionType;
    });
  }

  const handleUpdatePath = useCallback((path: UserCanvasPath[]) => {
    setCanvasPaths(path);
  }, []);

  const contextValue = useMemo(
    () => ({
      metaData,
      setMetaData,
      curSelectedMetaDataId,
      setCurSelectedMetaDataId,
      selectedAction,
      setSelectedAction,
      handleAddComment,
      hideAllMetadata: handleHideAllMetadata,
      showAllMetadata,
      canvasPaths,
      setCanvasPaths,
      handleDeleteMetaData,
      commentPillStyle,
      commentHoverMenuStyle,
      enableDrawing,
      currentUserData,
      renderPathTooltip
    }),
    [metaData, curSelectedMetaDataId, selectedAction, canvasPaths]
  );

  return (
    <AnnotatorContext.Provider value={contextValue}>
      <div className="h-dvh flex flex-row relative bg-gray-950 border-2 border-black">
        {/* Sidebar */}
        {shouldShowSidebar() && (
          <MetaDataSideBar
            ref={sideBarRef}
            getTotalSubCommentCount={getTotalSubCommentCount}
            commentSidebarStyle={commentSidebarStyle}
            commentOptionMenuStyle={commentOptionMenuStyle}
            onClickMetaData={handleClickMetaData}
          />
        )}

        {/* Toolbar */}
        {selectedAction !== "Draw" && (
          <div
            ref={actionRef}
            className={cn(
              "absolute top-2 md:top-5 left-1/2 -translate-x-1/2 z-20 backdrop-blur-md shadow-md py-1 px-2 rounded-md"
            )}
            style={actionToolbarStyle}
          >
            <ActionBar handleSelectedAction={handleSelectedAction} actionIcons={actionIcons} />
          </div>
        )}

        {/* Image Container */}
        <div className="flex flex-1 flex-col justify-center items-center">
          <div
            ref={imageContainerRef}
            onClick={handleAddAnnotation}
            style={{ ...imageContainerStyle, width, height, maxWidth, maxHeight }}
            className={cn("relative flex justify-center items-center border border-white")}
            onMouseMove={(e) => handleGetNearestElems(e)}
          >
            <SketchCanvas
              image_url={image_url}
              canvasPath={canvasPaths}
              handleUpdatePath={handleUpdatePath}
              sketchCanvasStyle={sketchCanvasStyle}
              drawingOptions={drawingOptions}
              handleSetMainAction={handleSetMainAction}
              inDrawMode={selectedAction === "Draw" && enableDrawing}
            />

            {selectedAction !== "Draw" && enableDrawing && canvasPaths?.length > 0 && (
              <PathOverlay
                paths={canvasPaths}
                canvasWidth={width}
                canvasHeight={height}
                denormalize={({ x, y }) => ({ x, y })}
                hideAllPaths={selectedAction === "Hide Paths" ? true : false}
              />
            )}

            {metaData?.length > 0 && (
              <MetaDataLayer
                handleClickMetaData={handleClickMetaData}
                commentItems={commentItems}
                disableDrag={disableAnnotationDragging}
              />
            )}

            {selectedAction === "Add comment" && offsetValue && (
              <AddMetaData offsetValues={offsetValue} handleAddMetadata={handleAddComment} />
            )}
          </div>
        </div>

        {/* Bottom Menu */}
        {openBottomMenu && (
          <div className="w-full absolute bottom-0 block lg:hidden">
            <BottomMetaDataMenu
              isOpen={openBottomMenu}
              handleCloseMenu={() => setOpenBottomMenu(false)}
              handleAddMetadata={handleAddComment}
              subComments={subComments}
              menuClassName="max-w-md mx-auto"
              doneButtonLabel="Done"
            />
          </div>
        )}
      </div>
    </AnnotatorContext.Provider>
  );
};

export default Annotator;
