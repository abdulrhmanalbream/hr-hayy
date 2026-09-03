"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme as useNextTheme } from "next-themes";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import QuickActionButton, { type QuickActionArea } from "@/components/quick-actions/QuickActionButton";
import type { NavSection } from "./nav";

const DRAWER_WIDTH = 264;
const DRAWER_MINI_WIDTH = 72;
const TRANSITION_DURATION = 300;
const LS_KEY = "personnel_sidebar_collapsed";

type Props = {
  nav: NavSection[];
  userName: string;
  userRoleLabel: string;
  quickActionArea?: QuickActionArea;
  children: React.ReactNode;
};

export default function DashboardShell({ nav, userName, userRoleLabel, quickActionArea, children }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useNextTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const currentWidth = isDesktop && collapsed ? DRAWER_MINI_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          px: collapsed && isDesktop ? 1 : 2.5,
          py: 2.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: `padding ${TRANSITION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
        }}
      >
        <Box
          sx={{
            transition: `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
            transform: collapsed && isDesktop ? "scale(0.7)" : "scale(1)",
          }}
        >
          <Logo height={collapsed && isDesktop ? 28 : 40} />
        </Box>
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", pb: 2 }}>
        {nav.map((section) => (
          <List
            key={section.label}
            dense
            subheader={
              collapsed && isDesktop ? (
                <Divider sx={{ my: 1, mx: 1.5 }} />
              ) : (
                <ListSubheader
                  sx={{ bgcolor: "background.paper", fontWeight: 700, color: "text.secondary", zIndex: 1 }}
                >
                  {section.label}
                </ListSubheader>
              )
            }
          >
            {section.items.map((item) => {
              const active =
                pathname === item.url ||
                (item.url.split("/").length > 2 && pathname.startsWith(item.url + "/"));

              const button = (
                <ListItemButton
                  key={item.url}
                  component={Link}
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    mx: collapsed && isDesktop ? 0.75 : 1.5,
                    my: 0.25,
                    borderRadius: 2,
                    justifyContent: collapsed && isDesktop ? "center" : "flex-start",
                    px: collapsed && isDesktop ? 1.5 : 2,
                    minHeight: 42,
                    ...(active && {
                      bgcolor: "rgba(226,30,38,0.08)",
                      color: "primary.main",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                      "&:hover": { bgcolor: "rgba(226,30,38,0.12)" },
                    }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed && isDesktop ? 0 : 38, justifyContent: "center" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontWeight: active ? 700 : 500, noWrap: true }}
                    sx={{ opacity: collapsed && isDesktop ? 0 : 1, width: collapsed && isDesktop ? 0 : "auto", overflow: "hidden" }}
                  />
                </ListItemButton>
              );

              return collapsed && isDesktop ? (
                <Tooltip key={item.url} title={item.title} placement="left" arrow>
                  {button}
                </Tooltip>
              ) : (
                button
              );
            })}
          </List>
        ))}
      </Box>

      {isDesktop && (
        <>
          <Divider />
          <Box sx={{ p: 1, display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}>
            <Tooltip title={collapsed ? "توسيع القائمة" : "تصغير القائمة"} placement="left" arrow>
              <IconButton
                onClick={toggleCollapsed}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.main", color: "#fff" },
                }}
              >
                <ChevronRightRoundedIcon sx={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* anchor="left" + rtl stylis plugin = physically on the RIGHT */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        anchor="left"
        sx={{
          width: currentWidth,
          flexShrink: 0,
          transition: `width ${TRANSITION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
          "& .MuiDrawer-paper": { width: currentWidth, boxSizing: "border-box", overflowX: "hidden" },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 1 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
            )}
            {isDesktop && (
              <Tooltip title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}>
                <IconButton edge="start" onClick={toggleCollapsed} size="small">
                  <MenuRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Box sx={{ flex: 1 }} />
            {quickActionArea && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                <QuickActionButton area={quickActionArea} />
              </Box>
            )}
            <NotificationBell />
            {mounted && (
              <IconButton
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                size="small"
                aria-label="تبديل الوضع"
              >
                {resolvedTheme === "dark" ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            )}
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 15 }}>
                {userName.trim().charAt(0)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography fontWeight={700}>{userName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userRoleLabel}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                تسجيل الخروج
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
