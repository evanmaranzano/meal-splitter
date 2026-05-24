export interface Participant {
  id: string
  name: string
}

export interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  participantIds: string[]
}

export interface Charges {
  tax: number
  serviceFee: number
  tip: number
  fixedDiscount: number
  percentageDiscount: number
  adjustment: number
}

export interface MealState {
  version: number
  participants: Participant[]
  items: BillItem[]
  charges: Charges
  updatedAt: string
}

export interface PersonItemSplit {
  itemId: string
  name: string
  total: number
  share: number
  participantCount: number
}

export interface PersonSplit {
  participantId: string
  name: string
  itemSubtotal: number
  taxShare: number
  serviceFeeShare: number
  tipShare: number
  discountShare: number
  adjustmentShare: number
  total: number
  items: PersonItemSplit[]
}

export interface SplitResult {
  itemSubtotal: number
  tax: number
  serviceFee: number
  tip: number
  fixedDiscount: number
  percentageDiscount: number
  discountTotal: number
  adjustment: number
  finalTotal: number
  people: PersonSplit[]
}
