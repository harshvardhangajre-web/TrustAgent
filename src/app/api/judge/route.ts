import { NextRequest } from "next/server";

import { handleJudgePost } from "@/lib/judge-api-handler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleJudgePost(req);
}
