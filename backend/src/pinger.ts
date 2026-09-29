import { prisma } from './config/db.js'

export function startPinger() {
  console.log('Starting active URL pinger...')

  setInterval(async () => {
    try {
      const machines = await prisma.machine.findMany()
      const urls = machines.filter(m => m.machineName.startsWith('http://') || m.machineName.startsWith('https://'))

      for (const machine of urls) {
        try {
          // Native, single-line 5-second timeout signal
          const res = await fetch(machine.machineName, { signal: AbortSignal.timeout(5000) })

          if (res.ok) {
            await prisma.machine.update({
              where: { id: machine.id },
              data: { lastSeenAt: new Date() },
            })
          }
        } catch {
          // Ignore failures so lastSeenAt naturally ages out
        }
      }
    } catch (err) {
      console.error('Pinger error:', err)
    }
  }, 10_000)
}
