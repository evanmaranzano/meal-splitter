import { useState } from 'react'
import type { BillItem, Participant } from '../types'
import { formatMoney } from '../lib/money'
import { BillItemForm } from './BillItemForm'

interface BillItemsEditorProps {
  participants: Participant[]
  items: BillItem[]
  onUpsert: (item: Omit<BillItem, 'id'>, id?: string) => void
  onDelete: (id: string) => void
}

export function BillItemsEditor({ participants, items, onUpsert, onDelete }: BillItemsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingItem = items.find((item) => item.id === editingId)

  const participantNames = (item: BillItem) =>
    item.participantIds
      .map((id) => participants.find((participant) => participant.id === id)?.name)
      .filter(Boolean)
      .join('、')

  const submitItem = (item: Omit<BillItem, 'id'>, id?: string) => {
    onUpsert(item, id)
    setEditingId(null)
  }

  return (
    <section className="panel" aria-labelledby="items-title">
      <div className="section-heading">
        <p className="eyebrow">第二步</p>
        <h2 id="items-title">每道菜谁来分</h2>
      </div>

      <BillItemForm participants={participants} onSubmit={submitItem} />

      <div className="item-list" aria-label="账单项目列表">
        {items.length === 0 ? (
          <p className="empty-state">还没有菜品或费用项目。</p>
        ) : (
          items.map((item) => (
            <article className="bill-item-card" key={item.id}>
              {editingId === item.id && editingItem ? (
                <BillItemForm participants={participants} item={editingItem} onSubmit={submitItem} onCancel={() => setEditingId(null)} />
              ) : (
                <>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {formatMoney(Math.round(item.price * item.quantity * 100))} · 单价 {formatMoney(Math.round(item.price * 100))} × {item.quantity}
                    </p>
                    <p className="muted">{participantNames(item) || '暂无有效分摊人'}</p>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="ghost" onClick={() => setEditingId(item.id)}>
                      编辑
                    </button>
                    <button type="button" className="ghost danger" onClick={() => onDelete(item.id)}>
                      删除
                    </button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}
