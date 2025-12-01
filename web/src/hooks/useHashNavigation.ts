import { useEffect } from "react";

export default function useHashNavigation(
  currentPage: string,
  setCurrentPage: (page: string) => void,
  defaultPage: string = "features"
) {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage(defaultPage);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setCurrentPage, defaultPage]);
}
