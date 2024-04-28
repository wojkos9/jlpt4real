import Kuroshiro from 'kuroshiro'
import { useState, useRef } from 'react'
import Tile from './Tile'
import { useTheme } from './theme'


function rom(x: string) {
  return Kuroshiro.Util.kanaToRomaji(x, "nippon")
}

type QuizScreenProps = {
  kanjiRange: Kanji[]
}

export default function QuizScreen({ kanjiRange }: QuizScreenProps) {
  const [current, setCurrent] = useState(0)
  const theme = useTheme()
  const ref = useRef<HTMLInputElement>(null)

  function nextKanji() {
    if (current < kanjiRange.length) {
      setCurrent(current + 1)
    }
  }

  const kanji = kanjiRange[current]
  return (
    <div
      className='h-screen flex justify-center items-center gap-4'
      style={theme.surface}
    >
      <Tile kanji={kanji} />
      <div>{rom(kanji.on[0])}</div>
      <form onSubmit={e => {
        e.preventDefault()
        nextKanji()
        ref.current!.value = ""
      }}>
      <input
        className='border-2 border-gray-400 rounded text-lg bg-transparent focus:outline-none text-center w-20 h-10'
        type="text"
        autoFocus
        style={{borderColor: theme.highlight.backgroundColor}}
        ref={ref}
      />
      </form>
    </div>
  )
}