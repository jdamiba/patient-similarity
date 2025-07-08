import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = "patients";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });

// Helper: Get embedding for free text using OpenAI
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Helper: Get embedding for a patient by ID from Qdrant
async function getPatientEmbedding(patientId) {
  const points = await qdrant.retrieve(QDRANT_COLLECTION, {
    ids: [patientId],
    with_vector: true,
    with_payload: false,
  });
  if (points.length === 0) throw new Error("Patient not found");
  return points[0].vector;
}

export async function POST(req) {
  try {
    const body = await req.json();
    let embedding;
    if (body.patientId) {
      // Find embedding for existing patient
      embedding = await getPatientEmbedding(body.patientId);
    } else if (body.freeText) {
      // Generate embedding for free text
      embedding = await getEmbedding(body.freeText);
    } else {
      return new Response(
        JSON.stringify({ error: "Missing patientId or freeText" }),
        { status: 400 }
      );
    }

    // Query Qdrant for similar patients
    const searchResult = await qdrant.search(QDRANT_COLLECTION, {
      vector: embedding,
      limit: 10,
      with_payload: true,
    });

    return new Response(JSON.stringify({ results: searchResult }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    // Qdrant scroll API: get first 40 points with payload
    const scrollResult = await qdrant.scroll(QDRANT_COLLECTION, {
      limit: 40,
      with_payload: true,
      with_vector: false,
    });
    // Map to id, name, file
    const patients = (scrollResult.points || []).map((pt) => ({
      id: pt.id,
      name: pt.payload?.name || "Unknown Name",
      file: pt.payload?.file || null,
    }));
    return new Response(JSON.stringify({ patients }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
