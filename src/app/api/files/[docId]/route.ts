import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { storageGetBytes } from "@/lib/storage";
import { canAccessEmployeeFiles, contentDisposition } from "@/server/fileAccess";

export async function GET(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;

  const doc = await db.document.findUnique({ where: { id: docId } });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });

  const allowed = await canAccessEmployeeFiles(doc.employeeId);
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const bytes = await storageGetBytes(doc.fileKey);
  const download = req.nextUrl.searchParams.get("dl") === "1";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Disposition": contentDisposition(doc.fileName, !download),
      "Cache-Control": "private, max-age=0",
    },
  });
}
