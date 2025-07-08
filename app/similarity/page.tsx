"use client";
import React, { useState, useEffect } from "react";
import type {
  Patient,
  Condition,
  MedicationStatement,
  AllergyIntolerance,
  Procedure,
  Immunization,
  Observation,
  Bundle,
  BundleEntry,
} from "fhir/r4";

type Extension = {
  url: string;
  valueString?: string;
  valueCode?: string;
  extension?: Extension[];
};

// Define the type for a Qdrant search result
interface QdrantResult {
  id: string;
  score?: number;
  payload?: {
    name?: string;
    file?: string;
    [key: string]: unknown;
  };
}

interface PatientDetailModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string | null;
  file?: string;
}

function PatientDetailModal({
  open,
  onClose,
  patientId,
  file,
}: PatientDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [bundle, setBundle] = useState<Bundle | null>(null);

  React.useEffect(() => {
    if (!open || !patientId || !file) return;
    setLoading(true);
    setError("");
    setBundle(null);
    fetch(
      `/api/patient?id=${encodeURIComponent(
        patientId
      )}&file=${encodeURIComponent(file)}`
    )
      .then((res) => res.json() as Promise<{ error?: string; bundle?: Bundle }>)
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (data.bundle) setBundle(data.bundle);
        else setBundle(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      })
      .finally(() => setLoading(false));
  }, [open, patientId, file]);

  // Helper to extract info from FHIR bundle
  function renderDetails() {
    if (!bundle) return null;
    const patient = bundle.entry?.find(
      (e: BundleEntry) => e.resource?.resourceType === "Patient"
    )?.resource as Patient | undefined;
    const conditions =
      bundle.entry
        ?.filter((e: BundleEntry) => e.resource?.resourceType === "Condition")
        .map((e: BundleEntry) => e.resource as Condition) || [];
    const medications =
      bundle.entry
        ?.filter(
          (e: BundleEntry) => e.resource?.resourceType === "MedicationStatement"
        )
        .map((e: BundleEntry) => e.resource as MedicationStatement) || [];
    const allergies =
      bundle.entry
        ?.filter(
          (e: BundleEntry) => e.resource?.resourceType === "AllergyIntolerance"
        )
        .map((e: BundleEntry) => e.resource as AllergyIntolerance) || [];
    const procedures =
      bundle.entry
        ?.filter((e: BundleEntry) => e.resource?.resourceType === "Procedure")
        .map((e: BundleEntry) => e.resource as Procedure) || [];
    const immunizations =
      bundle.entry
        ?.filter(
          (e: BundleEntry) => e.resource?.resourceType === "Immunization"
        )
        .map((e: BundleEntry) => e.resource as Immunization) || [];
    const observations =
      bundle.entry
        ?.filter((e: BundleEntry) => e.resource?.resourceType === "Observation")
        .map((e: BundleEntry) => e.resource as Observation) || [];

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Demographics
          </h3>
          <div className="text-gray-700">
            <div>
              <span className="font-medium">Name:</span>{" "}
              {patient?.name?.[0]?.given
                ?.map((g) => g.replace(/\d+$/, ""))
                .join(" ")}{" "}
              {patient?.name?.[0]?.family?.replace(/\d+$/, "")}
            </div>
            <div>
              <span className="font-medium">Gender:</span> {patient?.gender}
            </div>
            <div>
              <span className="font-medium">Birth Date:</span>{" "}
              {patient?.birthDate}
            </div>
            <div>
              <span className="font-medium">Race:</span>{" "}
              {
                (patient?.extension as Extension[] | undefined)
                  ?.find((ext) => ext.url?.includes("us-core-race"))
                  ?.extension?.find((e) => e.url === "text")?.valueString
              }
            </div>
            <div>
              <span className="font-medium">Ethnicity:</span>{" "}
              {
                (patient?.extension as Extension[] | undefined)
                  ?.find((ext) => ext.url?.includes("us-core-ethnicity"))
                  ?.extension?.find((e) => e.url === "text")?.valueString
              }
            </div>
            <div>
              <span className="font-medium">Birth Sex:</span>{" "}
              {
                (patient?.extension as Extension[] | undefined)?.find((ext) =>
                  ext.url?.includes("us-core-birthsex")
                )?.valueCode
              }
            </div>
            <div>
              <span className="font-medium">Mother&apos;s Maiden Name:</span>{" "}
              {
                (patient?.extension as Extension[] | undefined)?.find((ext) =>
                  ext.url?.includes("mothersMaidenName")
                )?.valueString
              }
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Medical Conditions
          </h3>
          {conditions.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {conditions.map((c: Condition) => (
                <li key={c.id}>
                  {c.code?.text || c.code?.coding?.[0]?.display}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Medications
          </h3>
          {medications.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {medications.map((m: MedicationStatement) => (
                <li key={m.id}>
                  {m.medicationCodeableConcept?.text ||
                    m.medicationCodeableConcept?.coding?.[0]?.display}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Allergies
          </h3>
          {allergies.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {allergies.map((a: AllergyIntolerance) => (
                <li key={a.id}>
                  {a.code?.text || a.code?.coding?.[0]?.display}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Procedures
          </h3>
          {procedures.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {procedures.map((p: Procedure) => (
                <li key={p.id}>
                  {p.code?.text || p.code?.coding?.[0]?.display}{" "}
                  {p.performedDateTime ? `(${p.performedDateTime})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Immunizations
          </h3>
          {immunizations.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {immunizations.map((im: Immunization) => (
                <li key={im.id}>
                  {im.vaccineCode?.text || im.vaccineCode?.coding?.[0]?.display}{" "}
                  {im.occurrenceDateTime ? `(${im.occurrenceDateTime})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">
            Recent Observations
          </h3>
          {observations.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {observations.slice(0, 5).map((o: Observation) => (
                <li key={o.id}>
                  {o.code?.text || o.code?.coding?.[0]?.display}:{" "}
                  {o.valueQuantity?.value} {o.valueQuantity?.unit}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None listed</div>
          )}
        </div>
      </div>
    );
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-0 relative">
        <div className="sticky top-0 z-10 bg-white p-6 pb-2 rounded-t-lg">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-blue-800">
            Patient Details
          </h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
          {loading && <div className="text-blue-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && renderDetails()}
        </div>
      </div>
    </div>
  );
}

export default function SimilaritySearchPage() {
  const [patientId, setPatientId] = useState("");
  const [freeText, setFreeText] = useState("");
  const [results, setResults] = useState<QdrantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    file?: string;
  } | null>(null);
  const [dropdownPatients, setDropdownPatients] = useState<
    {
      id: string;
      name: string;
      file?: string | null;
    }[]
  >([]);
  const [dropdownSelected, setDropdownSelected] = useState<string>("");

  // Load first 40 patients for dropdown
  useEffect(() => {
    fetch("/api/similarity")
      .then((res) => res.json())
      .then((data) => {
        if (data.patients) setDropdownPatients(data.patients);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const body = patientId ? { patientId } : freeText ? { freeText } : null;
      if (!body) {
        setError("Please enter a Patient ID or Free Text query.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResults(data.results || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // When a dropdown patient is selected, search for similar patients
  const handleDropdownChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = e.target.value;
    setDropdownSelected(selectedId);
    setPatientId("");
    setFreeText("");
    setLoading(true);
    setError("");
    setResults([]);
    if (!selectedId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResults(data.results || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (id: string, file?: string) => {
    setSelectedPatient({ id, file });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 mt-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Patient Similarity Search
        </h1>
        {/* Dropdown for selecting a patient */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Select a Patient
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            value={dropdownSelected}
            onChange={handleDropdownChange}
            disabled={loading || dropdownPatients.length === 0}
          >
            <option value="">-- Choose a patient --</option>
            {dropdownPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ID: {p.id})
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center text-gray-400 text-sm">
            or
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Free Text Query
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-gray-400"
              placeholder="Describe a patient (e.g., '65 year old male with diabetes and hypertension')"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            disabled={loading}
          >
            {loading ? "Searching..." : "Find Similar Patients"}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-red-600 text-center font-medium">
            {error}
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Top Similar Patients
            </h2>
            <div className="space-y-4">
              {results
                .filter((r) => r.id !== dropdownSelected)
                .map((r, i) => (
                  <div
                    key={r.id || i}
                    className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => handlePatientClick(r.id, r.payload?.file)}
                    title="View patient details"
                  >
                    <div>
                      <div className="font-bold text-blue-800 text-lg">
                        {r.payload?.name || "Unknown Name"}
                      </div>
                      <div className="text-gray-600 text-sm">ID: {r.id}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        File: {r.payload?.file}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 md:text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-sm">
                        Score: {r.score?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      <PatientDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={selectedPatient?.id || null}
        file={selectedPatient?.file}
      />
    </div>
  );
}
