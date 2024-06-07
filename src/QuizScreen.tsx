import Kuroshiro, { System } from 'kuroshiro'
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, useMemo } from 'react'
import Tile from './Tile'
import { themes, useTheme } from './theme'
import { AutoSuggestion } from './AutoSuggestion'
import meaning from './assets/kanji_meaning.json'
import KanjiCard from './KanjiCard'
import { ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/react/24/solid'
import krad from './assets/kradfile.json'
import jlpt from './assets/jlpt.json'
import trans from './assets/trans.json'

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
  level: Level
}

interface QuizRowProps {
  kanji: Kanji
  onClick: () => void
  solved: boolean
  active: boolean
}

interface JLPTKanji extends Kanji {
  level: Level
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
    <div className='flex border border-n-highlight rounded mb-1 me-1 w-60 h-12 text-xl hover:bg-n-highlight select-none' onClick={onClick}
    style={active ? activeStyle : undefined}>
      <div className='border-e border-n-highlight p-1 font-[KanjiChart] flex items-center'>{k.char}</div>
      {solved && <div className='p-1 flex items-center line-clamp-1 border-n-highlight border-e w-20'>{roms[0]}</div>}
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
  width: string
  autosuggestion?: boolean
}

interface InputsProps {
  data: InputData[]
  cheat: boolean
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

function Inputs({ data, onComplete, cheat }: InputsProps) {
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
    return rotArray(data.map((_, i) => i), i => !completed[i] || cheat, index)
  }

  function onCorrectAnswer(index: number) {
    if (completed.some(x => !x)) {
      setCompleted([...completed.slice(0, index), true, ...completed.slice(index+1)])
      refs[nextUncompleted(index)].current!.focus()
    } else {
      onComplete()
    }
  }

  function checkInput(index: number, options: string[], e: HTMLInputElement, force?: boolean) {
    const answer = e.value
    const ans = checkAnswer(options, answer)
    if (ans == CheckResult.CORRECT_ONE || ans == CheckResult.CORRECT_MANY && force) {
      // e.target.value = ""
      onCorrectAnswer(index)
    }
  }

  return (
    <div>
      { data.map((d, i) => {
        const onChange = (e: HTMLInputElement, force?: boolean) => checkInput(i, d.options, e, force)
        return (
          <AutoSuggestion
            width={d.width}
            filledIn={d.autosuggestion ? i > 0 && completed[i-1] : cheat}
            className='border-2 m-1 rounded border-highlight'
            words={d.options} onChange={onChange}
            minChars={d.autosuggestion ? 2 : 10}
            aRef={refs[i]} />
        )

      }) }
    </div>
  )
}

export function getMeaning(k: Kanji) {
  return  [trans[k.char][0]] // [meaning[k.char as any as keyof typeof meaning]]
}

function getOn(k: Kanji) {
  return k.on //.slice(0, 1)
}

function SimilarRow({ kanji }: { kanji: JLPTKanji }) {
  return (
    <tr className='text-nowrap'>
      <td style={{backgroundColor: themes[kanji.level].highlight}}>{kanji.char}</td>
      <td className='px-2'>{kanji.on[0]}</td>
      <td className='px-2'>{kanji.meaning.join(",")}</td>
    </tr>
  )
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
  const [cheat, setCheat] = useState(false)

  function QuizArea() {
    const [radicals, setRadicals] = useState<string[]>([])
    const [similar, setSimilar] = useState<JLPTKanji[]>([])

    useEffect(() => {
      if (radicals.length) {
        let similarChars = Object.entries(krad).filter(
          ([_, v]) => radicals.every(r => v.includes(r))
        ).map(([k, _]) => k)

        const similarKanji: JLPTKanji[] = []
        const levels: Level[] = ["N5", "N4", "N3", "N2"]
        for (const lvl of levels) {
          for (const k of jlpt[lvl]) {
            if (similarChars.includes(k.char)) {
              similarKanji.push({...k, level: lvl})
              similarChars = similarChars.filter(c => c != k.char)
            }
          }

          // if (lvl == level) {
          //   break
          // }
        }
        setSimilar(similarKanji.reverse())
      }
    }, [radicals])

    const data: InputData[] = [
      { options: allRom(getOn(kanji)), width: "4rem" },
      { options: getMeaning(kanji), width: "8rem", autosuggestion: true }
    ]

    function checkMod(e: KeyboardEvent<HTMLInputElement>) {
      console.log(e)
      if (e.key == "Tab" && e.type == "keydown") {
        e.preventDefault()
      } else if (e.key == "ArrowRight") {
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

    function toggleRadical(r: string) {
      if (radicals.includes(r)) {
        setRadicals(radicals.filter(e => e != r))
      } else {
        setRadicals([...radicals, r])
      }
    }

    return (
      <div className='flex items-center gap-4'>
        <div className='flex h-14 flex-col flex-wrap-reverse'>
          {
            krad[kanji.char as keyof typeof krad].map(r => (
              <Tile kanji={r} size={7} current={radicals.includes(r)} onClick={() => toggleRadical(r)}/>
            ))
          }
        </div>
        <Tile kanji={kanji.char} size={14} />
        <div onKeyDown={checkMod} onKeyUp={checkMod}>
          <Inputs data={data} cheat={cheat} onComplete={nextKanji} />
        </div>
        <button className='bg-n-accent border border-n-highlight p-1 rounded' onClick={shuffle}>Random</button>
        <input key="check" id="hint" type="checkbox" onChange={e => setCheat(e.target.checked) } checked={cheat} />
        <label htmlFor="hint">cheat</label>
        { hint &&
          <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight'>
          <KanjiCard kanji={kanji} onlyMeta />
        </div> }
        { radicals.length > 0 &&
          <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight max-h-96 overflow-scroll'>
            <table>
            {similar.map(s => <SimilarRow kanji={s}/>)}
            </table>
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