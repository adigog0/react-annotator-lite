# 🖊️ react-annotator-lite

A lightweight, extensible React component for image annotation. **react-annotator-lite** enables freehand drawing and threaded comments directly on images or canvases, with a responsive layout, rich metadata handling, and built-in UI components for action bars, comment sidebars, and overlays.

---

## ✨ Features

- **Threaded Comments:** Add comments and replies directly on images.
- **Draggable Annotations:** Move comments anywhere over the image.
- **Drawing Tools:** Freehand drawing with undo/redo, eraser, and color/stroke selection.
- **Nearest Tag Visibility:** Show the closest tag on hover for context.
- **Layer Control:** Toggle visibility of comments and drawing layers independently.
- **Responsive Design:** Works seamlessly on both desktop and mobile.
- **Customizable UI:** Replace built-in components or styles with your own.
- **Performance Optimized:** Uses React memoization and efficient event handling.

---

## 🚀 Quick Start

### Installation

```sh
npm install react-annotator-lite
# or
yarn add react-annotator-lite
```

### Usage Example

```js
import React, { useState } from "react";
import Annotator from "react-annotator-lite";

const App = () => {
  const [annotations, setAnnotations] = useState([]);
  const [paths, setPaths] = useState([]);

  const handleCommentAdd = (comment) => {
    setAnnotations((prev) => [...prev, comment]);
  };

  const handleReplyAdd = (reply, parentId) => {
    // Add reply logic
  };

  const handleSave = (metaData, canvasPaths) => {
    // Save logic
  };

  const handleDelete = (metadataId) => {
    // Delete logic
  };

  // Example: Custom tooltip for drawing paths
  const renderPathTooltip = (path, index) => (
    <div style={{ background: '#222', color: '#fff', padding: 4, borderRadius: 4 }}>
      <strong>Drawn by:</strong> {path.user?.userName || 'Unknown'}<br />
      <strong>Path #{index + 1}</strong>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Annotator
        image_url="https://example.com/sample-image.jpg"
        initial_Annotations={annotations}
        initial_Paths={paths}
        onCommentAdd={handleCommentAdd}
        onReplyAdd={handleReplyAdd}
        onSave={handleSave}
        onDelete={handleDelete}
        enableDrawing={true}
        currentUserData={{ userId: "user-123", userName: "Alice" }}
        maxWidth={800}
        maxHeight={600}
        drawingOptions={{ strokeColor: '#00f', strokeWidth: 8 }}
        renderPathTooltip={renderPathTooltip}
      />
    </div>
  );
};

export default App;
```

---

## 📚 API Reference

### `<Annotator />` Props

| Prop                        | Type                                      | Description                                                      | Default            |
|-----------------------------|-------------------------------------------|------------------------------------------------------------------|--------------------|
| `image_url`                 | `string`                                  | URL of the image to annotate (**required**)                       | —                  |
| `initial_Annotations`       | `MetaData[]`                              | Initial comment annotations                                      | `[]`               |
| `initial_Paths`             | `UserCanvasPath[]`                        | Initial drawing paths                                            | `[]`               |
| `onCommentAdd`              | `(comment: MetaData) => void`             | Callback when a new comment is added                             | —                  |
| `onReplyAdd`                | `(reply: MetaData, parentId: string) => void` | Callback when a reply to a comment is added                  | —                  |
| `onSave`                    | `(metaData: MetaData[], paths: UserCanvasPath[]) => void` | Callback when save action is triggered           | —                  |
| `onDelete`                  | `(metadataId: string) => void`            | Callback when a comment or reply is deleted                      | —                  |
| `enableDrawing`             | `boolean`                                 | Enable or disable drawing mode                                   | `true`             |
| `currentUserData`           | `{ userId: string; userName?: string }`   | Current user info for created comments                           | `{ userId: 'Unknown' }` |
| `maxWidth`                  | `number`                                  | Max width of image container                                     | Responsive default |
| `maxHeight`                 | `number`                                  | Max height of image container                                    | Responsive default |
| `commentPillStyle`          | `React.CSSProperties`                     | Custom style for comment pills                                   | —                  |
| `commentHoverMenuStyle`     | `React.CSSProperties`                     | Style for comment hover menu                                     | —                  |
| `commentSidebarStyle`       | `React.CSSProperties`                     | Style for the comment sidebar                                    | —                  |
| `commentOptionMenuStyle`    | `React.CSSProperties`                     | Style for comment option menus                                   | —                  |
| `actionIcons`               | `Record<string, React.ReactNode>`         | Custom action icons for toolbar                                  | —                  |
| `actionToolbarStyle`        | `React.CSSProperties`                     | Style for the action toolbar                                     | —                  |
| `sketchCanvasStyle`         | `React.CSSProperties`                     | Style for the drawing canvas                                     | —                  |
| `imageContainerStyle`       | `React.CSSProperties`                     | Style for the image container wrapper                            | —                  |
| `commentItems`              | `React.ReactNode`                         | Custom comment item renderer                                     | —                  |
| `disableAnnotationDragging` | `boolean`                                 | Disable dragging of comment annotations                          | `false`            |
| `drawingOptions`            | `{ strokeColor?: string; strokeWidth?: number; }` | Drawing tool options (color, width)                  | —                  |
| `renderPathTooltip`         | `(path: UserCanvasPath, index: number) => React.ReactNode` | Custom tooltip renderer for drawing paths         | —                  |

#### Callback Details

- **onCommentAdd(comment: MetaData):**
  Called when a new comment is added. Receives the comment object.
- **onReplyAdd(reply: MetaData, parentId: string):**
  Called when a reply is added to a comment. Receives the reply and parent comment ID.
- **onSave(metaData: MetaData[], paths: UserCanvasPath[]):**
  Called when the user triggers a save action. Receives all metadata and drawing paths.
- **onDelete(metadataId: string):**
  Called when a comment or reply is deleted. Receives the metadata ID.

---

## 🧩 Custom Drawing Path Tooltip (`renderPathTooltip`)

You can provide a custom tooltip for each drawing path using the `renderPathTooltip` prop. This function receives the path object and its index, and should return a React node to display as a tooltip when hovering over a path.

**Example:**

```jsx
const renderPathTooltip = (path, index) => (
  <div style={{ background: '#333', color: '#fff', padding: 6, borderRadius: 4 }}>
    <div>Drawn by: <b>{path.user?.userName || 'Unknown'}</b></div>
    <div>Path #{index + 1}</div>
    <div>Points: {path.paths.length}</div>
  </div>
);

<Annotator
  image_url="..."
  // ...other props
  renderPathTooltip={renderPathTooltip}
/>
```

---

## 🏗️ Architecture Overview

- **Component Structure:**
  - `Annotator` is the main component, managing state and context for annotation, drawing, and UI.
  - Modular subcomponents: `SketchCanvas`, `MetaDataLayer`, `ActionBar`, `MetaDataSideBar`, `BottomMetaDataMenu`, etc.
  - Uses React Context for state sharing and hooks for responsive layout and performance.
- **Drawing Engine:**
  - Freehand drawing with undo/redo, eraser, and color/stroke selection.
  - Drawing paths are normalized for responsive scaling.
- **Comment System:**
  - Threaded comments with drag-and-drop, reply, and delete support.
  - Sidebar and overlay UI for managing and viewing comments.
- **Customization:**
  - All UI elements can be styled or replaced via props.
  - Supports custom icons, toolbars, and comment rendering.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository and create your branch from `main`.
2. Run `npm install` to install dependencies.
3. Make your changes and add tests if applicable.
4. Run `npm run lint` and `npm run build` to ensure code quality.
5. Submit a pull request with a clear description of your changes.

### Guidelines
- Follow the existing code style and naming conventions.
- Write clear, concise commit messages.
- Add or update documentation as needed.
- Ensure all tests pass before submitting.

---

## 📄 License

MIT



