import "server-only";
import { db } from "@/lib/db";

/** Records a create/update/delete on a tracked entity for the audit log page. */
export async function writeAudit(params: {
  entityName: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldData?: unknown;
  newData?: unknown;
  changedBy: string;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      entityName: params.entityName,
      entityId: params.entityId,
      action: params.action,
      oldData: params.oldData !== undefined ? JSON.stringify(params.oldData) : null,
      newData: params.newData !== undefined ? JSON.stringify(params.newData) : null,
      changedBy: params.changedBy,
    },
  });
}
