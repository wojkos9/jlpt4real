import { useEffect, useMemo, useState } from "react"

export function Toggle({ on, onChange }: { on?: boolean, onChange: (c: boolean) => void }) {
  const [checked, setChecked] = useState(on ?? false)
  useEffect(() => {
    setChecked(on ?? false)
  }, [on])
  return (
    <div
      className={`transition-all duration-200 border-2 border-highlight rounded-full h-7 aspect-[13/7] inline-flex ${checked ? "bg-accent" : "bg-transparent"}`}
      onClick={() => {
        setChecked(!checked)
        onChange(!checked)
      }}
    >
      <div
        className="my-[3px] transition-all duration-200 bg-highlight rounded-full aspect-square"
        style={{
          translate: checked ? 27 : 3
        }}
      />
    </div>
  )
}