import { describe, expect, it } from 'vitest'
import { MEAL_STATE_VERSION, parseStoredMealState } from './mealState'

describe('parseStoredMealState', () => {
  it('returns null for invalid JSON', () => {
    expect(parseStoredMealState('{broken')).toBeNull()
  })

  it('returns null for old or malformed states', () => {
    expect(parseStoredMealState(JSON.stringify({ version: 0, participants: [], items: [] }))).toBeNull()
    expect(parseStoredMealState(JSON.stringify({ version: MEAL_STATE_VERSION, participants: [], items: [] }))).toBeNull()
  })

  it('keeps only valid participants, items, and charges', () => {
    const parsed = parseStoredMealState(
      JSON.stringify({
        version: MEAL_STATE_VERSION,
        participants: [
          { id: 'p1', name: '小王' },
          { id: '', name: '无效' },
          { id: 'p2', name: '' },
        ],
        items: [
          { id: 'i1', name: '烤鱼', price: 128, quantity: 1, participantIds: ['p1', 'missing'] },
          { id: 'i2', name: '', price: 1, quantity: 1, participantIds: ['p1'] },
          { id: 'i3', name: '坏价格', price: -1, quantity: 1, participantIds: ['p1'] },
        ],
        charges: {
          tax: 1,
          serviceFee: 'bad',
          tip: 2,
          fixedDiscount: 3,
          percentageDiscount: 4,
          adjustment: -0.5,
        },
        updatedAt: '2026-05-24T00:00:00.000Z',
      }),
    )

    expect(parsed).toMatchObject({
      version: MEAL_STATE_VERSION,
      participants: [{ id: 'p1', name: '小王' }],
      items: [{ id: 'i1', name: '烤鱼', price: 128, quantity: 1, participantIds: ['p1'] }],
      charges: { tax: 1, serviceFee: 0, tip: 2, fixedDiscount: 3, percentageDiscount: 4, adjustment: -0.5 },
    })
  })
})
