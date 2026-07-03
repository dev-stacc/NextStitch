'use client'

interface TabDef<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  tabs: readonly TabDef<T>[]
  active: T
  onChange: (value: T) => void
}

export default function Tabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div role="tablist" className="tabs tabs-border shrink-0">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="tab"
          className={`tab ${active === value ? 'tab-active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
