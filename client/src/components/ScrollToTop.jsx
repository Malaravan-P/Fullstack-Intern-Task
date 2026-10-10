import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scrolls to the top on navigation. Preserves the scroll position when the
// user uses browser Back/Forward (POP) so the page history feels natural.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}