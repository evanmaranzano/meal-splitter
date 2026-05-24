import type { PersonSplit } from '../types'
import { formatMoney } from '../lib/money'

interface PersonSummaryCardProps {
  person: PersonSplit
}

export function PersonSummaryCard({ person }: PersonSummaryCardProps) {
  return (
    <article className="person-card">
      <div className="person-card__topline">
        <div>
          <p className="eyebrow">应付人</p>
          <h3>{person.name}</h3>
        </div>
        <strong>{formatMoney(person.total)}</strong>
      </div>

      <dl className="split-grid">
        <div>
          <dt>菜品小计</dt>
          <dd>{formatMoney(person.itemSubtotal)}</dd>
        </div>
        <div>
          <dt>税费</dt>
          <dd>{formatMoney(person.taxShare)}</dd>
        </div>
        <div>
          <dt>服务费</dt>
          <dd>{formatMoney(person.serviceFeeShare)}</dd>
        </div>
        <div>
          <dt>小费</dt>
          <dd>{formatMoney(person.tipShare)}</dd>
        </div>
        <div>
          <dt>优惠</dt>
          <dd>{formatMoney(person.discountShare)}</dd>
        </div>
        <div>
          <dt>调整</dt>
          <dd>{formatMoney(person.adjustmentShare)}</dd>
        </div>
      </dl>

      <details className="item-details">
        <summary>查看分摊明细</summary>
        {person.items.length === 0 ? (
          <p className="muted">未参与任何项目。</p>
        ) : (
          <ul>
            {person.items.map((item) => (
              <li key={item.itemId}>
                <span>{item.name}</span>
                <span>
                  {formatMoney(item.share)} / {item.participantCount}人
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </article>
  )
}
