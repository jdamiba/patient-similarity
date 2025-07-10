import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = "patients";

const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });

export async function GET() {
  try {
    // Qdrant scroll API: get first 100 points with payload
    const scrollResult = await qdrant.scroll(QDRANT_COLLECTION, {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });
    // Map to id, name, file
    const patients = (scrollResult.points || []).map((pt) => {
      const file = pt.payload?.file;
      return {
        id: pt.id,
        name: pt.payload?.name || "Unknown Name",
        file,
      };
    });
    return new Response(JSON.stringify(patients), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
