import { prisma } from '../src/config/db.js'

async function clear() {
  await prisma.machine.deleteMany()
  console.log('Cleared all machines')
}

clear()
  .catch((error) => {
    console.error('Clear failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
