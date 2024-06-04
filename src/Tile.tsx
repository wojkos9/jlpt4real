import { CSSProperties } from "react"
import { useTheme } from "./theme"

type TileProps = {
  kanji: string
  isOdd?: boolean
  onClick?: () => void
  onMouseOver?: () => void
  current?: boolean
  size: number
  className?: string
}

export default function Tile({ kanji, isOdd, onClick, onMouseOver, current, size, className }: TileProps) {
  const wh = Math.round(size / 4 * 100) / 100
  const fs = (wh - 0.5) / 2.5 * 42
  const theme = useTheme()
  return (
      <div
        className={`inline-flex flex-col justify-center items-center p-1 cursor-pointer font-[KanjiChart] border-2 border-n-highlight rounded-lg transition duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.6)] ${className}`}
        style={{
          backgroundColor: (isOdd ? theme.accent : undefined),
          borderColor: current ? theme.highlight : undefined,
          width: `${wh}rem`,
          height: `${wh}rem`,
          fontSize: `${fs}px`
        }}
        onClick={onClick}
        onMouseOver={onMouseOver}
      >
        {kanji}
    </div>
  )
}