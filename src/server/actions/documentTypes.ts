"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const documentTypeSchema = z.object({
  key: z.string().min(2, "أدخل مفتاح النوع (بالإنجليزية، بدون مسافات)"),
  labelAr: z.string().min(2, "أدخل اسم نوع الوثيقة"),
  hasExpiry: z.boolean().default(true),
  required: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export async function createDocumentType(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = documentTypeSchema.parse(input);
    const dt = await db.documentType.create({ data: { ...data, key: data.key.trim() } });
    await writeAudit({ entityName: "DocumentType", entityId: dt.id, action: "CREATE", newData: dt, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: dt.id };
  } catch (e) {
    return failure(e, { P2002: "يوجد نوع وثيقة بنفس المفتاح" });
  }
}

export async function updateDocumentType(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = documentTypeSchema.partial().parse(input);
    const old = await db.documentType.findUnique({ where: { id } });
    const updated = await db.documentType.update({ where: { id }, data });
    await writeAudit({ entityName: "DocumentType", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteDocumentType(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const count = await db.document.count({ where: { typeId: id } });
    if (count > 0) return { ok: false, error: "لا يمكن حذف نوع وثيقة له ملفات مرفوعة — عطّله بدلاً من ذلك" };
    const old = await db.documentType.findUnique({ where: { id } });
    await db.documentType.delete({ where: { id } });
    await writeAudit({ entityName: "DocumentType", entityId: id, action: "DELETE", oldData: old, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
