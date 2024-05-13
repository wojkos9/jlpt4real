import Kuroshiro, { System } from 'kuroshiro'
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, useMemo } from 'react'
import Tile from './Tile'
import { useTheme } from './theme'
import { AutoSuggestion } from './AutoSuggestion'


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

function allRom(k: Kanji, system?: System) {
  return k.on.map(o => unique(rom(o, system))).reduce((x, y) => x.concat(y))
}

function QuizRow({ kanji: k, onClick, solved, active }: QuizRowProps) {
  const roms = allRom(k, "hepburn")
  const theme = useTheme()
  const activeStyle: React.CSSProperties = {
    outlineColor: theme.accent,
    outlineWidth: 4,
    outlineStyle: 'solid'
  }
  return (
    <div className='flex border border-gray-200 w-32 text-sm hover:bg-gray-400 cursor-pointer select-none' onClick={onClick}
    style={active ? activeStyle : undefined}>
      <div className='border-e border-gray-200 p-1 font-[KanjiChart]'>{k.char}</div>
      {solved && <div className='p-1 line-clamp-1'>{roms.join("/")}</div>}
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
  const theme = useTheme()
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
          <AutoSuggestion words={d.options} onChange={onChange} minChars={2} aRef={refs[i]} />
          :
          <input
            className='border-2 m-1 border-gray-400 rounded text-lg bg-transparent focus:outline-none text-center w-16 h-10'
            type="text"
            key={i}
            readOnly={completed[i]}
            style={{borderColor: completed[i] ? "red" : theme.highlight, width: d.width}}
            onChange={onChange}
            ref={refs[i]}
          />
      }) }
    </div>
  )
}

export default function QuizScreen({ kanjiRange }: QuizScreenProps) {
  const [current, setCurrent] = useState(0)
  const [solved, setSolved] = useState<{[x: string]: boolean}>({})
  const [kanjis, setKanjis] = useState(kanjiRange)
  const theme = useTheme()
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

  let hintText: string = useMemo(() =>
    `${kanji.meaning} (${kanji.on.join(", ")})`
  , [kanji])

  function shuffle() {
    setKanjis(Array.from(kanjis).sort(() => Math.random() - 0.5))
  }
  useEffect(() => setCurrent(0), [kanjis])
  useEffect(() => setKanjis(kanjiRange), [kanjiRange])

  function QuizArea() {
    const [hint, setHint] = useState(false)
    const data: InputData[] = [
      { options: allRom(kanji), width: "4rem" },
      { options: kanji.meaning, width: "8rem", autosuggestion: true }
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
      <div className='flex items-center h-min gap-4'>
        <Tile kanji={kanji} />
        {hint && hintText}
        <div onKeyDown={checkMod} onKeyUp={checkMod}>
          <Inputs data={data} onComplete={nextKanji} />
        </div>
        <button className='bg-gray-500' onClick={shuffle}>Random</button>
      </div>
    )
  }

  return (
    <div
      className='h-screen flex flex-col items-center gap-4'
      style={{backgroundColor: theme.surface}}
    >
      <QuizArea />
      <div className='w-full flex flex-col flex-wrap min-h-0'>
        {
          kanjis.map((k, i) => <QuizRow kanji={k} active={i == current} solved={solved[k.char]} onClick={() => {
            setCurrent(i)
            setSolved({...solved, [k.char]: false})
            input1.current!.value = ""
            input1.current!.focus()
          }} />)
        }
      </div>
    </div>
  )
}