import { type CanvasPath } from "react-sketch-canvas";
import { UserCanvasPath } from "../components/drawingComponents/SketchCanvas";

export type ActionTypes =
  | "Add comment"
  | "Draw"
  | "Hide comments"
  | "Nearest tags"
  | "Save comments"
  | "All comments"
  | "Hide Paths";

export interface MetaData {
  metadata_id: string;
  parent_id: string | null;
  metadata_value: string;
  offsetx: number;
  offsety: number;
  created_at: Date | string;
  created_by: string;
  updated_at?: Date | string;
}

export interface CurUserData {
  userId: string;
  userName: string;
  [key: string]: any;
}
export interface AnnotatorProps {
  image_url: string;
  image_alt: string;

  // Commenting
  initial_Annotations?: MetaData[];
  onCommentAdd?: (comment: MetaData) => void;
  onReplyAdd?: (reply: MetaData, parentId: string) => void;
  commentPillStyle?: React.CSSProperties;
  commentHoverMenuStyle?: React.CSSProperties;
  commentSidebarStyle?: React.CSSProperties;
  commentOptionMenuStyle?: React.CSSProperties;
  onDelete: (metadata_id: string) => void;
  commentItems?: React.ReactNode;
  disableAnnotationDragging?: boolean;

  // Toolbar
  actionIcons?: Partial<Record<ActionTypes, React.ReactNode>>;
  actionToolbarStyle?: React.CSSProperties;

  // Drawing
  enableDrawing?: boolean;
  initial_Paths?: UserCanvasPath[];
  onPathsChange?: (paths: CanvasPath[]) => void;
  drawingOptions?: {
    /** Stroke color in Hex format */
    strokeColor?: string;
    strokeWidth?: number;
  };
  sketchCanvasStyle?: React.CSSProperties;
  currentUserData: CurUserData;
  onSave?: (annotations?: MetaData[], paths?: CanvasPath[]) => void;
  renderPathTooltip?: (index: number, user: CurUserData) => React.ReactNode;

  imageContainerStyle?: React.CSSProperties;
  mainContainerStyle?:React.CSSProperties;
  maxWidth?: number;
  maxHeight?: number;
}
