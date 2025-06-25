import { useEffect, useState } from "react";

const useBreakpoint = (type: "max" | "min", value: number) => {
  const [matches, setMatches] = useState<boolean>(false);

  const mediaQuery =
    type === "max" ? `(max-width: ${value}px)` : `(min-width: ${value}px)`;

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);

    const updateMatches = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set the initial state
    setMatches(mediaQueryList.matches);

    // Add listener for changes
    mediaQueryList.addEventListener("change", updateMatches);

    // Cleanup listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", updateMatches);
    };
  }, [mediaQuery]);

  return matches;
};

export default useBreakpoint;
