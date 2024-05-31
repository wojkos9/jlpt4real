import { useTheme } from "./theme"

type TileProps = {
  kanji: Kanji
  isOdd?: boolean
  onClick?: () => void
  current?: boolean
  showHint?: boolean
}

export default function Tile({ kanji, isOdd, onClick, current, showHint }: TileProps) {
  const theme = useTheme()
  return (
    <div className='w-12 inline-flex flex-col align-middle m-[2px] cursor-pointer font-[KanjiChart]'>
      <div
        className="h-12 flex border-2 border-n-highlight rounded-lg text-[42px] justify-center items-center transition duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.6)]"
        style={{
          backgroundColor: (isOdd ? theme.accent : undefined),
          borderColor: current ? theme.highlight : undefined
        }}
        onClick={onClick}
      >
        {kanji.char}
      </div>
      {showHint &&
        <a className='text-center text-xs text-slate-600'>{kanji.on.length == 0 ? "-" : kanji.on[0]}</a>
      }
    </div>
  )
}