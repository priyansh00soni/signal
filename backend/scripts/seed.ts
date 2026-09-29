import { prisma } from '../src/config/db.js'

// A mix of recently-seen and stale machines so the dashboard shows both
// online and offline states right after seeding, without waiting around.
const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000)

const machines = [
  { machineName: 'https://canvy.onrender.com/health', lastSeenAt: secondsAgo(5) },
]

async function seed() {
  console.log('Seeding machines...')

  for (const machine of machines) {
    await prisma.machine.upsert({
      where: { machineName: machine.machineName },
      update: { lastSeenAt: machine.lastSeenAt },
      create: machine,
    })
    console.log(`  - ${machine.machineName}`)
  }

  console.log(`Done. Seeded ${machines.length} machines.`)
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
