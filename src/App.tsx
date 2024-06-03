import { useEffect, useState } from 'react'
import jlpt from './assets/jlpt.json'
import QuizScreen from './QuizScreen'
import Tile from './Tile'
import { useTheme, ThemeProvider, themes, themeNeutral, Theme, applyTheme } from './theme'
import KanjiCard from './KanjiCard'

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

function QuizRangeButton({ onClick, children}: {onClick?: () => void, children: any}) {
  return (
    <button
      className='m-1 p-1 w-40 border rounded-sm bg-n-accent border-n-highlight hover:bg-n-highlight'
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
}

function LeftPanel({ setTheme, setQuiz, level, setLevel }: ListScreenProps) {
  const allLevels: Level[] = ["N5", "N4", "N3", "N2"]
  const kanjiRange = jlpt[level]

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
        {
          ranges.map(([a, b]) =>
            <QuizRangeButton onClick={() => setQuiz({
              level: level,
              range: [a, b]
            })}>{a+1}-{b}</QuizRangeButton>
          )
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
  level: Level
  range: [number, number]
}

function App() {
  const [level, setLevel] = useState<Level>("N4")
  const [theme, setTheme] = useState({...themeNeutral, ...themes["N4"]})
  const [quizParams, setQuizParams] = useState<QuizParams | null>(null)

  function setThemePartial(theme: Theme) {
    setTheme({...themeNeutral, ...theme})
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeProvider theme={theme}>
      <div className='flex h-screen bg-surface'>
        <div className='w-[230px] h-screen'>
          <LeftPanel setTheme={setThemePartial} setQuiz={setQuizParams} level={level} setLevel={setLevel}/>
        </div>
        <div className='w-full'>
          { quizParams == null
          ? <ListScreen level={level} />
          : <QuizScreen kanjiRange={jlpt[level].slice(...quizParams.range)}/>
          }
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
