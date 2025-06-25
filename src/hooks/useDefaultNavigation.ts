import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useDefaultNavigation = (sections: { link: string }[]) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPathExists = sections.some(section => section.link === location.pathname);
    
    if (!currentPathExists && sections.length > 0) {
      navigate(sections[0].link);
    }
  }, [location.pathname, navigate, sections]);
};

export default useDefaultNavigation;
