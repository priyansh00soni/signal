// Shape of a single machine as returned by the backend.
export interface Machine {
  id: string;
  machineName: string;
  lastSeenAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  isOffline: boolean;
}

export interface MachinesResponse {
  success: boolean;
  data: Machine[];
}
