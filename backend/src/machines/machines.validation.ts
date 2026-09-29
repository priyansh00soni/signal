// Plain manual check, no schema library. Returns field-level error
// messages; empty array means the body is valid.
export const validateHeartbeatBody = (body: unknown): string[] => {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null || !('machineName' in body)) {
    errors.push('machineName is required')
    return errors
  }

  const { machineName } = body as { machineName: unknown }

  if (typeof machineName !== 'string' || machineName.trim().length === 0) {
    errors.push('machineName must be a non-empty string')
  }

  return errors
}
