import { createContext, useContext } from "react";
import type { CanvasPath } from "react-sketch-canvas";
import type { ActionTypes, MetaData } from "../types/constant";

export interface AnnotatorContextType {
  metaData: MetaData[];
  setMetaData: (data: MetaData[]) => void;

  selectedAction: ActionTypes | null;
  setSelectedAction: (action: ActionTypes | null) => void;

  curSelectedMetaDataId: string | null;
  setCurSelectedMetaDataId: (id: string | null) => void;

  handleAddComment: (text: string, type: "new" | "sub") => void;
  handleDeleteMetaData: (metadata_id: string) => void;

  hideAllMetadata: () => void;
  showAllMetadata: () => void;

  canvasPaths: CanvasPath[];
  setCanvasPaths: (paths: CanvasPath[]) => void;

  currentUserId: string;

  commentPillStyle?: React.CSSProperties;
  commentHoverMenuStyle?: React.CSSProperties;
  enableDrawing: boolean;
}

export const AnnotatorContext = createContext<AnnotatorContextType | null>(null);

export function useAnnotatorContext() {
  const ctx = useContext(AnnotatorContext);
  if (!ctx) throw new Error("useAnnotatorContext must be used within a provider");
  return ctx;
}
