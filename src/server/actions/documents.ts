"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import { storagePutBytes, storageDelete } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

/** Upload a document (FormData): file, typeId, employeeId, optional expiryDate. */
export async function uploadDocument(formData: FormData): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) return { ok: false, error: "الجلسة منتهية" };

    const file = formData.get("file") as File | null;
    const typeId = String(formData.get("typeId") ?? "");
    const employeeId = String(formData.get("employeeId") ?? "");
    const expiryRaw = String(formData.get("expiryDate") ?? "");

    if (!file || !file.size) return { ok: false, error: "اختر ملفاً" };
    if (file.size > MAX_SIZE) return { ok: false, error: "حجم الملف أكبر من 15MB" };
    if (!ALLOWED.includes(file.type)) return { ok: false, error: "الملفات المسموحة: PDF أو صورة JPG/PNG" };
    if (!typeId || !employeeId) return { ok: false, error: "بيانات ناقصة" };

    // HR can upload for anyone; an employee may only upload to their own file.
    if (s.role !== "HR_ADMIN" && s.employeeId !== employeeId) {
      return { ok: false, error: "غير مسموح" };
    }

    const docType = await db.documentType.findUnique({ where: { id: typeId } });
    if (!docType || !docType.enabled) return { ok: false, error: "نوع وثيقة غير صالح" };

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
    const fileKey = `docs/employees/${employeeId}/${docType.key}-${Date.now()}.${ext}`;
    await storagePutBytes(fileKey, bytes);

    const doc = await db.document.create({
      data: {
        typeId,
        employeeId,
        fileKey,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        expiryDate: docType.hasExpiry && expiryRaw ? new Date(expiryRaw) : null,
        uploadedById: s.id,
      },
    });

    await writeAudit({
      entityName: "Document",
      entityId: doc.id,
      action: "CREATE",
      newData: { fileName: doc.fileName, size: doc.size },
      changedBy: s.name,
    });

    revalidatePath("/", "layout");
    return { ok: true, id: doc.id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) return { ok: false, error: "الجلسة منتهية" };
    const doc = await db.document.findUnique({ where: { id } });
    if (!doc) return { ok: false, error: "الوثيقة غير موجودة" };
    if (s.role !== "HR_ADMIN" && s.employeeId !== doc.employeeId) return { ok: false, error: "غير مسموح" };

    await db.document.delete({ where: { id } });
    await storageDelete(doc.fileKey).catch(() => {});

    await writeAudit({
      entityName: "Document",
      entityId: id,
      action: "DELETE",
      oldData: { fileName: doc.fileName, size: doc.size },
      changedBy: s.name,
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
