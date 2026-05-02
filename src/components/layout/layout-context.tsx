import { createContext, type PropsWithChildren, useContext, useEffect, useState, useCallback } from "react";

import { DEFAULTS } from "@/config";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useMenu } from "@/hooks/use-menu";
import type { MenuItem } from "@/types/types";
import { MenuShowState } from "@/types/types";
import { leftMenuItems } from "@/menu-items";
import { isPathMatch } from "@/lib/utils";

type LayoutContextType = ReturnType<typeof useLayoutContextValue>;

const LayoutContext = createContext<LayoutContextType | null>(null);

function useLayoutContextValue() {
  const [mounted, setMounted] = useState(false);
  const [temporaryShowPrimaryMenu, setTemporaryShowPrimaryMenu] = useState(false);
  const [menuSelectedSecondaryItem, setMenuSelectedSecondaryItem] = useState<MenuItem | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(leftMenuItems);
  const [permissions, setPermissions] = useState<any[]>([]);

  const fetchMenuPermissions = useCallback(async () => {
    const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
    const userId = localStorage.getItem(`${storagePrefix}:userId`);

    if (!userId) return;

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const queryParams = new URLSearchParams({
        class: "general",
        action: "RSIModulesWithFeaturesByUser",
        WebServiceUserName: "WebserviceUser",
        Password: "oqkq12345234",
      });

      const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserID: userId,
        }),
      });

      const data = await response.json();
      let apiModules: any[] = [];

      if (data.status === "SUCCESS" && data.data?.RecordListing) {
        apiModules = data.data.RecordListing;
        setPermissions(apiModules);

        // Use map/spread for shallow clone of top level, deeper levels handled in filter
        // JSON.parse(JSON.stringify) might fail if there are React Nodes (content property)
        const masterMenu: MenuItem[] = [...leftMenuItems];

        const filteredItems = masterMenu.map(item => { return { ...item } }).filter((item) => {
          // Always keep Dashboard, Chat Bot and Survey
          if (item.id === "dashboard" || item.id === "chat-bot" || item.id === "survey") return true;

          // Find matching module in API
          const apiModule = apiModules.find((m: any) => m.ModuleTitleEnglish === item.label);

          if (apiModule) {
            // If module exists, filter its children
            if (item.children) {
              const visibleChildren = item.children.filter((child) => {
                if (child.hideInMenu) return true; // Keep hidden items locally, but permission might still be checked
                if (child.id === "staff" || child.id === "email-config" || child.id === "staff-action" || child.id === "partial-transaction" || child.id === "completed-transaction" || child.id === "transaction") return true; // Bypass permission check

                const apiFeature = apiModule.Features.find((f: any) => f.FeatureTitleEnglish === child.label);
                return apiFeature && apiFeature.ReadPermission === 1;
              });

              item.children = visibleChildren;
              return visibleChildren.length > 0;
            }
            return true;
          }

          return false;
        });

        setMenuItems(filteredItems);
      }
      return apiModules;
    } catch (error) {
      console.error("Failed to fetch menu permissions:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchMenuPermissions();
  }, [fetchMenuPermissions]);

  // Stabilize validatePermission with useCallback to prevent infinite effect loops
  const validatePermission = useCallback((path: string): boolean => {
    if (path === "/dashboard" || path === "/" || path === "/404" || path.startsWith("/chat-bot") || path.startsWith("/survey") || path.startsWith("/master-setups/staff") || path.startsWith("/master-setups/email-config") || path.startsWith("/master-setups/staff-action") || path.startsWith("/reports/partial-transaction") || path.startsWith("/reports/completed-transaction") || path.startsWith("/reports/transaction")) return true;

    // Helper to find item in a tree
    const findItem = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.href && isPathMatch(path, item.href)) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    // 1. Check if allowed (in filtered menuItems)
    const allowedItem = findItem(menuItems);
    if (allowedItem) return true;

    // 2. Check if it exists in the Master list
    // If it exists in Master but NOT in Allowed, it means it was filtered out -> Access Denied.
    const existsInMaster = findItem(leftMenuItems);
    if (existsInMaster) {
      // console.warn(`Access Denied: ${path} is in master menu but not in user permissions.`);
      return false;
    }

    // 3. If not in master listing (e.g., dynamic routes not in menu, or totally unknown), allow.
    // This prevents blocking valid routes that just aren't in the sidebar.
    return true;
  }, [menuItems]);

  const leftMenu = useMenu({
    primaryBreakpoint: "md",
    secondaryBreakpoint: "xl",
    storageKey: LOCAL_STORAGE_KEYS.leftMenuType,
    defaultMenuType: DEFAULTS.leftMenuType,
    menuDefaultWidth: DEFAULTS.leftMenuWidth,
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Return initial state during SSR
  if (!mounted) {
    return {
      // Left menu
      leftMenuType: DEFAULTS.leftMenuType,
      setLeftMenuType: () => { },
      resetLeftMenu: () => { },
      showLeftMobileButton: false,
      leftMenuWidth: DEFAULTS.leftMenuWidth[DEFAULTS.leftMenuType],
      leftPrimaryCurrent: MenuShowState.Hide,
      leftSecondaryCurrent: MenuShowState.Hide,
      hideLeft: () => { },
      showLeftSecondary: () => { },
      hideLeftSecondary: () => { },
      showLeftInMobile: () => { },
      onResetLeft: () => () => { },
      leftShowBackdrop: false,
      setLeftShowBackdrop: () => { },
      temporaryShowPrimaryMenu,
      setTemporaryShowPrimaryMenu,
      setMenuSelectedSecondaryItem: () => { },
      menuItems: leftMenuItems,
      permissions,
      validatePermission,
      fetchMenuPermissions: () => Promise.resolve([]),
      getFeaturePermissions: (featureName: string, permissionsList?: any[]) => {
        const list = permissionsList || permissions;
        for (const module of list) {
          const feature = module.Features?.find((f: any) => f.FeatureTitleEnglish === featureName);
          if (feature) return feature;
        }
        return null;
      }
    };
  }

  return {
    // Left menu
    leftMenuType: leftMenu.menuType,
    setLeftMenuType: leftMenu.setMenuType,
    resetLeftMenu: leftMenu.resetMenu,
    showLeftMobileButton: leftMenu.showMobileButton,
    leftMenuWidth: leftMenu.menuWidth,
    leftPrimaryCurrent: leftMenu.primaryCurrent,
    leftSecondaryCurrent: leftMenu.secondaryCurrent,
    hideLeft: leftMenu.hideMenu,
    showLeftSecondary: leftMenu.showSecondary,
    hideLeftSecondary: leftMenu.hideSecondary,
    showLeftInMobile: leftMenu.showInMobile,
    onResetLeft: leftMenu.onReset,
    leftShowBackdrop: leftMenu.showBackdrop,
    setLeftShowBackdrop: leftMenu.setShowBackdrop,
    temporaryShowPrimaryMenu,
    setTemporaryShowPrimaryMenu,
    menuSelectedSecondaryItem,
    setMenuSelectedSecondaryItem,
    menuItems,
    permissions,
    validatePermission,
    fetchMenuPermissions,
    getFeaturePermissions: (featureName: string, permissionsList?: any[]) => {
      const list = permissionsList || permissions;
      for (const module of list) {
        const feature = module.Features?.find((f: any) => f.FeatureTitleEnglish === featureName);
        if (feature) return feature;
      }
      return null;
    }
  };
}

export default function LayoutContextProvider({ children }: PropsWithChildren) {
  const value = useLayoutContextValue();
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
