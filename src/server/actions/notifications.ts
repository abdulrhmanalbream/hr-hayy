"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import { failure, type ActionResult } from "./util";

export async function listMyNotifications() {
  const s = await getStaffSession();
  if (!s) return { items: [], unreadCount: 0 };
  const items = await db.notification.findMany({
    where: { staffUserId: s.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const unreadCount = await db.notification.count({ where: { staffUserId: s.id, isRead: false } });
  return { items, unreadCount };
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    await db.notification.updateMany({ where: { id, staffUserId: s.id }, data: { isRead: true } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    await db.notification.updateMany({ where: { staffUserId: s.id, isRead: false }, data: { isRead: true } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
