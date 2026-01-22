// Fetch all jobs

import { useState, useEffect } from "react";
import type { Job } from "@/types";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all jobs
    setLoading(false);
  }, []);

  return { jobs, loading, error };
}

