import { MenuItem } from "@/types/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    icon: "NiDashboard",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "administration",
    icon: "NiShield",
    label: "Administration",
    href: "#",
    children: [
      {
        id: "roles",
        label: "Roles",
        href: "/administration/roles",
      },
      {
        id: "create-role",
        label: "Create Role",
        href: "/administration/roles/create",
        hideInMenu: true,
      },
      {
        id: "edit-role",
        label: "Edit Role",
        href: "/administration/roles/edit/:id",
        hideInMenu: true,
      },
      {
        id: "permissions-role",
        label: "Role Permissions",
        href: "/administration/roles/permissions/:id",
        hideInMenu: true,
      },
      {
        id: "system-users",
        label: "System Users",
        href: "/administration/system-users",
      },
      {
        id: "create-system-user",
        label: "Create System User",
        href: "/administration/system-users/create",
        hideInMenu: true,
      },
      {
        id: "edit-system-user",
        label: "Edit System User",
        href: "/administration/system-users/edit/:id",
        hideInMenu: true,
      },
      {
        id: "permissions-system-user",
        label: "System User Permissions",
        href: "/administration/system-users/permissions/:id",
        hideInMenu: true,
      },
      // {
      //   id: "products",
      //   label: "Products",
      //   href: "/administration/products",
      // },
      {
        id: "create-product",
        label: "Create Product",
        href: "/administration/products/create",
        hideInMenu: true,
      },
      {
        id: "edit-product",
        label: "Edit Product",
        href: "/administration/products/edit/:id",
        hideInMenu: true,
      },
    ],
  },
  {
    id: "master-setups",
    icon: "NiCatalog",
    label: "Master Setups",
    href: "#",
    children: [
      {
        id: "branches",
        icon: "NiBuilding",
        label: "Branches",
        href: "/master-setups/branches",
      },
      {
        id: "create-branch",
        label: "Create Branch",
        href: "/master-setups/branches/create",
        hideInMenu: true,
      },
      {
        id: "edit-branch",
        label: "Edit Branch",
        href: "/master-setups/branches/edit/:id",
        hideInMenu: true,
      },

      {
        id: "departments",
        icon: "NiStructure",
        label: "Departments",
        href: "/master-setups/departments",
      },
      {
        id: "create-department",
        label: "Create Department",
        href: "/master-setups/departments/create",
        hideInMenu: true,
      },
      {
        id: "edit-department",
        label: "Edit Department",
        href: "/master-setups/departments/edit/:id",
        hideInMenu: true,
      },
      {
        id: "projects",
        icon: "NiBuilding",
        label: "Projects",
        href: "/master-setups/projects",
      },
      {
        id: "create-project",
        label: "Create Project",
        href: "/master-setups/projects/create",
        hideInMenu: true,
      },
      {
        id: "edit-project",
        label: "Edit Project",
        href: "/master-setups/projects/edit/:id",
        hideInMenu: true,
      },
      {
        id: "Kiosk",
        icon: "NiBuilding",
        label: "Kiosk",
        href: "/master-setups/kiosks",
      },
      {
        id: "create-kiosk",
        label: "Create Kiosk",
        href: "/master-setups/kiosks/create",
        hideInMenu: true,
      },
      {
        id: "edit-kiosk",
        label: "Edit Kiosk",
        href: "/master-setups/kiosks/edit/:id",
        hideInMenu: true,
      },
      {
        id: "staff",
        icon: "NiBuilding",
        label: "Staff",
        href: "/master-setups/staff",
      },
      {
        id: "create-staff",
        label: "Create Staff",
        href: "/master-setups/staff/create",
        hideInMenu: true,
      },
      {
        id: "edit-staff",
        label: "Edit Staff",
        href: "/master-setups/staff/edit/:id",
        hideInMenu: true,
      },
      {
        id: "email-config",
        icon: "NiBuilding",
        label: "Email Config",
        href: "/master-setups/email-config",
      },
      {
        id: "staff-action",
        icon: "NiBuilding",
        label: "Staff Action",
        href: "/master-setups/staff-action",
      },
    ],
  },

  // {
  //   id: "chat-bot",
  //   icon: "NiAI",
  //   label: "Chat Bot",
  //   href: "#",
  //   children: [
  //     {
  //       id: "inbox",
  //       icon: "NiInbox",
  //       label: "Inbox",
  //       href: "/chat-bot/inbox",
  //     },
  //     {
  //       id: "bot",
  //       icon: "NiMessage",
  //       label: "Chat Bot",
  //       href: "/chat-bot/bot",
  //     },
  //     {
  //       id: "create-bot",
  //       label: "Create Bot",
  //       href: "/chat-bot/bot/new",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "edit-bot",
  //       label: "Edit Bot",
  //       href: "/chat-bot/bot/edit/:id",
  //       hideInMenu: true,
  //     },
  //   ],
  // },
  {
    id: "my-account",
    icon: "NiSettings",
    label: "My Account",
    href: "#",
    children: [
      {
        id: "my-account",
        label: "My Account",
        href: "/configuration/my-account",
      },
      {
        id: "change-password",
        label: "Change Password",
        href: "/configuration/change-password",
      },
      {
        id: "my-profile",
        label: "My Profile",
        href: "/configuration/my-profile",
      },
    ],
  },

  // {
  //   id: "survey",
  //   icon: "NiChartPie",
  //   label: "Survey",
  //   href: "#",
  //   children: [
  //     {
  //       id: "survey-list",
  //       label: "Surveys",
  //       href: "/survey",
  //     },
  //     {
  //       id: "create-survey",
  //       label: "Create Survey",
  //       href: "/survey/create",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "edit-survey",
  //       label: "Edit Survey",
  //       href: "/survey/edit/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-archive",
  //       label: "Archive",
  //       href: "/survey/archive",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "view-survey",
  //       label: "View Survey",
  //       href: "/survey/view/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-analytics",
  //       label: "Survey Analytics",
  //       href: "/survey/analytics/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-themes",
  //       icon: "NiPalette",
  //       label: "Themes",
  //       href: "/survey/themes",
  //     },
  //     {
  //       id: "create-survey-theme",
  //       label: "Create Theme",
  //       href: "/survey/themes/create",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "edit-survey-theme",
  //       label: "Edit Theme",
  //       href: "/survey/themes/edit/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-responses",
  //       label: "Survey Responses",
  //       href: "/survey/responses/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-response-view",
  //       label: "Response Detail",
  //       href: "/survey/responses/view/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-publish",
  //       label: "Publish Survey",
  //       href: "/survey/publish/:id",
  //       hideInMenu: true,
  //     },
  //     {
  //       id: "survey-test",
  //       label: "Test Survey",
  //       href: "/survey/test/:id",
  //       hideInMenu: true,
  //     },
  //     // {
  //     //   id: "survey-submit",
  //     //   label: "Survey Submission",
  //     //   href: "/survey/submit/:deviceId",
  //     //   hideInMenu: true,
  //     // },
  //   ],
  // },

  {
    id: "reports",
    icon: "NiDocumentChart",
    label: "Payment Transaction",
    href: "#",
    children: [

      {
        id: "transaction",
        icon: "NiMoney",
        label: "Transaction List",
        href: "/reports/transaction",
      },

    ],
  },

];

export const leftMenuBottomItems: MenuItem[] = [];
