import { NextRequest } from "next/server";

import { handleJudgePost } from "@/lib/judge-api-handler";

export const dynamic = "force-dynamic";

/** Alias: POST /api/verify — same AI auditor + on-chain settlement as /api/judge */
export async function POST(req: NextRequest) {
  return handleJudgePost(req);
}
