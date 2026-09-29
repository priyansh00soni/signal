import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { validateHeartbeatBody } from './machines.validation.js'
import * as machinesService from './machines.service.js'

export const handleCreateHeartbeat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate first — throw a 400 if the body is bad.
    const errors = validateHeartbeatBody(req.body)
    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', null, errors)
    }

    const { machineName } = req.body as { machineName: string }
    const { machine, wasCreated } = await machinesService.recordHeartbeat(machineName)
    res.status(wasCreated ? 201 : 200).json({ success: true, data: machine })
  } catch (error) {
    next(error)
  }
}

export const handleListMachines = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const machines = await machinesService.listMachines()
    res.status(200).json({ success: true, data: machines })
  } catch (error) {
    next(error)
  }
}

export const handleGetMachineById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const machine = await machinesService.getMachineById(req.params.id)
    res.status(200).json({ success: true, data: machine })
  } catch (error) {
    next(error)
  }
}

export const handleDeleteMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await machinesService.deleteMachine(req.params.id)
    res.status(200).json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
