import type { BillItem, Participant, SplitResult } from '../types'
import { formatMoney } from '../lib/money'
import { PersonSummaryCard } from './PersonSummaryCard'
import { ShareSummaryButton } from './ShareSummaryButton'

interface SplitSummaryProps {
  result: SplitResult
  items: BillItem[]
  participants: Participant[]
  notice: string
  onCopied: (message: string) => void
}

export function SplitSummary({ result, items, participants, notice, onCopied }: SplitSummaryProps) {
  return (
    <section className="panel summary-panel" aria-labelledby="summary-title">
      <div className="section-heading">
        <p className="eyebrow">结算台</p>
        <h2 id="summary-title">本次每人应付</h2>
      </div>

      <div className="total-ticket" aria-live="polite">
        <span>最终账单总额</span>
        <strong>{formatMoney(result.finalTotal)}</strong>
      </div>

      <dl className="totals-list">
        <div>
          <dt>菜品原始总额</dt>
          <dd>{formatMoney(result.itemSubtotal)}</dd>
        </div>
        <div>
          <dt>税费</dt>
          <dd>{formatMoney(result.tax)}</dd>
        </div>
        <div>
          <dt>服务费</dt>
          <dd>{formatMoney(result.serviceFee)}</dd>
        </div>
        <div>
          <dt>小费</dt>
          <dd>{formatMoney(result.tip)}</dd>
        </div>
        <div>
          <dt>优惠合计</dt>
          <dd>-{formatMoney(result.discountTotal)}</dd>
        </div>
        <div>
          <dt>抹零/调整</dt>
          <dd>{formatMoney(result.adjustment)}</dd>
        </div>
      </dl>

      <ShareSummaryButton result={result} items={items} participants={participants} onCopied={onCopied} />
      {notice ? <p className="success-note" role="status">{notice}</p> : null}

      <div className="people-results">
        {result.people.length === 0 ? (
          <p className="empty-state">先添加参与人和菜品，结算结果会显示在这里。</p>
        ) : (
          result.people.map((person) => <PersonSummaryCard key={person.participantId} person={person} />)
        )}
      </div>
    </section>
  )
}
