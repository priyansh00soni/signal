import { Router } from 'express'
import * as machinesController from './machines.controller.js'

export const machinesRouter = Router()

machinesRouter.post('/heartbeats', machinesController.handleCreateHeartbeat)
machinesRouter.get('/machines', machinesController.handleListMachines)
machinesRouter.get('/machines/:id', machinesController.handleGetMachineById)
machinesRouter.delete('/machines/:id', machinesController.handleDeleteMachine)
