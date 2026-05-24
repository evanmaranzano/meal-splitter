import type { Charges } from '../types'

interface ChargesEditorProps {
  charges: Charges
  onChange: (charges: Charges) => void
}

const fields: Array<{ key: keyof Charges; label: string; hint: string; step?: string }> = [
  { key: 'tax', label: '税费', hint: '按每人菜品小计比例分摊' },
  { key: 'serviceFee', label: '服务费', hint: '按比例分摊' },
  { key: 'tip', label: '小费', hint: '按比例分摊' },
  { key: 'fixedDiscount', label: '固定金额优惠', hint: '录入正数，系统自动扣减' },
  { key: 'percentageDiscount', label: '百分比优惠', hint: '作用于菜品小计，例如 8.5' },
  { key: 'adjustment', label: '抹零/调整金额', hint: '可正可负，例如 -0.5' },
]

export function ChargesEditor({ charges, onChange }: ChargesEditorProps) {
  const updateCharge = (key: keyof Charges, value: string) => {
    onChange({ ...charges, [key]: value === '' ? 0 : Number(value) })
  }

  return (
    <section className="panel" aria-labelledby="charges-title">
      <div className="section-heading">
        <p className="eyebrow">附加费用</p>
        <h2 id="charges-title">服务费、优惠与抹零</h2>
      </div>

      <div className="charges-grid">
        {fields.map((field) => (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            <input
              type="number"
              inputMode="decimal"
              step={field.step ?? '0.01'}
              value={charges[field.key]}
              onChange={(event) => updateCharge(field.key, event.target.value)}
            />
            <small>{field.hint}</small>
          </label>
        ))}
      </div>
    </section>
  )
}
