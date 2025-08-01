import { useEffect, useState, KeyboardEvent, useContext } from 'react'
import jlpt from './jlpt'
import QuizScreen from './QuizScreen/QuizScreen'
import { useTheme, ThemeProvider, themes, themeNeutral, Theme, applyTheme } from './theme'
import { Toggle } from './common/Toggle'
import { LangContext } from './Utils'
import ListScreen from './ListScreen/ListScreen'
import groups from './assets/groups.json'
import Tile from './common/Tile'
import { useQueryParam, QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window'


function LevelButton({ variant, onClick, children, checked }: { variant: 'left' | 'right' | 'normal', onClick: () => void, children: any, checked: boolean }) {
  const borderRadius = variant == 'left' ? 'rounded-s-md' : variant == 'right' ? 'rounded-e-md' : ''
  const theme = useTheme()
  return (
    <button
      className={`outline outline-1 outline-n-highlight py-1 px-3 text-gray-700 font-bold text-sm hover:bg-n-highlight ${borderRadius}`}
      style={{
        backgroundColor: checked ? theme.highlight : theme.neutral.surface,
        color: theme.neutral.text
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
  level: Route
  setLevel: (x: Route) => void
  setLang: (l: Lang) => void
  index?: number
}

function LeftPanel({ setTheme, setQuiz, level, setLevel, setLang, index }: ListScreenProps) {
  const allLevels: Level[] = ["N5", "N4", "N3", "N2", "N1"]
  const kanjiRange = level in jlpt ? jlpt[level] : []
  const [custom, setCustom] = useState(false)

  const quizRange = 100
  const ranges: [number, number][] = []
  for (let i = 0; i < kanjiRange.length; i += quizRange) {
    let next = Math.min(i + quizRange, kanjiRange.length)
    ranges.push([i, next])
  }

  const lang = useContext(LangContext)
  const langActive = "text-highlight"
  const langInactive = ""

  return (
    <div className='w-[260px] h-screen border-r-2 border-r-highlight me-2 overflow-clip'>
      <div className='text-center text-sm m-1 font-bold'>Level</div>
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
      <div className='flex flex-col m-2 items-center'>
        <LevelButton checked={level == "groups"} variant="normal" onClick={() => {
          setLevel("groups")
          setTheme(themes["N5"])
        }}>Groups</LevelButton>
        <div className='flex items-center gap-2 m-2'>
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

type QuizParams = {
  kanji: Kanji[]
  index?: number
}

const levelsMap = Object.fromEntries(
  Object.entries(jlpt).map(([l, ks]) => ks.map(k => [k.char, l]))
  .reduce((x, y) => x.concat(y))
)

function GroupRow({ group }: { group: keyof typeof groups }) {
  return (
    <div>
      {
        (groups[group] as string).split("").map(k => (
          <Tile current level={levelsMap[k]} size={10} kanji={k} />
        ))
      }
    </div>
  )
}

function GroupsScreen() {
  return (
    <div>
      {
        Object.keys(groups).map(g =>
          <GroupRow group={g} />
        )
      }
    </div>
  )
}

type Route = Level | "groups"

function Content() {
  const [level = "N5", setLevel] = useQueryParam<Route>("level")
  const [theme, setTheme] = useState({...themeNeutral, ...themes[level as Level]})
  const [quizParams, setQuizParams] = useState<QuizParams | null>(null)
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    if (level == "groups") {
      document.title = "JLPT Kanji groups"
    } else {
      document.title = `JLPT Study ${level}`
    }
  }, [level])

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
          <LeftPanel
            setTheme={setThemePartial}
            setQuiz={setQuizParams}
            level={level}
            setLevel={setLevel}
            setLang={setLang}
            index={quizParams?.index}
          />
          <div className='w-full min-w-0'>
            { quizParams == null
            ? level == "groups" ? <GroupsScreen /> : <ListScreen level={level} />
            : <QuizScreen level={level} kanjiRange={quizParams.kanji}/>
            }
          </div>
        </div>
      </LangContext.Provider>
    </ThemeProvider>
  )
}

function App() {
  return <QueryParamProvider adapter={WindowHistoryAdapter}>
    <Content />
  </QueryParamProvider>
}

export default App
