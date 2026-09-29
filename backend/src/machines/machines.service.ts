import { prisma } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { isMachineOffline } from './isMachineOffline.js'

export const recordHeartbeat = async (machineName: string) => {
  const now = new Date()
  const existing = await prisma.machine.findUnique({ where: { machineName } })

  // if the machine exists, update its timestamp.
  // Otherwise, create a new row.
  if (existing) {
    const machine = await prisma.machine.update({
      where: { machineName },
      data: { lastSeenAt: now },
    })
    return { machine, wasCreated: false }
  }

  const machine = await prisma.machine.create({
    data: { machineName, lastSeenAt: now },
  })
  return { machine, wasCreated: true }
}

export const listMachines = async () => {
  const machines = await prisma.machine.findMany({
    orderBy: { lastSeenAt: 'desc' },
  })
  const now = new Date()
  return machines.map((machine) => ({
    ...machine,
    isOffline: isMachineOffline(machine.lastSeenAt, now),
  }))
}

export const getMachineById = async (id: string) => {
  const machine = await prisma.machine.findUnique({ where: { id } })
  if (!machine) throw new ApiError(404, 'Machine not found')
  return {
    ...machine,
    isOffline: isMachineOffline(machine.lastSeenAt, new Date()),
  }
}

export const deleteMachine = async (id: string) => {
  try {
    await prisma.machine.delete({ where: { id } })
  } catch (error: any) {
    // If it doesn't exist, Prisma throws P2025. We can just ignore or rethrow as 404.
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Machine not found')
    }
    throw error
  }
}
