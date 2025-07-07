import fs from "fs/promises";
import path, { dirname } from "path";
import { QdrantClient } from "@qdrant/js-client-rest";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// --- CONFIG ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const FHIR_DIR = path.join(__dirname, "../fhir");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set this in your environment
const QDRANT_URL =
  process.env.QDRANT_URL || "https://YOUR-CLUSTER-URL.qdrant.cloud"; // Set this in your environment
const QDRANT_API_KEY = process.env.QDRANT_API_KEY; // Set this in your environment
const QDRANT_COLLECTION = "patients";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Helper: Serialize FHIR patient history to text ---
function serializePatientHistory(resources) {
  // Simple serialization: concatenate key info from each resource
  return resources
    .map((res) => {
      if (res.resourceType === "Patient") {
        return `Patient: ${res.name?.[0]?.given?.join(" ")} ${
          res.name?.[0]?.family
        }, Gender: ${res.gender}, DOB: ${res.birthDate}`;
      }
      if (res.resourceType === "Condition") {
        return `Condition: ${
          res.code?.text || res.code?.coding?.[0]?.display
        }, Onset: ${res.onsetDateTime || ""}`;
      }
      if (res.resourceType === "MedicationStatement") {
        return `Medication: ${
          res.medicationCodeableConcept?.text ||
          res.medicationCodeableConcept?.coding?.[0]?.display
        }`;
      }
      if (res.resourceType === "AllergyIntolerance") {
        return `Allergy: ${res.code?.text || res.code?.coding?.[0]?.display}`;
      }
      if (res.resourceType === "Procedure") {
        return `Procedure: ${
          res.code?.text || res.code?.coding?.[0]?.display
        }, Date: ${res.performedDateTime || ""}`;
      }
      if (res.resourceType === "Immunization") {
        return `Immunization: ${
          res.vaccineCode?.text || res.vaccineCode?.coding?.[0]?.display
        }, Date: ${res.occurrenceDateTime || ""}`;
      }
      if (res.resourceType === "Observation") {
        return `Observation: ${
          res.code?.text || res.code?.coding?.[0]?.display
        }, Value: ${res.valueQuantity?.value || ""} ${
          res.valueQuantity?.unit || ""
        }`;
      }
      return "";
    })
    .join("\n");
}

// --- Helper: Get embedding from OpenAI API ---
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// --- Main ---
(async () => {
  // 1. Read all FHIR files
  const files = await fs.readdir(FHIR_DIR);
  const patientBundles = files.filter((f) => f.endsWith(".json"));

  // Remove the test limit: process all patient files
  const allBundles = patientBundles;

  // 2. Connect to Qdrant Cloud
  // Make sure to set QDRANT_API_KEY and QDRANT_URL in your environment
  const qdrant = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
  });
  // Ensure collection exists
  await qdrant
    .createCollection(QDRANT_COLLECTION, {
      vectors: { size: 1536, distance: "Cosine" }, // text-embedding-ada-002 is 1536-dim
    })
    .catch((e) => {
      if (!e.message.includes("already exists")) throw e;
    });

  for (const file of allBundles) {
    const filePath = path.join(FHIR_DIR, file);
    const content = await fs.readFile(filePath, "utf-8");
    const bundle = JSON.parse(content);
    // FHIR bundles: entry[].resource
    const resources = bundle.entry
      ? bundle.entry.map((e) => e.resource)
      : [bundle];
    const patient = resources.find((r) => r.resourceType === "Patient");
    if (!patient) continue;
    const patientId = patient.id || path.basename(file, ".json");
    const text = serializePatientHistory(resources);
    try {
      const embedding = await getEmbedding(text);
      // Upsert to Qdrant
      await qdrant.upsert(QDRANT_COLLECTION, {
        points: [
          {
            id: patientId,
            vector: embedding,
            payload: { patientId, name: patient.name?.[0]?.family || "", file },
          },
        ],
      });
      console.log(`Embedded and upserted patient ${patientId}`);
    } catch (err) {
      console.error(`Failed for ${file}:`, err.message);
    }
  }

  console.log("Done!");
})();
