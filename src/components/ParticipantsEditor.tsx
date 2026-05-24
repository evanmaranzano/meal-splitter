import { useState } from 'react'
import type { Participant } from '../types'

interface ParticipantsEditorProps {
  participants: Participant[]
  onAdd: (name: string) => boolean
  onRename: (id: string, name: string) => boolean
  onDelete: (id: string) => void
}

export function ParticipantsEditor({ participants, onAdd, onRename, onDelete }: ParticipantsEditorProps) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const addParticipant = () => {
    if (!newName.trim()) {
      setError('姓名不能为空。')
      return
    }

    if (!onAdd(newName)) {
      setError('参与人姓名不能重复。')
      return
    }

    setNewName('')
    setError('')
  }

  const renameParticipant = (id: string, name: string) => {
    if (!onRename(id, name)) {
      setError(name.trim() ? '参与人姓名不能重复。' : '姓名不能为空。')
      return
    }
    setError('')
  }

  return (
    <section className="panel" aria-labelledby="participants-title">
      <div className="section-heading">
        <p className="eyebrow">第一步</p>
        <h2 id="participants-title">谁在这桌饭局里</h2>
      </div>

      <div className="inline-form">
        <label className="field">
          <span>新增参与人</span>
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="例如：小王"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addParticipant()
              }
            }}
          />
        </label>
        <button type="button" onClick={addParticipant}>
          添加
        </button>
      </div>
      {error ? <p className="error-note" role="alert">{error}</p> : null}

      <div className="participant-list" aria-label="参与人列表">
        {participants.length === 0 ? (
          <p className="empty-state">先添加一起吃饭的人。</p>
        ) : (
          participants.map((participant) => (
            <article className="participant-row" key={participant.id}>
              <label className="field compact-field">
                <span>{participant.name} 的姓名</span>
                <input
                  value={participant.name}
                  onChange={(event) => renameParticipant(participant.id, event.target.value)}
                />
              </label>
              <button type="button" className="ghost danger" onClick={() => onDelete(participant.id)}>
                删除
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
