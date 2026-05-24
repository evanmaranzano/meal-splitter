import { describe, expect, it } from 'vitest'
import { calculateSplit } from './calculateSplit'
import type { MealState } from '../types'

const baseMeal = (overrides: Partial<MealState> = {}): MealState => ({
  version: 1,
  updatedAt: '2026-05-24T00:00:00.000Z',
  participants: [
    { id: 'wang', name: '小王' },
    { id: 'li', name: '小李' },
    { id: 'zhang', name: '小张' },
  ],
  items: [],
  charges: {
    tax: 0,
    serviceFee: 0,
    tip: 0,
    fixedDiscount: 0,
    percentageDiscount: 0,
    adjustment: 0,
  },
  ...overrides,
})

const amountByName = (meal: MealState, name: string) => {
  const person = calculateSplit(meal).people.find((entry) => entry.name === name)
  if (!person) {
    throw new Error(`Missing person: ${name}`)
  }
  return person
}

const peopleTotal = (meal: MealState) =>
  calculateSplit(meal).people.reduce((sum, person) => sum + person.total, 0)

describe('calculateSplit', () => {
  it('assigns an item to one person', () => {
    const meal = baseMeal({
      items: [{ id: 'cola', name: '可乐', price: 12, quantity: 1, participantIds: ['zhang'] }],
    })

    expect(amountByName(meal, '小张').itemSubtotal).toBe(1200)
    expect(amountByName(meal, '小王').itemSubtotal).toBe(0)
    expect(calculateSplit(meal).finalTotal).toBe(1200)
  })

  it('splits an item across multiple people', () => {
    const meal = baseMeal({
      items: [{ id: 'beer', name: '啤酒', price: 60, quantity: 1, participantIds: ['wang', 'li'] }],
    })

    expect(amountByName(meal, '小王').itemSubtotal).toBe(3000)
    expect(amountByName(meal, '小李').itemSubtotal).toBe(3000)
  })

  it('does not charge people who are not selected for an item', () => {
    const meal = baseMeal({
      items: [{ id: 'beer', name: '啤酒', price: 60, quantity: 1, participantIds: ['wang', 'li'] }],
    })

    expect(amountByName(meal, '小张').itemSubtotal).toBe(0)
    expect(amountByName(meal, '小张').items).toHaveLength(0)
  })

  it('allocates tax service fee and tip by item subtotal ratio', () => {
    const meal = baseMeal({
      items: [
        { id: 'fish', name: '烤鱼', price: 100, quantity: 1, participantIds: ['wang'] },
        { id: 'rice', name: '米饭', price: 100, quantity: 1, participantIds: ['li'] },
      ],
      charges: { tax: 20, serviceFee: 10, tip: 30, fixedDiscount: 0, percentageDiscount: 0, adjustment: 0 },
    })

    expect(amountByName(meal, '小王').taxShare).toBe(1000)
    expect(amountByName(meal, '小李').serviceFeeShare).toBe(500)
    expect(amountByName(meal, '小王').tipShare).toBe(1500)
  })

  it('allocates fixed discount by item subtotal ratio', () => {
    const meal = baseMeal({
      items: [
        { id: 'fish', name: '烤鱼', price: 80, quantity: 1, participantIds: ['wang'] },
        { id: 'rice', name: '米饭', price: 20, quantity: 1, participantIds: ['li'] },
      ],
      charges: { tax: 0, serviceFee: 0, tip: 0, fixedDiscount: 10, percentageDiscount: 0, adjustment: 0 },
    })

    expect(amountByName(meal, '小王').discountShare).toBe(-800)
    expect(amountByName(meal, '小李').discountShare).toBe(-200)
  })

  it('applies percentage discount to item subtotal', () => {
    const meal = baseMeal({
      items: [{ id: 'fish', name: '烤鱼', price: 100, quantity: 1, participantIds: ['wang'] }],
      charges: { tax: 0, serviceFee: 0, tip: 0, fixedDiscount: 0, percentageDiscount: 12.5, adjustment: 0 },
    })

    expect(calculateSplit(meal).percentageDiscount).toBe(1250)
    expect(amountByName(meal, '小王').total).toBe(8750)
  })

  it('handles positive and negative adjustments by item subtotal ratio', () => {
    const positive = baseMeal({
      items: [
        { id: 'fish', name: '烤鱼', price: 30, quantity: 1, participantIds: ['wang'] },
        { id: 'rice', name: '米饭', price: 70, quantity: 1, participantIds: ['li'] },
      ],
      charges: { tax: 0, serviceFee: 0, tip: 0, fixedDiscount: 0, percentageDiscount: 0, adjustment: 10 },
    })
    const negative = baseMeal({
      items: positive.items,
      charges: { tax: 0, serviceFee: 0, tip: 0, fixedDiscount: 0, percentageDiscount: 0, adjustment: -10 },
    })

    expect(amountByName(positive, '小王').adjustmentShare).toBe(300)
    expect(amountByName(positive, '小李').adjustmentShare).toBe(700)
    expect(amountByName(negative, '小王').adjustmentShare).toBe(-300)
    expect(amountByName(negative, '小李').adjustmentShare).toBe(-700)
  })

  it('keeps rounding remainders stable and total-preserving', () => {
    const meal = baseMeal({
      items: [{ id: 'snack', name: '小食', price: 0.01, quantity: 1, participantIds: ['wang', 'li', 'zhang'] }],
    })
    const result = calculateSplit(meal)

    expect(result.finalTotal).toBe(1)
    expect(result.people.map((person) => person.itemSubtotal)).toEqual([1, 0, 0])
    expect(peopleTotal(meal)).toBe(result.finalTotal)
  })

  it('matches the acceptance scenario and excludes beer from Xiao Zhang', () => {
    const meal = baseMeal({
      items: [
        { id: 'fish', name: '烤鱼', price: 128, quantity: 1, participantIds: ['wang', 'li', 'zhang'] },
        { id: 'cold', name: '凉菜', price: 36, quantity: 1, participantIds: ['wang', 'li', 'zhang'] },
        { id: 'beer', name: '啤酒', price: 60, quantity: 1, participantIds: ['wang', 'li'] },
        { id: 'cola', name: '可乐', price: 12, quantity: 1, participantIds: ['zhang'] },
        { id: 'rice', name: '米饭', price: 9, quantity: 1, participantIds: ['wang', 'li', 'zhang'] },
      ],
      charges: { tax: 0, serviceFee: 20, tip: 10, fixedDiscount: 15, percentageDiscount: 0, adjustment: -0.5 },
    })
    const result = calculateSplit(meal)

    expect(result.itemSubtotal).toBe(24500)
    expect(result.finalTotal).toBe(25950)
    expect(amountByName(meal, '小张').items.map((item) => item.name)).not.toContain('啤酒')
    expect(peopleTotal(meal)).toBe(result.finalTotal)
  })
})
