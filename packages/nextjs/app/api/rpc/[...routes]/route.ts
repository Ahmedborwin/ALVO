import { NextResponse } from "next/server";
import { ALCHEMY_API_KEY, apiUrl } from "~~/constants";

export async function POST(req: Request, { params }: { params: { routes: string[] } }) {
  const apiKey = ALCHEMY_API_KEY;

  if (apiKey == null) {
    return NextResponse.json({ error: "ALCHEMY_API_KEY is not set" }, { status: 500 });
  }

  const body = await req.json();

  const res = await fetch(apiUrl + `/${params.routes.join("/")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok)
    return NextResponse.json(await res.json().catch(() => ({})), {
      status: res.status,
    });

  return NextResponse.json(await res.json());
}
