import "server-only";
import { db } from "@/lib/db";

/** In-app notification outbox — no WhatsApp/email in v1, just a bell dropdown. */
export async function notify(params: {
  staffUserId: string;
  title: string;
  body: string;
  relatedType?: string;
  relatedId?: string;
}): Promise<void> {
  await db.notification.create({
    data: {
      staffUserId: params.staffUserId,
      title: params.title,
      body: params.body,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
    },
  });
}
