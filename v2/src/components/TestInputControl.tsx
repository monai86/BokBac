import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'

interface TestInputControlProps {
  testId: string
  value?: string
  onChange: (value: string | null) => void
  label?: string
  options?: string[]
  layout?: 'compact' | 'fill'
  ariaPrefix?: string
}

export function TestInputControl({
  testId,
  value = '',
  onChange,
  label,
  options,
  layout = 'compact',
  ariaPrefix = 'Set',
}: TestInputControlProps) {
  const definition = lookupTestDefinition(testId)
  const displayLabel = label || definition?.label || testId

  if (!definition) {
    return (
      <span
        role="status"
        className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-200"
      >
        Missing registry: {testId}
      </span>
    )
  }

  const buttonBase =
    layout === 'fill'
      ? 'flex-1 wf-opt-btn py-1.5'
      : 'min-w-[28px] wf-opt-btn px-2 py-0.5 text-center flex items-center justify-center'

  return (
    <div className={`flex flex-wrap items-center ${layout === 'fill' ? 'gap-1.5' : 'gap-1'}`}>
      {(options || definition.options).map((option) => {
        const isSelected = value === option
        return (
          <button
            type="button"
            key={option}
            aria-label={`${ariaPrefix} ${displayLabel} to ${option}`}
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? null : option)}
            className={`${buttonBase} ${isSelected ? 'selected' : ''}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
