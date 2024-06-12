import { useEffect, useState, KeyboardEvent, createContext, useContext } from 'react'
import jlpt from './jlpt'
import QuizScreen from './QuizScreen/QuizScreen'
import Tile from './common/Tile'
import { useTheme, ThemeProvider, themes, themeNeutral, Theme, applyTheme } from './theme'
import KanjiCard from './common/KanjiCard'
import { Toggle } from './common/Toggle'
import { LangContext } from './Utils'

type ContentProps = {
  level: Level
  setKanji: (k: Kanji) => void
  currentKanji?: string
  isQuiz: boolean
}

function Content({level, setKanji, currentKanji, isQuiz}: ContentProps) {
  const ROW_LENGTH = 28
  const rows = []
  const data = jlpt[level]
  for (let i = 0; i < data.length; i += ROW_LENGTH) {
    rows.push(
      <div className={`${isQuiz ? 'hover:bg-gray-300 cursor-pointer' : ''}`}>
        {data.slice(i, i + ROW_LENGTH).map((k, j) =>
          <Tile
            size={12}
            className="m-[2px]"
            kanji={k.char}
            isOdd={j % 2 == (i / ROW_LENGTH) % 2}
            onClick={() => setKanji(k)}
            current={k.char == currentKanji}
          />
        )}
      </div>
    )
  }
  return (
    <div className='flex-wrap'>{rows}</div>
  )
}

function LevelButton({ variant, onClick, children, checked }: { variant: 'left' | 'right' | 'normal', onClick: () => void, children: any, checked: boolean }) {
  const borderRadius = variant == 'left' ? 'rounded-s-md' : variant == 'right' ? 'rounded-e-md' : ''
  const theme = useTheme()
  return (
    <button
      className={`outline outline-1 outline-n-highlight py-1 px-3 text-gray-700 font-bold text-sm hover:bg-n-highlight ${borderRadius}`}
      style={{
        backgroundColor: checked ? theme.highlight : theme.neutral.surface
      }}
      onClick={onClick}>
        {children}
      </button>
  )
}

function QuizRangeButton({ onClick, children, active}: {onClick?: () => void, children: any, active: boolean}) {
  return (
    <button
      className={`m-1 p-1 w-40 border-2 rounded bg-n-accent hover:bg-n-highlight ${active ? "border-highlight" : "border-n-highlight"}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface ListScreenProps {
  setTheme: (x: Theme) => void
  setQuiz: (q: QuizParams | null) => void
  level: Level
  setLevel: (x: Level) => void
  setLang: (l: Lang) => void
  index?: number
}

function LeftPanel({ setTheme, setQuiz, level, setLevel, setLang, index }: ListScreenProps) {
  const allLevels: Level[] = ["N5", "N4", "N3", "N2", "N1"]
  const kanjiRange = jlpt[level]
  const [custom, setCustom] = useState(false)

  const quizRange = 100
  const ranges: [number, number][] = []
  for (let i = 0; i < kanjiRange.length; i += quizRange) {
    let next = Math.min(i + quizRange, kanjiRange.length)
    // const kanjiLeft = kanjiRange.length - i
    // if (quizRange < kanjiLeft && kanjiLeft < 2 * quizRange) {
    //   const halfKanji = Math.floor(kanjiLeft / 2)
    //   ranges.push([i, i + halfKanji])
    //   ranges.push([i + halfKanji + 1, kanjiRange.length])
    //   break
    // }
    ranges.push([i, next])
  }

  const lang = useContext(LangContext)
  const langActive = "text-highlight"
  const langInactive = ""

  return (
    <div>
      <div className='text-center text-sm m-1'>level</div>
      <div className='flex justify-center flex-nowrap'>
        {allLevels.map((name, i) => (
          <LevelButton checked={name == level} onClick={() => {
            setTheme(themes[name])
            setLevel(name)
            setQuiz(null)
          }} variant={i == 0 ? 'left' : i == allLevels.length - 1 ? 'right' : 'normal'}>
            {name}
          </LevelButton>
        ))}
      </div>
      <div className='flex flex-col m-1 items-center'>
        <div className='flex items-center gap-2 m-1'>
          <a className={lang == 'pl' ? langActive : langInactive}>PL</a>
            <Toggle on={lang == 'en'} onChange={c => setLang(c ? "en" : "pl")} />
          <a className={lang == 'en' ? langActive : langInactive} >EN</a>
        </div>
        {
          ranges.map(([a, b]) =>
            <QuizRangeButton active={a == index} onClick={() => setQuiz({
              kanji: kanjiRange.slice(a, b),
              index: a
            })}>{a+1}-{b}</QuizRangeButton>
          )
        }
        { custom
          ? <textarea
            className='bg-surface border-2 border-highlight overflow-hidden focus:outline-none'
            placeholder='Enter kanjis for quiz'
            // onInput={e => {e.target.style.height = ""; e.target.style.height = e.target.scrollHeight + 'px'}}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key == 'Enter') {
              const chars = (e.target as HTMLTextAreaElement).value.split("")
              const jlptKanji = Object.values<Kanji[]>(jlpt).reduce((x, y) => x.concat(y))
              const kanji = Array.from(new Set(chars.map(c => jlptKanji.find(k => k.char == c) as Kanji).filter(x => x)))
              if (kanji.length > 0) {
                setQuiz({ kanji, index: -1 })
              }
              setCustom(false)
            }
          }}/>
          : <QuizRangeButton active={index == -1}  onClick={() => setCustom(true)}>Custom</QuizRangeButton>
        }
      </div>
    </div>
  )
}

function ListScreen({level}: {level: Level}) {
  const [kanji, setKanji] = useState<Kanji | null>(jlpt[level][0])

  return (
    <div className='flex flex-col h-screen'>
      <div className='overflow-scroll flex-1 min-h-0 bg-surface'>
        <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List</h1>
        <div>This kanji list is derived from the pre-2010 Test Content Specification. As of 2010, there is no official kanji list.</div>
        <Content level={level} setKanji={setKanji} currentKanji={kanji?.char} isQuiz={false} />
      </div>
      { kanji
        ? <div className='flex-1 bg-surface'>
            <KanjiCard kanji={kanji} />
          </div>
        : null
      }
    </div>
  )
}

type QuizParams = {
  kanji: Kanji[]
  index?: number
}

function App() {
  const [level, setLevel] = useState<Level>("N4")
  const [theme, setTheme] = useState({...themeNeutral, ...themes["N4"]})
  const [quizParams, setQuizParams] = useState<QuizParams | null>(null)
  const [lang, setLang] = useState<Lang>("pl")

  function setThemePartial(theme: Theme) {
    setTheme({...themeNeutral, ...theme})
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeProvider theme={theme}>
      <LangContext.Provider value={lang}>
        <div className='flex h-screen bg-surface overflow-x-scroll'>
          <div className='w-[260px] h-screen'>
            <LeftPanel
              setTheme={setThemePartial}
              setQuiz={setQuizParams}
              level={level}
              setLevel={setLevel}
              setLang={setLang}
              index={quizParams?.index}
            />
          </div>
          <div className='w-full min-w-0'>
            { quizParams == null
            ? <ListScreen level={level} />
            : <QuizScreen level={level} kanjiRange={quizParams.kanji}/>
            }
          </div>
        </div>
      </LangContext.Provider>
    </ThemeProvider>
  )
}

export default App
