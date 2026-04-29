import "@/style/global.css";

import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import ContentWrapper from "@/components/layout/containers/content-wrapper";
import Header from "@/components/layout/containers/header";
import Main from "@/components/layout/containers/main";
import ThemeConfiguration from "@/components/layout/containers/theme-configuration";
import LeftMenu from "@/components/layout/menu/left-menu";
import MenuBackdrop from "@/components/layout/menu/menu-backdrop";
import { useLayoutContext } from "@/components/layout/layout-context";
import Loading from "@/pages/loading";

export default function AppLayout() {
  const { pathname, search } = useLocation();
  const { validatePermission } = useLayoutContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
    const userId = localStorage.getItem(`${storagePrefix}:userId`);
    if (!userId) {
      window.location.href = "/admin/sign-in";
    }
  }, [pathname, search]);

  useEffect(() => {
    const allowed = validatePermission(pathname);
    console.log(`[Permission Check] Path: ${pathname}, Allowed: ${allowed}`);
    if (!allowed && pathname !== "/dashboard") {
      window.location.href = "/dashboard";
      // console.warn("Should redirect to dashboard");
    }
  }, [pathname, validatePermission]);

  return (
    <>
      <Header />
      <LeftMenu />
      <Main>
        <ContentWrapper>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ContentWrapper>
      </Main>
      <ThemeConfiguration />
      <MenuBackdrop />
    </>
  );
}
