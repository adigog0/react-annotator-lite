import { SketchActions, UserCanvasPath } from "../components/drawingComponents/SketchCanvas";

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
  created_by: CurUserData;
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
  onAddComment?: (comment: MetaData) => void;
  onAddReply?: (reply: MetaData, parentId: string) => void;
  commentPillStyle?: React.CSSProperties;
  commentHoverMenuStyle?: React.CSSProperties;
  commentSidebarStyle?: React.CSSProperties;
  commentOptionMenuStyle?: React.CSSProperties;
  onDelete: (metadata_id: string) => void;
  commentItems?: React.ReactNode;
  disableAnnotationDragging?: boolean;
  onPathUpdate?: (path: UserCanvasPath[]) => void;
  onDeletePaths?:(deletedPaths:string[])=>void;

  // Toolbar
  actionIcons?: Partial<Record<ActionTypes, React.ReactNode>>;
  actionToolbarStyle?: React.CSSProperties;
  editIconStyle?: React.CSSProperties;

  // Drawing
  enableDrawing?: boolean;
  initial_Paths?: UserCanvasPath[];
  // onPathsChange?: (paths: CanvasPath[]) => void;
  drawingOptions?: {
    /** Stroke color in Hex format */
    strokeColor?: string;
    strokeWidth?: number;
  };
  sketchCanvasStyle?: React.CSSProperties;
  currentUserData: CurUserData;
  onSave?: (annotations?: MetaData[], paths?: UserCanvasPath[]) => void;
  renderPathTooltip?: (index: string, user: CurUserData) => React.ReactNode;
  drawToolbarOptions?: {
    topToolbarIcons?: Partial<Record<SketchActions, React.ReactNode>> | undefined;
    strokeIcons?: {
      colorPickerIcon?: React.ReactNode;
      eraserIcon?: React.ReactNode;
      strokeWidthIcons?: Record<number, React.ReactNode>;
    };
    topToolbarStyle?: React.CSSProperties;
  };
  imageContainerStyle?: React.CSSProperties;
  mainContainerStyle?: React.CSSProperties;
  maxWidth?: number;
  maxHeight?: number;
}
