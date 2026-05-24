import type { BillItem, Participant, SplitResult } from '../types'
import { formatMoney } from '../lib/money'

interface ShareSummaryButtonProps {
  result: SplitResult
  items: BillItem[]
  participants: Participant[]
  onCopied: (message: string) => void
}

const describeParticipants = (item: BillItem, participants: Participant[]) => {
  const names = item.participantIds
    .map((id) => participants.find((participant) => participant.id === id)?.name)
    .filter(Boolean)

  if (names.length === participants.length && participants.length > 1) {
    return `${names.length}人平分`
  }

  if (names.length === 1) {
    return `${names[0]}承担`
  }

  return `${names.join('、')}平分`
}

export function ShareSummaryButton({ result, items, participants, onCopied }: ShareSummaryButtonProps) {
  const handleCopy = async () => {
    const lines = [
      '聚餐账单拆分结果',
      `最终账单总额：${formatMoney(result.finalTotal)}`,
      ...result.people.map((person) => `${person.name}：${formatMoney(person.total)}`),
      '',
      '明细：',
      ...items.map(
        (item) =>
          `- ${item.name}：${formatMoney(Math.round(item.price * item.quantity * 100))}，${describeParticipants(
            item,
            participants,
          )}`,
      ),
    ]

    if (!navigator.clipboard) {
      onCopied('当前浏览器不支持自动复制，请手动选择并复制。')
      return
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      onCopied('结算结果已复制')
    } catch {
      onCopied('复制失败，请检查浏览器剪贴板权限。')
    }
  }

  return (
    <button type="button" className="primary-action" onClick={handleCopy} disabled={result.finalTotal === 0}>
      复制结算结果
    </button>
  )
}
