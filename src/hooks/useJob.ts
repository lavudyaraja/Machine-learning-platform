// Fetch and manage job data

import { useState, useEffect } from "react";
import type { Job } from "@/types";

export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch job data
    setLoading(false);
  }, [jobId]);

  return { job, loading, error };
}

