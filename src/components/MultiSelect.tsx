'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string[]
  onChange: (val: string[]) => void
  options: { value: string; label: string }[]
  placeholder?: string
  style?: React.CSSProperties
}

export default function MultiSelect({ value, onChange, options, placeholder, style }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }

  const todosSeleccionados = value.length === options.length

  const texto = !value.length ? (placeholder || 'Seleccionar') : value.length === 1 ? (options.find(o => o.value === value[0])?.label || value[0]) : 'Selec mult'

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <div style={{ display: 'flex', gap: 2, width: '100%' }}>
        <div onClick={() => setOpen(!open)}
          style={{ flex: 1, minWidth: 0, padding: '8px 12px', border: '1px solid #3a3a3a', borderRadius: '6px 0 0 6px', background: '#2B2B2B', color: value.length ? '#F2EFE9' : '#888', fontSize: 14, cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{texto}</span>
          <span style={{ fontSize: 10, color: '#888', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
        </div>
        {value.length > 0 && (
          <div onClick={() => onChange([])}
            style={{ padding: '8px 10px', border: '1px solid #3a3a3a', borderLeft: 'none', borderRadius: '0 6px 6px 0', background: '#2B2B2B', color: '#e74c3c', fontSize: 14, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
            ✕
          </div>
        )}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#2B2B2B', border: '1px solid #3a3a3a', borderRadius: 6, marginTop: 4, maxHeight: 200, overflowY: 'auto', zIndex: 1000 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', color: '#C8862B', fontSize: 14, borderBottom: '1px solid #3a3a3a', fontWeight: 600 }}>
            <input type="checkbox" checked={todosSeleccionados} onChange={() => onChange(todosSeleccionados ? [] : options.map(o => o.value))}
              style={{ accentColor: '#C8862B' }} />
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </label>
          {options.map(o => (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', color: '#F2EFE9', fontSize: 14, borderBottom: '1px solid #3a3a3a' }}>
              <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)}
                style={{ accentColor: '#C8862B' }} />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
