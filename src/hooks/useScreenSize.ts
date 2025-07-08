import { useState, useEffect } from "react";

type ScreenSize = "small" | "medium" | "large";

function useScreenSize(): ScreenSize {
  
  const getScreenSize = (): ScreenSize => {
    const width = window.innerWidth;
    if (width < 768) return "small";
    if (width < 1024) return "medium";
    return "large";
  };

  const [screenSize, setScreenSize] = useState<ScreenSize>(() => getScreenSize());

  useEffect(() => {
    function handleResize() {
      setScreenSize(getScreenSize());
    }

    window.addEventListener("resize", handleResize);
    // Also update once on mount in case size changed before listener added
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
}

export default useScreenSize;
