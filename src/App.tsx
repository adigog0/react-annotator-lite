import './index.css'
import Annotator from "./pages/Annotator";


/**
 * Usage
 ```tsx
<Annotator
        image_alt="image"
        image_url="https://randomuser.me/api/portraits/men/33.jpg"
        onDelete={(val) => console.log("delete triggered", val)}
        currentUserId="Unknown"
        drawingOptions={{
          strokeColor: "#0000FF",
          strokeWidth: 10,
        }}
        enableDrawing
/>
 ```
 */
export default Annotator;