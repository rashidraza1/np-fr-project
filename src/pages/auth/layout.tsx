import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Loading from "@/pages/loading";

export default function AuthLayout() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
    const userId = localStorage.getItem(`${storagePrefix}:userId`);
    if (userId) {
      window.location.href = "/dashboard";
    }
  }, [pathname, search]);

  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
}
