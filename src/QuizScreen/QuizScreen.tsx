import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { useTheme } from '../theme'
import { ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/react/24/solid'

import trans from '../assets/trans.json'
import { allRom, getOn, rotArray, splitBy } from '../Utils'
import QuizArea from './QuizArea'

type QuizScreenProps = {
  kanjiRange: Kanji[]
  level: Level
}

interface QuizRowProps {
  kanji: Kanji
  onClick: () => void
  solved: boolean
  active: boolean
}

function QuizRow({ kanji: k, onClick, solved, active }: QuizRowProps) {
  const roms = allRom(getOn(k), "hepburn")
  const theme = useTheme()
  const activeStyle: React.CSSProperties = {
    borderColor: theme.highlight
  }
  return (
    <div className='flex border border-n-highlight rounded mb-1 me-1 w-60 h-12 text-xl hover:bg-n-highlight select-none' onClick={onClick}
    style={active ? activeStyle : undefined}>
      <div className='border-e border-n-highlight p-1 font-[KanjiChart] flex items-center'>{k.char}</div>
      {solved && <div className='p-1 flex items-center line-clamp-1 border-n-highlight border-e w-20'>{roms[0]}</div>}
      {solved && <div className='p-1 flex items-center text-base flex-1'>{getMeaning(k)[0]}</div>}
    </div>
  )
}

export function getMeaning(k: Kanji) {
  return  [trans[k.char as keyof typeof trans][0]] // [meaning[k.char as any as keyof typeof meaning]]
}



export default function QuizScreen({ kanjiRange, level }: QuizScreenProps) {
  const [current, setCurrent] = useState(0)
  const [solved, setSolved] = useState<{[x: string]: boolean}>({})
  const [kanjis, setKanjis] = useState(kanjiRange)
  const input1 = useRef<HTMLInputElement>(null)

  const kanji = kanjis[current]

  function findKanji(start: number, dir: 1 | -1 = 1) {
    return rotArray(kanjis, k => !solved[k.char], start, dir)
  }

  function shuffle() {
    setKanjis(Array.from(kanjis).sort(() => Math.random() - 0.5))
  }
  useEffect(() => setCurrent(0), [kanjis])
  useEffect(() => setKanjis(kanjiRange), [kanjiRange])

  const [cheat, setCheat] = useState(false)



  function shuffleRange(kanjiStart: number, kanjiEnd: number) {
    const slice = kanjis.slice(kanjiStart, kanjiEnd)
    const newKanjis = kanjis.slice(0, kanjiStart).concat(slice.sort(() => Math.random() - 0.5)).concat(kanjis.slice(kanjiEnd, kanjis.length))
    setKanjis(newKanjis)
  }

  function QuizColumn({ kanjiRange }: { kanjiRange: Kanji[] }) {
    const kanjiStart = kanjis.indexOf(kanjiRange[0])
    const kanjiEnd = kanjis.indexOf(kanjiRange[kanjiRange.length - 1])
    const colKanjis = kanjis.slice(kanjiStart, kanjiEnd + 1)

    function clear() {
      const newSolved = {...solved}
      colKanjis.forEach(k => newSolved[k.char] = false)
      setSolved(newSolved)
    }

    return (
      <div className='flex flex-col'>
        <div className='flex'>
          <div
            className='flex-1 flex items-center justify-center rounded hover:bg-n-accent active:bg-n-highlight m-px cursor-pointer'
            onClick={() => shuffleRange(kanjiStart, kanjiEnd)}
          >
            <ArrowsRightLeftIcon className='size-6 rounded-full bg-n-highlight p-1 m-1' />
          </div>
          <div
            className='flex-1 flex items-center justify-center rounded hover:bg-n-accent active:bg-n-highlight m-px cursor-pointer'
            onClick={() => clear()}
          >
            <XMarkIcon className='size-6 rounded-full bg-n-highlight p-1 m-1'/>
          </div>
        </div>
        {
          colKanjis.map(k => (
            <QuizRow key={k.char} kanji={k} active={k == kanji} solved={solved[k.char] || cheat} onClick={() => {
              setCurrent(kanjis.indexOf(k))
              input1.current!.value = ""
              input1.current!.focus()
            }} />
          ))
        }
      </div>
    )
  }

  const solve = (c: string, b: boolean) => setSolved({...solved, [c]: b})

  const nextKanji = useCallback((skip: boolean = false, dir: 1 | -1 = 1) => {
    if (current < kanjis.length) {
      if (!skip) {
        solve(kanji.char, true)
      }
      setCurrent(findKanji(current, dir))
    }
  }, [kanji])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key == "Delete") {
      solve(kanji.char, false)
    } else if (e.key == "ArrowDown" && e.type == "keydown") {
      setCurrent(current == kanjis.length - 1 ? 0 : current + 1)
    } else if (e.key == "ArrowUp" && e.type == "keydown") {
      setCurrent(current == 0 ? kanjis.length - 1 : current - 1)
    }
  }, [kanji])

  return (
    <div className='h-screen flex flex-col items-center bg-surface'>
      <QuizArea
        kanji={kanji}
        shuffle={shuffle}
        nextKanji={nextKanji}
        handleKey={handleKey}
        updateCheat={setCheat}
      />
      <div className='w-full flex min-h-0'>
        {
          splitBy(kanjis, 16).map(r => <QuizColumn key={r[0].char} kanjiRange={r} />)
        }
      </div>
    </div>
  )
}