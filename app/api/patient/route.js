export async function GET(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const file = url.searchParams.get("file");
  if (!file) {
    return new Response(JSON.stringify({ error: "Missing file parameter" }), {
      status: 400,
    });
  }
  try {
    const gcsUrl = `https://storage.googleapis.com/general-medicine/${file}`;

    const res = await fetch(gcsUrl);
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch file from GCS: ${res.statusText}`,
        }),
        {
          status: res.status,
        }
      );
    }
    const bundle = await res.json();
    return new Response(JSON.stringify({ bundle }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
