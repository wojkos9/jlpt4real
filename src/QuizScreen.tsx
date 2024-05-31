import Kuroshiro, { System } from 'kuroshiro'
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, useMemo } from 'react'
import Tile from './Tile'
import { useTheme } from './theme'
import { AutoSuggestion } from './AutoSuggestion'
import meaning from './assets/kanji_meaning.json'
import KanjiCard from './KanjiCard'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid'

function splitBy<T>(array: T[], n: number) {
  const ranges: T[][] = []
  for (let i = 0; i < array.length; i += n) {
    ranges.push(array.slice(i, Math.min(i + n, array.length)))
  }
  return ranges
}

function rom(x: string, system?: System) {
  const systems: System[] = system ? [system] : ["nippon", "hepburn"]
  return systems.map(r => Kuroshiro.Util.kanaToRomaji(x, r))
}

type QuizScreenProps = {
  kanjiRange: Kanji[]
}

interface QuizRowProps {
  kanji: Kanji
  onClick: () => void
  solved: boolean
  active: boolean
}


function unique<T>(x: T[]): T[] {
  return Array.from(new Set(x))
}

function allRom(readings: string[], system?: System) {
  return readings.map(o => unique(rom(o, system))).reduce((x, y) => x.concat(y))
}

function QuizRow({ kanji: k, onClick, solved, active }: QuizRowProps) {
  const roms = allRom(getOn(k), "hepburn")
  const theme = useTheme()
  const activeStyle: React.CSSProperties = {
    borderColor: theme.highlight
  }
  return (
    <div className='flex border-2 border-n-highlight rounded m-px w-60 h-12 text-xl hover:bg-n-highlight select-none' onClick={onClick}
    style={active ? activeStyle : undefined}>
      <div className='border-e-2 border-n-highlight p-1 font-[KanjiChart] flex items-center'>{k.char}</div>
      {solved && <div className='p-1 flex items-center line-clamp-1 border-n-highlight border-e-2 w-20'>{roms[0]}</div>}
      {solved && <div className='p-1 flex items-center text-base flex-1'>{getMeaning(k)[0]}</div>}
    </div>
  )
}

enum CheckResult {
  INCORRECT, CORRECT_ONE, CORRECT_MANY
}

function yomiMatches(a: string, b: string) {
  // if (["ku", "su"].some(e => b.startsWith(a) && b.endsWith(e) && a.length == b.length - 1)) {
  //   return true
  // }
  return a == b
}

function checkAnswer(valids: string[], ans: string): CheckResult {
  if (!valids.some(r => yomiMatches(ans, r))) {
    return CheckResult.INCORRECT
  } else if (valids.some(r => !yomiMatches(ans, r) && r.startsWith(ans))) {
    return CheckResult.CORRECT_MANY
  }
  return CheckResult.CORRECT_ONE
}

interface InputData {
  options: string[]
  width: React.CSSProperties["width"]
  autosuggestion?: boolean
}

interface InputsProps {
  data: InputData[]
  onComplete: () => void
}

function rotArray<T>(array: T[], predicate: (t: T) => boolean, start: number, dir: 1 | -1 = 1) {
  function rot1(i: number) {
    return (i + dir + array.length) % array.length
  }

  for (let i = rot1(start); i != start; i = rot1(i)) {
    if (predicate(array[i])) {
      return i
    }
  }
  return start
}

function Inputs({ data, onComplete }: InputsProps) {
  const refs = data.map(() => useRef<HTMLInputElement>(null))
  const [completed, setCompleted] = useState(data.map(() => false))

  useEffect(() => {
    if (completed.every(x => x)) {
      onComplete()
    }
  }, [completed])

  useEffect(() => {
    refs[0].current!.focus()
  }, [])

  function nextUncompleted(index: number) {
    return rotArray(data.map((_, i) => i), i => !completed[i], index)
  }

  function checkInput(index: number, options: string[], e: ChangeEvent<HTMLInputElement>) {
    const answer = e.target.value
    if (checkAnswer(options, answer) == CheckResult.CORRECT_ONE) {
      // e.target.value = ""
      if (completed.some(x => !x)) {
        setCompleted([...completed.slice(0, index), true, ...completed.slice(index+1)])
        refs[nextUncompleted(index)].current!.focus()
      } else {
        onComplete()
      }
    }
  }

  return (
    <div>
      { data.map((d, i) => {
        const onChange = (e: ChangeEvent<HTMLInputElement>) => checkInput(i, d.options, e)
        return d.autosuggestion ?
          <AutoSuggestion className='border-2 m-1 rounded border-highlight w-24' words={d.options} onChange={onChange} minChars={2} aRef={refs[i]} />
          :
          <input
            className='border-2 m-1 p-1 rounded text-lg bg-transparent border-highlight focus:outline-none w-16 h-10'
            type="text"
            key={i}
            readOnly={completed[i]}
            onChange={onChange}
            ref={refs[i]}
          />
      }) }
    </div>
  )
}

function getMeaning(k: Kanji) {
  return [meaning[k.char as any as keyof typeof meaning]]
}

function getOn(k: Kanji) {
  return k.on.slice(0, 1)
}

export default function QuizScreen({ kanjiRange }: QuizScreenProps) {
  const [current, setCurrent] = useState(0)
  const [solved, setSolved] = useState<{[x: string]: boolean}>({})
  const [kanjis, setKanjis] = useState(kanjiRange)
  const input1 = useRef<HTMLInputElement>(null)

  const kanji = kanjis[current]

  function findKanji(start: number, dir: 1 | -1 = 1) {
    return rotArray(kanjis, k => !solved[k.char], start, dir)
  }

  function nextKanji(skip: boolean = false, dir: 1 | -1 = 1) {
    if (current < kanjis.length) {
      if (!skip) {
        setSolved({...solved, [kanji.char]: true})
      }
      setCurrent(findKanji(current, dir))
    }
  }

  function shuffle() {
    setKanjis(Array.from(kanjis).sort(() => Math.random() - 0.5))
  }
  useEffect(() => setCurrent(0), [kanjis])
  useEffect(() => setKanjis(kanjiRange), [kanjiRange])
  const [hint, setHint] = useState(false)
  const [cheat, setCheat] = useState(true)

  function QuizArea() {

    const data: InputData[] = [
      { options: allRom(getOn(kanji)), width: "4rem" },
      { options: getMeaning(kanji), width: "8rem", autosuggestion: true }
    ]

    function checkMod(e: KeyboardEvent<HTMLInputElement>) {
      console.log(e)
      if (e.key == "Tab" && e.type == "keydown") {
        e.preventDefault()
      } else if (e.key == "Alt") {
        e.preventDefault()
        setHint(e.type == "keydown")
      } else if (e.key == "Delete") {
        setSolved({...solved, [kanji.char]: false})
      } else if (e.key == "ArrowDown" && e.type == "keydown") {
        setCurrent(current == kanjis.length - 1 ? 0 : current + 1)
      } else if (e.key == "ArrowUp" && e.type == "keydown") {
        setCurrent(current == 0 ? kanjis.length - 1 : current - 1)
      }
    }

    return (
      <div className='flex items-center gap-4'>
        <Tile kanji={kanji} />
        <div onKeyDown={checkMod} onKeyUp={checkMod}>
          <Inputs data={data} onComplete={nextKanji} />
        </div>
        <button className='bg-n-accent border border-n-highlight p-1 rounded' onClick={shuffle}>Random</button>
        <input key="check" id="hint" type="checkbox" onChange={e => setCheat(e.target.checked) } checked={cheat} />
        <label htmlFor="hint">cheat</label>
        { hint &&
          <div className='absolute top-14 rounded-md bg-accent'>
          <KanjiCard kanji={kanji} onlyMeta />
        </div> }
      </div>
    )
  }

  function shuffleRange(kanjiStart: number, kanjiEnd: number) {
    const slice = kanjis.slice(kanjiStart, kanjiEnd)
    const newKanjis = kanjis.slice(0, kanjiStart).concat(slice.sort(() => Math.random() - 0.5)).concat(kanjis.slice(kanjiEnd, kanjis.length))
    setKanjis(newKanjis)
  }

  function QuizColumn({ kanjiRange }: { kanjiRange: Kanji[] }) {
    const kanjiStart = kanjis.indexOf(kanjiRange[0])
    const kanjiEnd = kanjis.indexOf(kanjiRange[kanjiRange.length - 1])
    const colKanjis = kanjis.slice(kanjiStart, kanjiEnd)

    return (
      <div className='flex flex-col'>
        <div
          className='flex items-center justify-center rounded hover:bg-n-accent active:bg-highlight m-px cursor-pointer'
          onClick={() => shuffleRange(kanjiStart, kanjiEnd)}
        >
          <ArrowsRightLeftIcon className='size-6 rounded-full bg-n-highlight p-1 m-1' />
        </div>
        {
          colKanjis.map(k => (
            <QuizRow kanji={k} active={k == kanji} solved={solved[k.char] || cheat} onClick={() => {
              setCurrent(kanjis.indexOf(k))
              setSolved({ ...solved, [k.char]: false })
              input1.current!.value = ""
              input1.current!.focus()
            }} />
          ))
        }
      </div>
    )
  }



  return (
    <div className='h-screen flex flex-col items-center bg-surface'>
      <QuizArea />
      <div className='w-full flex min-h-0'>
        {
          splitBy(kanjis, 16).map(r => <QuizColumn kanjiRange={r} />)
        }
      </div>
    </div>
  )
}