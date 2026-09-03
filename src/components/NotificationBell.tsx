"use client";
import { useEffect, useState, useTransition } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { fmtDateTime } from "@/lib/format";
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/actions/notifications";

type NotificationItem = Awaited<ReturnType<typeof listMyNotifications>>["items"][number];

export default function NotificationBell() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [, startTransition] = useTransition();

  const load = async () => {
    const res = await listMyNotifications();
    setItems(res.items);
    setUnreadCount(res.unreadCount);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
    load();
  };

  return (
    <>
      <IconButton onClick={open} size="small" aria-label="الإشعارات">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsRoundedIcon fontSize="small" />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} PaperProps={{ sx: { width: 340, maxHeight: 420 } }}>
        <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>الإشعارات</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() =>
                startTransition(async () => {
                  await markAllNotificationsRead();
                  load();
                })
              }
            >
              تعليم الكل كمقروء
            </Button>
          )}
        </Box>
        <Divider />
        {items.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد إشعارات
            </Typography>
          </Box>
        )}
        {items.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() =>
              startTransition(async () => {
                if (!n.isRead) await markNotificationRead(n.id);
                load();
              })
            }
            sx={{ whiteSpace: "normal", alignItems: "flex-start", bgcolor: n.isRead ? "transparent" : "action.hover" }}
          >
            <Box>
              <Typography variant="body2" fontWeight={n.isRead ? 400 : 700}>
                {n.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {n.body}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtDateTime(n.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
