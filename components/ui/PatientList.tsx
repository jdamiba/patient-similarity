"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Pill,
  AlertTriangle,
  FileText,
  Loader2,
} from "lucide-react";
import Button from "@/app/components/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  file: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  lastVisit: string;
  nextAppointment: string;
  priority: "low" | "medium" | "high";
  status: "active" | "inactive" | "pending";
  careNotes: Array<{
    id: string;
    date: string;
    provider: string;
    note: string;
    type: "assessment" | "treatment" | "follow-up" | "medication";
  }>;
  similarityScore?: number;
}

interface PatientListProps {
  patients?: Patient[];
  isLoading?: boolean;
  error?: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    file: "P0001",
    dateOfBirth: "1985-03-15",
    gender: "Female",
    phone: "(555) 123-4567",
    email: "s.johnson@email.com",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    emergencyContact: "John Johnson (Spouse)",
    emergencyPhone: "(555) 123-4568",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
    allergies: ["Penicillin", "Shellfish"],
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-15",
    priority: "high",
    status: "active",
    careNotes: [
      {
        id: "1",
        date: "2024-01-15",
        provider: "Dr. Smith",
        note: "Blood pressure well controlled. Continue current medications.",
        type: "assessment",
      },
      {
        id: "2",
        date: "2024-01-10",
        provider: "Nurse Williams",
        note: "Patient education provided on diabetes management.",
        type: "treatment",
      },
    ],
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    file: "P0002",
    dateOfBirth: "1978-07-22",
    gender: "Male",
    phone: "(555) 234-5678",
    email: "m.chen@email.com",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    emergencyContact: "Lisa Chen (Wife)",
    emergencyPhone: "(555) 234-5679",
    conditions: ["Asthma", "Seasonal Allergies"],
    medications: ["Albuterol Inhaler", "Claritin 10mg"],
    allergies: ["Latex"],
    lastVisit: "2024-01-20",
    nextAppointment: "2024-03-20",
    priority: "medium",
    status: "active",
    careNotes: [
      {
        id: "3",
        date: "2024-01-20",
        provider: "Dr. Brown",
        note: "Asthma symptoms well managed. Refilled inhaler prescription.",
        type: "medication",
      },
    ],
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Davis",
    file: "P0003",
    dateOfBirth: "1992-11-08",
    gender: "Female",
    phone: "(555) 345-6789",
    email: "e.davis@email.com",
    address: "789 Pine St",
    city: "Springfield",
    state: "IL",
    zipCode: "62703",
    emergencyContact: "Robert Davis (Father)",
    emergencyPhone: "(555) 345-6790",
    conditions: ["Anxiety", "Migraine"],
    medications: ["Sertraline 50mg", "Sumatriptan 100mg"],
    allergies: ["None known"],
    lastVisit: "2024-01-25",
    nextAppointment: "2024-02-25",
    priority: "low",
    status: "active",
    careNotes: [
      {
        id: "4",
        date: "2024-01-25",
        provider: "Dr. Wilson",
        note: "Anxiety symptoms improving with current medication. Continue therapy.",
        type: "follow-up",
      },
    ],
  },
];

// Define a type for Qdrant similarity search results
interface QdrantResult {
  id: string;
  score?: number;
  payload?: {
    id?: string;
    name?: string;
    file?: string;
    [key: string]: unknown;
  };
}

// Minimal FHIR resource type for mapping
type FhirResource = {
  code?: { text?: string; coding?: { display?: string }[] };
  medicationCodeableConcept?: {
    text?: string;
    coding?: { display?: string }[];
  };
  id?: string;
  effectiveDateTime?: string;
  performer?: { display?: string }[];
  valueString?: string;
  valueCode?: string;
};

type FhirTelecom = { system?: string; value?: string };
type FhirPerformer = { display?: string };

const PatientList: React.FC<PatientListProps> = ({
  patients = mockPatients,
  isLoading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [sortField] = useState<"lastName" | "firstName">("lastName");
  const [sortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus] = useState<string>("all");
  const [filterPriority] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [similarityResults, setSimilarityResults] = useState<
    QdrantResult[] | null
  >(null);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarityError, setSimilarityError] = useState<string | null>(null);
  const itemsPerPage = 10;
  const [searchType, setSearchType] = useState<"name" | "freeText">("name");
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [similarPatients, setSimilarPatients] = useState<QdrantResult[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [selectedForSimilarity, setSelectedForSimilarity] =
    useState<Patient | null>(null);

  // Similarity search effect
  useEffect(() => {
    if (searchType !== "freeText") {
      setSimilarityResults(null);
      setSimilarityError(null);
      setSimilarityLoading(false);
      return;
    }
    const doSimilaritySearch = async () => {
      if (!searchTerm) {
        setSimilarityResults(null);
        setSimilarityError(null);
        setSimilarityLoading(false);
        return;
      }
      setSimilarityLoading(true);
      setSimilarityError(null);
      try {
        const res = await fetch("/api/similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freeText: searchTerm }),
        });
        const data = await res.json();
        console.log("Similarity search response:", data);
        if (!res.ok) throw new Error(data.error || "Unknown error");
        setSimilarityResults(data.results || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setSimilarityError(err.message);
        } else {
          setSimilarityError(String(err));
        }
        setSimilarityResults([]);
      } finally {
        setSimilarityLoading(false);
      }
    };
    doSimilaritySearch();
  }, [searchTerm, searchType]);

  // Keep pendingSearch in sync with searchType changes (clear input on type switch)
  useEffect(() => {
    setPendingSearch("");
    setSearchTerm("");
  }, [searchType]);

  // Map API patients to Patient interface for table
  const mappedPatients: Patient[] = useMemo(() => {
    if (similarityResults) {
      // Map similarity results to Patient interface, include score
      return similarityResults.map((r: QdrantResult) => ({
        id: r.payload?.id || r.id,
        firstName: r.payload?.name?.split(" ")[0] || r.payload?.name || r.id,
        lastName: r.payload?.name?.split(" ").slice(1).join(" ") || "",
        file: r.payload?.file || "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        emergencyContact: "",
        emergencyPhone: "",
        conditions: [],
        medications: [],
        allergies: [],
        lastVisit: "",
        nextAppointment: "",
        priority: "medium",
        status: "active",
        careNotes: [],
        similarityScore: r.score,
      }));
    }
    if (!patients || patients.length === 0) return [];
    if (patients[0].firstName) return patients;
    return patients.map((p: Patient) => ({
      ...p,
    }));
  }, [patients, similarityResults]);

  const filteredAndSortedPatients = useMemo(() => {
    if (similarityResults) {
      // Don't filter by name, just sort/paginate if needed
      return mappedPatients;
    }
    const filtered = mappedPatients.filter((patient) => {
      const matchesSearch =
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || patient.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || patient.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    return filtered;
  }, [
    mappedPatients,
    similarityResults,
    searchTerm,
    sortField,
    sortDirection,
    filterStatus,
    filterPriority,
  ]);

  const paginatedPatients = useMemo(() => {
    const startIndex = 0; // Pagination removed since setCurrentPage/totalPages are unused
    return filteredAndSortedPatients.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedPatients]);

  // Fetch patient details from API and open modal
  const handleViewDetails = async (patient: Patient) => {
    setModalLoading(true);
    setModalError(null);
    setIsModalOpen(true);
    try {
      const res = await fetch(
        `/api/patient?file=${encodeURIComponent(patient.file)}`
      );
      const data = await res.json();
      if (!res.ok || !data.bundle)
        throw new Error(data.error || "Failed to load patient details");
      // Map FHIR bundle to Patient interface
      const bundle = data.bundle;
      const entry = bundle.entry || [];
      const patientResource = entry.find(
        (e: { resource?: Record<string, unknown> }) =>
          e.resource?.resourceType === "Patient"
      )?.resource;
      const conditions = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "Condition"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return resource.code?.text || resource.code?.coding?.[0]?.display;
        })
        .filter(Boolean);
      const medications = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "MedicationStatement"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return (
            resource.medicationCodeableConcept?.text ||
            resource.medicationCodeableConcept?.coding?.[0]?.display
          );
        })
        .filter(Boolean);
      const allergies = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "AllergyIntolerance"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return resource.code?.text || resource.code?.coding?.[0]?.display;
        })
        .filter(Boolean);
      const careNotes = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "Observation"
        )
        .map((e: { resource?: Record<string, unknown> }, i: number) => {
          const resource = e.resource as FhirResource;
          return {
            id: resource.id || String(i),
            date: resource.effectiveDateTime || "",
            provider: (resource.performer?.[0] as FhirPerformer)?.display || "",
            note: resource.valueString || resource.valueCode || "",
            type: "assessment",
          };
        });
      setSelectedPatient({
        id: patientResource?.id || patient.id,
        firstName: patientResource?.name?.[0]?.given?.[0] || "",
        lastName: patientResource?.name?.[0]?.family || "",
        file: patient.file, // Ensure file is set from the patient object
        dateOfBirth: patientResource?.birthDate || "",
        gender: patientResource?.gender || "",
        phone:
          (
            patientResource?.telecom?.find(
              (t: FhirTelecom) => t.system === "phone"
            ) as FhirTelecom
          )?.value || "",
        email:
          (
            patientResource?.telecom?.find(
              (t: FhirTelecom) => t.system === "email"
            ) as FhirTelecom
          )?.value || "",
        address: patientResource?.address?.[0]?.line?.[0] || "",
        city: patientResource?.address?.[0]?.city || "",
        state: patientResource?.address?.[0]?.state || "",
        zipCode: patientResource?.address?.[0]?.postalCode || "",
        emergencyContact: "",
        emergencyPhone: "",
        conditions,
        medications,
        allergies,
        lastVisit: "",
        nextAppointment: "",
        priority: "medium",
        status: "active",
        careNotes,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError(String(err));
      }
      setSelectedPatient(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleShowSimilar = async (patient: Patient) => {
    setShowSimilarModal(true);
    setSelectedForSimilarity(patient);
    setSimilarLoading(true);
    setSimilarError(null);
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setSimilarPatients(data.results || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSimilarError(err.message);
      } else {
        setSimilarError(String(err));
      }
      setSimilarPatients([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  // Filter out the selected patient from similarPatients
  const filteredSimilarPatients = useMemo(() => {
    if (!selectedForSimilarity) return similarPatients;
    return similarPatients.filter(
      (r: QdrantResult) => (r.payload?.id || r.id) !== selectedForSimilarity.id
    );
  }, [similarPatients, selectedForSimilarity]);

  // Helper function to calculate age
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: "active" | "inactive" | "pending") => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to handle clicking a similar patient row
  const handleSimilarPatientClick = async (patient: QdrantResult) => {
    setShowSimilarModal(false);
    setModalLoading(true);
    setModalError(null);
    setIsModalOpen(true);
    try {
      const res = await fetch(
        `/api/patient?file=${encodeURIComponent(patient.payload?.file || "")}`
      );
      const data = await res.json();
      if (!res.ok || !data.bundle)
        throw new Error(data.error || "Failed to load patient details");
      // Map FHIR bundle to Patient interface
      const bundle = data.bundle;
      const entry = bundle.entry || [];
      const patientResource = entry.find(
        (e: { resource?: Record<string, unknown> }) =>
          e.resource?.resourceType === "Patient"
      )?.resource;
      const conditions = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "Condition"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return resource.code?.text || resource.code?.coding?.[0]?.display;
        })
        .filter(Boolean);
      const medications = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "MedicationStatement"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return (
            resource.medicationCodeableConcept?.text ||
            resource.medicationCodeableConcept?.coding?.[0]?.display
          );
        })
        .filter(Boolean);
      const allergies = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "AllergyIntolerance"
        )
        .map((e: { resource?: Record<string, unknown> }) => {
          const resource = e.resource as FhirResource;
          return resource.code?.text || resource.code?.coding?.[0]?.display;
        })
        .filter(Boolean);
      const careNotes = entry
        .filter(
          (e: { resource?: Record<string, unknown> }) =>
            e.resource?.resourceType === "Observation"
        )
        .map((e: { resource?: Record<string, unknown> }, i: number) => {
          const resource = e.resource as FhirResource;
          return {
            id: resource.id || String(i),
            date: resource.effectiveDateTime || "",
            provider: (resource.performer?.[0] as FhirPerformer)?.display || "",
            note: resource.valueString || resource.valueCode || "",
            type: "assessment",
          };
        });
      setSelectedPatient({
        id: patientResource?.id || patient.payload?.id || patient.id,
        firstName: patientResource?.name?.[0]?.given?.[0] || "",
        lastName: patientResource?.name?.[0]?.family || "",
        file: patient.payload?.file || "",
        dateOfBirth: patientResource?.birthDate || "",
        gender: patientResource?.gender || "",
        phone:
          (
            patientResource?.telecom?.find(
              (t: FhirTelecom) => t.system === "phone"
            ) as FhirTelecom
          )?.value || "",
        email:
          (
            patientResource?.telecom?.find(
              (t: FhirTelecom) => t.system === "email"
            ) as FhirTelecom
          )?.value || "",
        address: patientResource?.address?.[0]?.line?.[0] || "",
        city: patientResource?.address?.[0]?.city || "",
        state: patientResource?.address?.[0]?.state || "",
        zipCode: patientResource?.address?.[0]?.postalCode || "",
        emergencyContact: "",
        emergencyPhone: "",
        conditions,
        medications,
        allergies,
        lastVisit: "",
        nextAppointment: "",
        priority: "medium",
        status: "active",
        careNotes,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError(String(err));
      }
      setSelectedPatient(null);
    } finally {
      setModalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Patients
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Patient List</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredAndSortedPatients.length} patients
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div>
              <Select
                value={searchType}
                onValueChange={(v) => setSearchType(v as "name" | "freeText")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>
                    {searchType === "name" ? "Name" : "Free Text"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="freeText">Free Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  searchType === "freeText"
                    ? "Search by description (e.g. 'male with diabetes')..."
                    : "Search patients by name..."
                }
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchTerm(pendingSearch);
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>
          {/* Similarity search error/loading */}
          {similarityLoading && (
            <div className="text-center text-muted-foreground mb-4">
              Searching for similar patients...
            </div>
          )}
          {similarityError && (
            <div className="text-center text-red-500 mb-4">
              {similarityError}
            </div>
          )}

          {/* Patient Table */}
          {filteredAndSortedPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Patients Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search."
                  : "No patients have been added yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>File</TableHead>
                    {similarityResults && (
                      <TableHead>Similarity Score</TableHead>
                    )}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(patient)}
                    >
                      <TableCell>
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>{patient.file}</TableCell>
                      {similarityResults && (
                        <TableCell>
                          {typeof patient.similarityScore === "number"
                            ? `${Math.round(patient.similarityScore * 100)}%`
                            : ""}
                        </TableCell>
                      )}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowSimilar(patient)}
                        >
                          Show Similar Patients
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Refined Patient Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl p-0 h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    selectedPatient
                      ? `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient.firstName} ${selectedPatient.lastName}`
                      : ""
                  }
                />
                <AvatarFallback>
                  {selectedPatient
                    ? `${selectedPatient.firstName[0]}${selectedPatient.lastName[0]}`
                    : ""}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="text-xl font-semibold truncate">
                  {selectedPatient?.firstName} {selectedPatient?.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  Patient ID: {selectedPatient?.id}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {modalLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">
                Loading patient details...
              </span>
            </div>
          ) : modalError ? (
            <div className="flex-1 text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Error Loading Patient Details
              </h3>
              <p className="text-muted-foreground">{modalError}</p>
            </div>
          ) : (
            selectedPatient && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs
                  defaultValue="demographics"
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <TabsList className="px-6 pt-2 border-b justify-center flex w-full">
                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                    <TabsTrigger value="medical">Medical Info</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="notes">Care Notes</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto p-6 pb-8">
                    <TabsContent
                      value="demographics"
                      className="mt-0 space-y-4 h-full"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="flex items-center space-x-2 text-base">
                              <Users className="h-4 w-4" />
                              <span>Personal Information</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 py-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Date of Birth:
                              </span>
                              <span>
                                {selectedPatient.dateOfBirth
                                  ? new Date(
                                      selectedPatient.dateOfBirth
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Age:
                              </span>
                              <span>
                                {selectedPatient.dateOfBirth
                                  ? calculateAge(selectedPatient.dateOfBirth)
                                  : "N/A"}{" "}
                                years
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Gender:
                              </span>
                              <span>{selectedPatient.gender || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <Badge
                                className={getStatusColor(
                                  selectedPatient.status
                                )}
                              >
                                {selectedPatient.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Priority:
                              </span>
                              <Badge
                                className={getPriorityColor(
                                  selectedPatient.priority
                                )}
                              >
                                {selectedPatient.priority}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="flex items-center space-x-2 text-base">
                              <Phone className="h-4 w-4" />
                              <span>Contact Information</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 py-3">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">
                                {selectedPatient.phone || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">
                                {selectedPatient.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="overflow-hidden">
                                <div className="break-words">
                                  {selectedPatient.address || "N/A"}
                                </div>
                                <div className="break-words">
                                  {selectedPatient.city && selectedPatient.state
                                    ? `${selectedPatient.city}, ${selectedPatient.state} ${selectedPatient.zipCode}`
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <div className="font-medium mb-1">
                                Emergency Contact
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {selectedPatient.emergencyContact || "N/A"}
                              </div>
                              <div className="text-sm truncate">
                                {selectedPatient.emergencyPhone || "N/A"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="mb-8">
                        <CardHeader className="py-3">
                          <CardTitle className="flex items-center space-x-2 text-base">
                            <Calendar className="h-4 w-4" />
                            <span>Appointment History</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Last Visit
                              </div>
                              <div className="font-medium">
                                {selectedPatient.lastVisit
                                  ? new Date(
                                      selectedPatient.lastVisit
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Next Appointment
                              </div>
                              <div className="font-medium">
                                {selectedPatient.nextAppointment
                                  ? new Date(
                                      selectedPatient.nextAppointment
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="medical"
                      className="mt-0 space-y-4 h-full"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="flex items-center space-x-2 text-base">
                              <FileText className="h-4 w-4" />
                              <span>Medical Conditions</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-3">
                            {selectedPatient.conditions.length > 0 ? (
                              <div className="flex flex-wrap gap-2 w-full">
                                {selectedPatient.conditions.map(
                                  (condition, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="whitespace-normal"
                                    >
                                      <span className="break-words">
                                        {condition}
                                      </span>
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">
                                No known conditions
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="flex items-center space-x-2 text-base">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Allergies</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-3">
                            {selectedPatient.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-2 w-full">
                                {selectedPatient.allergies.map(
                                  (allergy, index) => (
                                    <Badge
                                      key={index}
                                      variant="destructive"
                                      className="whitespace-normal"
                                    >
                                      <span className="break-words">
                                        {allergy}
                                      </span>
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">
                                No known allergies
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="medications" className="mt-0 h-full">
                      <Card className="mb-8">
                        <CardHeader className="py-3">
                          <CardTitle className="flex items-center space-x-2 text-base">
                            <Pill className="h-4 w-4" />
                            <span>Current Medications</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          {selectedPatient.medications.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPatient.medications.map(
                                (medication, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                      <Pill className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="font-medium truncate">
                                        {medication}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="flex-shrink-0"
                                    >
                                      Active
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No current medications
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0 h-full">
                      <Card className="mb-8">
                        <CardHeader className="py-3">
                          <CardTitle className="flex items-center space-x-2 text-base">
                            <FileText className="h-4 w-4" />
                            <span>Recent Care Notes</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          {selectedPatient.careNotes.length > 0 ? (
                            <div className="space-y-4">
                              {selectedPatient.careNotes.map((note) => (
                                <div
                                  key={note.id}
                                  className="border rounded-lg p-4"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {note.type}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground truncate">
                                        {note.provider}
                                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {note.date
                                        ? new Date(
                                            note.date
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <p className="text-sm break-words">
                                    {note.note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No care notes available
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
      {/* Similar Patients Modal */}
      <Dialog open={showSimilarModal} onOpenChange={setShowSimilarModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Similar Patients
              {selectedForSimilarity
                ? ` to ${selectedForSimilarity.firstName} ${selectedForSimilarity.lastName}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          {similarLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">
                Loading similar patients...
              </span>
            </div>
          ) : similarError ? (
            <div className="text-center py-8 text-red-500">{similarError}</div>
          ) : filteredSimilarPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No similar patients found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Similarity Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSimilarPatients.map((r: QdrantResult) => (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSimilarPatientClick(r)}
                    >
                      <TableCell>{r.payload?.name || r.id}</TableCell>
                      <TableCell>{r.payload?.id || r.id}</TableCell>
                      <TableCell>{r.payload?.file || ""}</TableCell>
                      <TableCell>
                        {typeof r.score === "number"
                          ? `${Math.round(r.score * 100)}%`
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientList;
