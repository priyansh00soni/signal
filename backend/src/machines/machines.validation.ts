export const validateHeartbeatBody = (body: any): string[] => {
  const name = body?.machineName;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return ['machineName must be a non-empty string'];
  }

  return [];
}
