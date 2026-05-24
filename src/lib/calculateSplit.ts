import type { MealState, PersonItemSplit, PersonSplit, SplitResult } from '../types'
import { toCents } from './money'

const emptyPerson = (participantId: string, name: string): PersonSplit => ({
  participantId,
  name,
  itemSubtotal: 0,
  taxShare: 0,
  serviceFeeShare: 0,
  tipShare: 0,
  discountShare: 0,
  adjustmentShare: 0,
  total: 0,
  items: [],
})

const splitEvenly = (amount: number, count: number) => {
  if (count <= 0) {
    return []
  }

  const base = Math.floor(amount / count)
  const remainder = amount - base * count
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0))
}

const allocateByWeights = (amount: number, weights: number[]): number[] => {
  if (weights.length === 0) {
    return []
  }

  if (amount < 0) {
    return allocateByWeights(-amount, weights).map((share) => -share)
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const effectiveWeights = totalWeight > 0 ? weights : weights.map(() => 1)
  const effectiveTotalWeight = totalWeight > 0 ? totalWeight : weights.length

  const shares = effectiveWeights.map((weight, index) => {
    const weightedAmount = amount * weight
    const share = Math.floor(weightedAmount / effectiveTotalWeight)
    return {
      index,
      share,
      remainder: weightedAmount - share * effectiveTotalWeight,
      weight,
    }
  })

  let remainder = amount - shares.reduce((sum, entry) => sum + entry.share, 0)
  const order = [...shares].sort((a, b) => b.remainder - a.remainder || b.weight - a.weight || a.index - b.index)

  for (const entry of order) {
    if (remainder <= 0) {
      break
    }
    shares[entry.index].share += 1
    remainder -= 1
  }

  return shares.map((entry) => entry.share)
}

export const calculateSplit = (meal: MealState): SplitResult => {
  const people = new Map(
    meal.participants.map((participant) => [participant.id, emptyPerson(participant.id, participant.name)]),
  )
  const participantOrder = new Map(meal.participants.map((participant, index) => [participant.id, index]))

  let itemSubtotal = 0

  for (const item of meal.items) {
    const participantIds = item.participantIds.filter((id) => people.has(id))
    if (participantIds.length === 0) {
      continue
    }

    const itemTotal = Math.max(0, Math.round(toCents(item.price) * item.quantity))
    itemSubtotal += itemTotal

    const orderedParticipantIds = [...participantIds].sort(
      (a, b) => (participantOrder.get(a) ?? 0) - (participantOrder.get(b) ?? 0),
    )
    const shares = splitEvenly(itemTotal, orderedParticipantIds.length)

    orderedParticipantIds.forEach((participantId, index) => {
      const person = people.get(participantId)
      if (!person) {
        return
      }

      const share = shares[index]
      const itemSplit: PersonItemSplit = {
        itemId: item.id,
        name: item.name,
        total: itemTotal,
        share,
        participantCount: orderedParticipantIds.length,
      }
      person.itemSubtotal += share
      person.items.push(itemSplit)
    })
  }

  const tax = toCents(meal.charges.tax)
  const serviceFee = toCents(meal.charges.serviceFee)
  const tip = toCents(meal.charges.tip)
  const fixedDiscount = Math.max(0, toCents(meal.charges.fixedDiscount))
  const percentageDiscount = Math.max(0, Math.round(itemSubtotal * (meal.charges.percentageDiscount / 100)))
  const discountTotal = fixedDiscount + percentageDiscount
  const adjustment = toCents(meal.charges.adjustment)
  const weights = meal.participants.map((participant) => people.get(participant.id)?.itemSubtotal ?? 0)

  const taxShares = allocateByWeights(tax, weights)
  const serviceFeeShares = allocateByWeights(serviceFee, weights)
  const tipShares = allocateByWeights(tip, weights)
  const discountShares = allocateByWeights(-discountTotal, weights)
  const adjustmentShares = allocateByWeights(adjustment, weights)

  meal.participants.forEach((participant, index) => {
    const person = people.get(participant.id)
    if (!person) {
      return
    }

    person.taxShare = taxShares[index] ?? 0
    person.serviceFeeShare = serviceFeeShares[index] ?? 0
    person.tipShare = tipShares[index] ?? 0
    person.discountShare = discountShares[index] ?? 0
    person.adjustmentShare = adjustmentShares[index] ?? 0
    person.total =
      person.itemSubtotal +
      person.taxShare +
      person.serviceFeeShare +
      person.tipShare +
      person.discountShare +
      person.adjustmentShare
  })

  return {
    itemSubtotal,
    tax,
    serviceFee,
    tip,
    fixedDiscount,
    percentageDiscount,
    discountTotal,
    adjustment,
    finalTotal: itemSubtotal + tax + serviceFee + tip - discountTotal + adjustment,
    people: meal.participants.map((participant) => people.get(participant.id) ?? emptyPerson(participant.id, participant.name)),
  }
}
