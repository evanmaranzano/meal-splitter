import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { MealEditor } from './components/MealEditor'
import { SplitSummary } from './components/SplitSummary'
import { calculateSplit } from './lib/calculateSplit'
import { createEmptyMealState, parseStoredMealState, STORAGE_KEY } from './lib/mealState'
import type { BillItem, Charges, MealState } from './types'

const loadMealState = (): MealState => {
  const fallback = createEmptyMealState()

  try {
    const rawState = localStorage.getItem(STORAGE_KEY)
    return rawState ? (parseStoredMealState(rawState) ?? fallback) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [meal, setMeal] = useState<MealState>(loadMealState)
  const [notice, setNotice] = useState('')
  const result = useMemo(() => calculateSplit(meal), [meal])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meal))
    } catch {
      // localStorage can be unavailable in private browsing or quota-restricted contexts.
    }
  }, [meal])

  const updateMeal = (updater: (meal: MealState) => MealState) => {
    setMeal((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }))
    setNotice('')
  }

  const hasDuplicateName = (name: string, currentId?: string) =>
    meal.participants.some(
      (participant) => participant.id !== currentId && participant.name.trim() === name.trim(),
    )

  const addParticipant = (name: string) => {
    if (!name.trim() || hasDuplicateName(name)) {
      return false
    }

    updateMeal((current) => ({
      ...current,
      participants: [...current.participants, { id: crypto.randomUUID(), name: name.trim() }],
    }))
    return true
  }

  const renameParticipant = (id: string, name: string) => {
    if (!name.trim() || hasDuplicateName(name, id)) {
      return false
    }

    updateMeal((current) => ({
      ...current,
      participants: current.participants.map((participant) =>
        participant.id === id ? { ...participant, name: name.trim() } : participant,
      ),
    }))
    return true
  }

  const deleteParticipant = (id: string) => {
    updateMeal((current) => ({
      ...current,
      participants: current.participants.filter((participant) => participant.id !== id),
      items: current.items.map((item) => ({
        ...item,
        participantIds: item.participantIds.filter((participantId) => participantId !== id),
      })),
    }))
  }

  const upsertItem = (item: Omit<BillItem, 'id'>, id?: string) => {
    updateMeal((current) => ({
      ...current,
      items: id
        ? current.items.map((currentItem) => (currentItem.id === id ? { ...item, id } : currentItem))
        : [...current.items, { ...item, id: crypto.randomUUID() }],
    }))
  }

  const deleteItem = (id: string) => {
    updateMeal((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }))
  }

  const changeCharges = (charges: Charges) => {
    updateMeal((current) => ({ ...current, charges }))
  }

  const clearMeal = () => {
    if (!confirm('确定清空当前账单吗？此操作会删除本地保存的数据。')) {
      return
    }
    setMeal(createEmptyMealState())
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      setNotice('当前账单已清空，但浏览器本地存储不可用。')
      return
    }
    setNotice('当前账单已清空')
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">餐桌边快速结账</p>
          <h1>把一顿饭拆得明明白白。</h1>
          <p className="hero-copy">
            录入参与人、菜品和附加费用，自动处理不喝酒、部分菜分摊、优惠和抹零。
          </p>
        </div>
        <button type="button" className="ghost danger" onClick={clearMeal}>
          清空当前账单
        </button>
      </header>

      <div className="workspace">
        <MealEditor
          participants={meal.participants}
          items={meal.items}
          charges={meal.charges}
          onAddParticipant={addParticipant}
          onRenameParticipant={renameParticipant}
          onDeleteParticipant={deleteParticipant}
          onUpsertItem={upsertItem}
          onDeleteItem={deleteItem}
          onChangeCharges={changeCharges}
        />
        <SplitSummary
          result={result}
          items={meal.items}
          participants={meal.participants}
          notice={notice}
          onCopied={setNotice}
        />
      </div>
    </main>
  )
}

export default App
