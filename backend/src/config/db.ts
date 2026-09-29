import { PrismaClient } from '@prisma/client'

// One shared Prisma client for the whole app, so we're not opening a new
// connection pool per request.
export const prisma = new PrismaClient()
