import type { BillItem, Charges, MealState, Participant } from '../types'

export const STORAGE_KEY = 'meal-splitter-current-bill'
export const MEAL_STATE_VERSION = 1

export const emptyCharges = (): Charges => ({
  tax: 0,
  serviceFee: 0,
  tip: 0,
  fixedDiscount: 0,
  percentageDiscount: 0,
  adjustment: 0,
})

export const createEmptyMealState = (): MealState => ({
  version: MEAL_STATE_VERSION,
  participants: [],
  items: [],
  charges: emptyCharges(),
  updatedAt: new Date().toISOString(),
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const finiteNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const parseParticipants = (value: unknown): Participant[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const seenNames = new Set<string>()
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string') {
      return []
    }

    const id = entry.id.trim()
    const name = entry.name.trim()
    if (!id || !name || seenNames.has(name)) {
      return []
    }

    seenNames.add(name)
    return [{ id, name }]
  })
}

const parseCharges = (value: unknown): Charges | null => {
  if (!isRecord(value)) {
    return null
  }

  return {
    tax: finiteNumber(value.tax),
    serviceFee: finiteNumber(value.serviceFee),
    tip: finiteNumber(value.tip),
    fixedDiscount: finiteNumber(value.fixedDiscount),
    percentageDiscount: finiteNumber(value.percentageDiscount),
    adjustment: finiteNumber(value.adjustment),
  }
}

const parseItems = (value: unknown, validParticipantIds: Set<string>): BillItem[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      typeof entry.name !== 'string' ||
      !Array.isArray(entry.participantIds)
    ) {
      return []
    }

    const id = entry.id.trim()
    const name = entry.name.trim()
    const price = finiteNumber(entry.price, -1)
    const quantity = finiteNumber(entry.quantity, 0)
    const participantIds = entry.participantIds.filter(
      (participantId): participantId is string =>
        typeof participantId === 'string' && validParticipantIds.has(participantId),
    )

    if (!id || !name || price < 0 || quantity <= 0 || participantIds.length === 0) {
      return []
    }

    return [{ id, name, price, quantity, participantIds }]
  })
}

export const parseStoredMealState = (rawState: string): MealState | null => {
  try {
    const parsed: unknown = JSON.parse(rawState)
    if (!isRecord(parsed) || parsed.version !== MEAL_STATE_VERSION || typeof parsed.updatedAt !== 'string') {
      return null
    }

    const charges = parseCharges(parsed.charges)
    if (!charges) {
      return null
    }

    const participants = parseParticipants(parsed.participants)
    const participantIds = new Set(participants.map((participant) => participant.id))

    return {
      version: MEAL_STATE_VERSION,
      participants,
      items: parseItems(parsed.items, participantIds),
      charges,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}
