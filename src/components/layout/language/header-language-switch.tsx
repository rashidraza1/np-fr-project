import { SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, Button, Fade, ListItemIcon, Menu, MenuItem, PopoverVirtualElement, Tooltip } from "@mui/material";

import { LocaleOption } from "@/constants";
import { setClientLocale } from "@/i18n/locale";
import NiWorld from "@/icons/nexture/ni-world";
import { cn } from "@/lib/utils";

export default function HeaderLanguageSwitch() {
    const [anchorElLang, setAnchorElLang] = useState<EventTarget | Element | PopoverVirtualElement | null>(null);
    const openLang = Boolean(anchorElLang);
    const handleClickLang = (event: Event | SyntheticEvent) => {
        setAnchorElLang(event.currentTarget);
    };
    const handleCloseLang = () => {
        setAnchorElLang(null);
    };

    const {
        t,
        i18n: { language: locale },
    } = useTranslation();

    const handleOnChangeLocale = (value: LocaleOption) => {
        setClientLocale(value);
    };

    return (
        <>
            <Tooltip title={t("user-language")}>
                <Button
                    onClick={handleClickLang}
                    className={cn(
                        "min-w-0 px-3 hover:bg-grey-25 [&.active]:text-primary",
                        openLang && "active bg-grey-25"
                    )}
                    size="large"
                    variant="text"
                    color="inherit"
                    startIcon={<NiWorld size="medium" />}
                >
                    <span className="font-semibold">{locale === "ar" ? "Ar" : "En"}</span>
                </Button>
            </Tooltip>
            <Menu
                anchorEl={anchorElLang as Element}
                disableScrollLock
                open={openLang}
                onClose={handleCloseLang}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                classes={{ paper: "mt-1 w-48" }}
                slots={{
                    transition: Fade,
                }}
            >
                <MenuItem
                    className={cn(locale === "en" && "active")}
                    onClick={() => {
                        handleCloseLang();
                        handleOnChangeLocale("en");
                    }}
                >
                    <ListItemIcon>
                        <Avatar className="nano" alt="English" src="/images/flags/en.jpg" />
                    </ListItemIcon>
                    {t("en")}
                </MenuItem>
                <MenuItem
                    className={cn(locale === "ar" && "active")}
                    onClick={() => {
                        handleCloseLang();
                        handleOnChangeLocale("ar");
                    }}
                >
                    <ListItemIcon>
                        <Avatar className="nano" alt="Arabic" src="/images/flags/ar.jpg" />
                    </ListItemIcon>
                    {t("ar")}
                </MenuItem>
            </Menu>
        </>
    );
}
