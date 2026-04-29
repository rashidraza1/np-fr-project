import UserLanguageSwitch from "./user-language-switch";
import UserModeSwitch from "./user-mode-switch";
import UserThemeSwitch from "./user-theme-switch";
import { SyntheticEvent, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Fade,
  ListItemIcon,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popper from "@mui/material/Popper";

import NiSettings from "@/icons/nexture/ni-settings";
import NiUser from "@/icons/nexture/ni-user";
import { cn } from "@/lib/utils";

export default function User() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
      const userId = localStorage.getItem(`${storagePrefix}:userId`);
      const baseUrl = import.meta.env.VITE_BASE_URL;

      if (!userId) return;

      try {
        const queryParams = new URLSearchParams({
          class: "general",
          action: "RSIGeneralSystemUsers",
          WebServiceUserName: "WebserviceUser",
          Password: "oqkq12345234",
        });

        const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            TableID: userId,
          }),
        });

        const data = await response.json();

        if (data.status === "SUCCESS" && data.data?.RecordListing && data.data.RecordListing.length > 0) {
          const user = data.data.RecordListing[0];
          setUserData({
            fullName: user.FullNameEnglish || user.FullNameArabic || "User",
            email: user.Email || "",
            profileImage: user.ProfileImage || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data for header:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleSignOut = () => {
    const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
    localStorage.removeItem(`${storagePrefix}:userId`);
    navigate("/admin/sign-in");
  };

  const navigate = useNavigate();

  return (
    <>
      <Box ref={anchorRef}>
        {/* Desktop button */}
        <Button
          variant="text"
          color="text-primary"
          className={cn(
            "group hover:bg-grey-25 ms-2 hidden gap-2 rounded-lg py-0! pe-0! hover:py-1! hover:pe-1.5! md:flex",
            open && "active bg-grey-25 py-1! pe-1.5!",
          )}
          onClick={handleToggle}
        >
          <Box>{userData.fullName || "User"}</Box>
          <Avatar
            alt={userData.fullName || "User"}
            src={userData.profileImage || "/images/avatars/avatar-default.jpg"}
            className={cn(
              "large transition-all group-hover:ms-0.5 group-hover:h-8 group-hover:w-8",
              open && "ms-0.5 h-8! w-8!",
            )}
          />
        </Button>
        {/* Desktop button */}

        {/* Mobile button */}
        <Button
          variant="text"
          size="large"
          color="text-primary"
          className={cn(
            "icon-only hover:bg-grey-25 hover-icon-shrink [&.active]:text-primary group ms-1 me-1 p-0! hover:p-1.5! md:hidden",
            open && "active bg-grey-25 p-1.5!",
          )}
          onClick={handleToggle}
          startIcon={
            <Avatar
              alt={userData.fullName || "User"}
              src={userData.profileImage || "/images/avatars/avatar-default.jpg"}
              className={cn("large transition-all group-hover:h-7 group-hover:w-7", open && "h-7! w-7!")}
            />
          }
        />
        {/* Mobile button */}
      </Box>

      <Popper
        open={open}
        anchorEl={() => anchorRef.current!}
        role={undefined}
        placement="bottom-end"
        className="mt-3!"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Box>
              <ClickAwayListener onClickAway={handleClose}>
                <Card className="shadow-darker-sm!">
                  <CardContent>
                    <Box className="max-w-64 sm:w-72 sm:max-w-none">
                      <Box className="mb-4 flex flex-col items-center">
                        <Avatar alt={userData.fullName || "User"} src={userData.profileImage || "/images/avatars/avatar-default.jpg"} className="large mb-2" />
                        <Typography variant="subtitle1" component="p">
                          {userData.fullName || "User"}
                        </Typography>
                        <Typography variant="body2" component="p" className="text-text-secondary -mt-2">
                          {userData.email}
                        </Typography>
                      </Box>

                      {/* <Box>
                        <Accordion>
                          <AccordionSummary className="group">
                           ...
                          </AccordionSummary>
                          <AccordionDetails className="bg-grey-500/10 rounded-b-lg px-4 pt-2 pb-4">
                           ...
                          </AccordionDetails>
                        </Accordion>
                      </Box> */}
                      <Divider className="large" />
                      <MenuList className="p-0">
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/dashboard");
                          }}
                        >
                          <ListItemIcon>
                            <NiUser size={20} />
                          </ListItemIcon>
                          {t("Dashboard")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/configuration/my-profile");
                          }}
                        >
                          <ListItemIcon>
                            <NiSettings size={20} />
                          </ListItemIcon>
                          {t("user-profile")}
                        </MenuItem>
                        {/* <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/pages/support/issues");
                          }}
                        >
                          <ListItemIcon>
                            <NiBuilding size={20} />
                          </ListItemIcon>
                          {t("user-issues")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/pages/user/projects");
                          }}
                        >
                          <ListItemIcon>
                            <NiFolder size={20} />
                          </ListItemIcon>
                          {t("user-projects")}
                        </MenuItem> */}
                        <Divider className="large" />

                        <UserModeSwitch />
                        <UserThemeSwitch />
                        <UserLanguageSwitch />

                        <Divider className="large" />
                        {/* <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/docs");
                          }}
                        >
                          <ListItemIcon>
                            <NiDocumentFull size={20} />
                          </ListItemIcon>
                          {t("user-documentation")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            navigate("/pages/miscellaneous/knowledge-base");
                          }}
                        >
                          <ListItemIcon>
                            <NiQuestionHexagon size={20} />
                          </ListItemIcon>
                          {t("user-help")}
                        </MenuItem> */}
                      </MenuList>
                      <Box className="my-8"></Box>
                      <Button
                        onClick={handleSignOut}
                        variant="outlined"
                        size="tiny"
                        color="grey"
                        className="w-full"
                      >
                        {t("user-sign-out")}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}
