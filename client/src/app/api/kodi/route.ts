import { getKodiClient } from "@/lib/players/kodi";

export async function POST(req: Request) {
  if (process.env.KODI_HOST) {
    const client = await getKodiClient(process.env.KODI_HOST);
    const params = await req.json();
    const response = await client.request(params.method, params.params);
    console.log(response);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: "Kodi is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const maxDuration = 5000;
