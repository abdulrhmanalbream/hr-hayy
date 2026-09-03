"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { failure, type ActionResult } from "./util";

const setSchema = z.object({ key: z.string().min(1), value: z.string() });

export async function setSetting(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = setSchema.parse(input);
    await db.setting.upsert({ where: { key: data.key }, create: data, update: { value: data.value } });
    void me;
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
