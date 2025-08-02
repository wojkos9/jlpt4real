import { HTMLAttributes } from "react"
import { themes, useTheme } from "../theme"

interface TileProps extends HTMLAttributes<HTMLDivElement> {
  kanji: string
  isOdd?: boolean
  onClick?: () => void
  onMouseOver?: () => void
  current?: boolean
  size: number
  level?: Level
}

export default function Tile({ kanji, isOdd, current, size, level, className, style, ...rest }: TileProps) {
  const wh = Math.round(size / 4 * 100) / 100
  const fs = (wh - 0.5) / 2.5 * 42
  const theme = useTheme()
  const tileTheme = level ? themes[level] : theme
  return (
      <div
        className={`inline-flex flex-col justify-center items-center p-1 cursor-pointer font-[KanjiChart] border-2 border-n-highlight rounded-lg transition duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.6)] ${className}`}
        style={{
          backgroundColor: (isOdd ? theme.accent : undefined),
          borderColor: current ? tileTheme.highlight : undefined,
          borderWidth: current ? 3 : undefined,
          width: `${wh}rem`,
          height: `${wh}rem`,
          fontSize: `${fs}px`,
          ...style
        }}
        {...rest}
      >
        {kanji}
    </div>
  )
}