import { prisma } from './config/db.js'

export function startPinger() {
  console.log('Starting active URL pinger...')
  
  // Every 10 seconds, actively check any machine name that is a URL
  setInterval(async () => {
    try {
      const machines = await prisma.machine.findMany()
      const urls = machines.filter(m => m.machineName.startsWith('http://') || m.machineName.startsWith('https://'))

      for (const machine of urls) {
        try {
          // Add a short timeout so one slow site doesn't block the loop
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 5000)
          
          const res = await fetch(machine.machineName, { signal: controller.signal })
          clearTimeout(timeout)

          if (res.ok) {
            // If the real site is up, simulate a heartbeat for it!
            await prisma.machine.update({
              where: { id: machine.id },
              data: { lastSeenAt: new Date() },
            })
          }
        } catch (err) {
          // Fetch failed (network error, timeout, site is down)
          // We do nothing, allowing the lastSeenAt timer to naturally age out to offline
        }
      }
    } catch (err) {
      console.error('Pinger error:', err)
    }
  }, 10_000)
}
