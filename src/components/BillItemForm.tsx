import { useState } from 'react'
import type { BillItem, Participant } from '../types'

interface BillItemFormProps {
  participants: Participant[]
  item?: BillItem
  onSubmit: (item: Omit<BillItem, 'id'>, id?: string) => void
  onCancel?: () => void
}

const defaultDraft = (): Omit<BillItem, 'id'> => ({
  name: '',
  price: 0,
  quantity: 1,
  participantIds: [],
})

const draftFromItem = (item: BillItem, participants: Participant[]): Omit<BillItem, 'id'> => ({
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  participantIds: item.participantIds.filter((id) => participants.some((person) => person.id === id)),
})

export function BillItemForm({ participants, item, onSubmit, onCancel }: BillItemFormProps) {
  const [draft, setDraft] = useState<Omit<BillItem, 'id'>>(() => (item ? draftFromItem(item, participants) : defaultDraft()))
  const [error, setError] = useState('')

  const toggleParticipant = (id: string) => {
    setDraft((current) => ({
      ...current,
      participantIds: current.participantIds.includes(id)
        ? current.participantIds.filter((participantId) => participantId !== id)
        : [...current.participantIds, id],
    }))
  }

  const selectEveryone = () => {
    setDraft((current) => ({ ...current, participantIds: participants.map((participant) => participant.id) }))
  }

  const submit = () => {
    if (!draft.name.trim()) {
      setError('项目名称不能为空。')
      return
    }
    if (draft.price < 0) {
      setError('价格不能为负。')
      return
    }
    if (draft.quantity <= 0) {
      setError('数量必须大于 0。')
      return
    }
    if (draft.participantIds.length === 0) {
      setError('每个项目至少选择 1 个分摊人。')
      return
    }

    onSubmit({ ...draft, name: draft.name.trim() }, item?.id)
    if (!item) {
      setDraft(defaultDraft())
    }
    setError('')
  }

  return (
    <div className="item-form">
      <div className="form-grid">
        <label className="field">
          <span>项目名称</span>
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="例如：烤鱼"
          />
        </label>
        <label className="field">
          <span>单价（元）</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
          />
        </label>
        <label className="field">
          <span>数量</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={draft.quantity}
            onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })}
          />
        </label>
      </div>

      <div className="split-picker">
        <div className="split-picker__header">
          <span>分摊人</span>
          <button type="button" className="ghost" onClick={selectEveryone} disabled={participants.length === 0}>
            所有人平分
          </button>
        </div>
        {participants.length === 0 ? (
          <p className="empty-state">添加参与人后才能选择分摊关系。</p>
        ) : (
          <div className="chip-list">
            {participants.map((participant) => (
              <label
                className={draft.participantIds.includes(participant.id) ? 'chip chip--selected' : 'chip'}
                key={participant.id}
              >
                <input
                  type="checkbox"
                  checked={draft.participantIds.includes(participant.id)}
                  onChange={() => toggleParticipant(participant.id)}
                />
                <span>{participant.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error ? <p className="error-note" role="alert">{error}</p> : null}

      <div className="form-actions">
        <button type="button" onClick={submit}>
          {item ? '保存项目' : '添加项目'}
        </button>
        {onCancel ? (
          <button type="button" className="ghost" onClick={onCancel}>
            取消
          </button>
        ) : null}
      </div>
    </div>
  )
}
