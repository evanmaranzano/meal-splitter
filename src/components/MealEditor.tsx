import type { BillItem, Charges, Participant } from '../types'
import { BillItemsEditor } from './BillItemsEditor'
import { ChargesEditor } from './ChargesEditor'
import { ParticipantsEditor } from './ParticipantsEditor'

interface MealEditorProps {
  participants: Participant[]
  items: BillItem[]
  charges: Charges
  onAddParticipant: (name: string) => boolean
  onRenameParticipant: (id: string, name: string) => boolean
  onDeleteParticipant: (id: string) => void
  onUpsertItem: (item: Omit<BillItem, 'id'>, id?: string) => void
  onDeleteItem: (id: string) => void
  onChangeCharges: (charges: Charges) => void
}

export function MealEditor({
  participants,
  items,
  charges,
  onAddParticipant,
  onRenameParticipant,
  onDeleteParticipant,
  onUpsertItem,
  onDeleteItem,
  onChangeCharges,
}: MealEditorProps) {
  return (
    <div className="editor-stack">
      <ParticipantsEditor
        participants={participants}
        onAdd={onAddParticipant}
        onRename={onRenameParticipant}
        onDelete={onDeleteParticipant}
      />
      <BillItemsEditor participants={participants} items={items} onUpsert={onUpsertItem} onDelete={onDeleteItem} />
      <ChargesEditor charges={charges} onChange={onChangeCharges} />
    </div>
  )
}
