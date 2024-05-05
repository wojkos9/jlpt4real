import Kuroshiro, { System } from 'kuroshiro'
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, useMemo } from 'react'
import Tile from './Tile'
import { useTheme } from './theme'


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

function checkAnswer(k: Kanji, ans: string): CheckResult {
  const roms = allRom(k)
  if (!roms.some(r => yomiMatches(ans, r))) {
    return CheckResult.INCORRECT
  } else if (roms.some(r => !yomiMatches(ans, r) && r.startsWith(ans))) {
    return CheckResult.CORRECT_MANY
  }
  return CheckResult.CORRECT_ONE
}

export default function QuizScreen({ kanjiRange }: QuizScreenProps) {
  const [current, setCurrent] = useState(0)
  const [solved, setSolved] = useState<{[x: string]: boolean}>({})
  const [hint, setHint] = useState(false)
  const theme = useTheme()
  const inputBox = useRef<HTMLInputElement>(null)

  const kanji = kanjiRange[current]

  function rot1(i: number, dir: 1 | -1) {
    return (i + dir + kanjiRange.length) % kanjiRange.length
  }

  function nextKanji(skip: boolean = false, dir: 1 | -1 = 1) {
    if (current < kanjiRange.length) {
      if (!skip) {
        setSolved({...solved, [kanji.char]: true})
      }
      for (let i = rot1(current, dir); i != current; i = rot1(i, dir)) {
        if (!solved[kanjiRange[i].char]) {
          setCurrent(i)
          break
        }
      }
    }
  }

  function checkInput(e: ChangeEvent<HTMLInputElement>) {
    const answer = e.target.value
    if (checkAnswer(kanji, answer) == CheckResult.CORRECT_ONE) {
      nextKanji()
      e.target.value = ""
    }
  }

  function checkMod(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Tab" && e.type == "keydown") {
      e.preventDefault()
      if (e.shiftKey) {
        nextKanji(true, -1)
      } else {
        nextKanji(true, 1)
      }
    } else if (e.key == " ") {
      e.preventDefault()
      setHint(e.type == "keydown")
    }
  }

  let hintText: string = useMemo(() =>
    `${kanji.meaning} (${kanji.on.join(", ")})`
  , [kanji])

  return (
    <div
      className='h-screen flex flex-col items-center gap-4'
      style={{backgroundColor: theme.surface}}
    >
      <div className='flex items-center h-min gap-4'>
        <Tile kanji={kanji} />
        {hint && hintText}
        <form onSubmit={e => {
          e.preventDefault()
          const ans = inputBox.current?.value!
          if (ans == "") {
            nextKanji(true)
          } else if (checkAnswer(kanji, ans)  != CheckResult.INCORRECT) {
            nextKanji()
            inputBox.current!.value = ""
          }
        }}>
        <input
          className='border-2 border-gray-400 rounded text-lg bg-transparent focus:outline-none text-center w-20 h-10'
          type="text"
          autoFocus
          style={{borderColor: theme.highlight}}
          onChange={checkInput}
          onKeyDown={checkMod}
          onKeyUp={checkMod}
          ref={inputBox}
        />
        </form>
      </div>
      <div className='w-full flex flex-col flex-wrap min-h-0'>
        {
          kanjiRange.map((k, i) => <QuizRow kanji={k} active={i == current} solved={solved[k.char]} onClick={() => {
            setCurrent(i)
            inputBox.current!.value = ""
            inputBox.current!.focus()
          }} />)
        }
      </div>
    </div>
  )
}