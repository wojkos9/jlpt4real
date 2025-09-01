import { useEffect, useState, KeyboardEvent, useContext } from 'react'
import jlpt from './jlpt'
import { useTheme, ThemeProvider, themes, themeNeutral, Theme, applyTheme } from './theme'
import { Toggle } from './common/Toggle'
import { LangContext } from './Utils'
import ListScreen from './ListScreen/ListScreen'
import groups from './assets/groups.json'
import Tile from './common/Tile'
import { useQueryParam, QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window'
import PairQuizScreen from './QuizScreen/PairQuizScreen'
import QuizScreen from './QuizScreen/QuizScreen'
import wordsN3 from './assets/n3_words.json'
import wordsN2 from './assets/n2_words.json'
import useLocalStorage from './common/useLocalStorage'


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
      className={`m-1 p-1 flex-grow border-2 rounded bg-n-accent hover:bg-n-highlight ${active ? "border-highlight" : "border-n-highlight"}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

enum QuizType {
  Pairs, List
}

interface ListScreenProps {
  setTheme: (x: Theme) => void
  setQuiz: (q: QuizParams | null) => void
  level: Route
  setLevel: (x: Route) => void
  setLang: (l: Lang) => void
  index?: number
  quizType?: QuizType
}

function LeftPanel({ setTheme, setQuiz, level, setLevel, setLang, index, quizType }: ListScreenProps) {
  const allLevels: Level[] = ["N5", "N4", "N3", "N2", "N1"]
  const kanjiRange = level in jlpt ? jlpt[level as Level] : []
  const [custom, setCustom] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const quizRange = 100
  const ranges: [number, number][] = []
  for (let i = 0; i < kanjiRange.length; i += quizRange) {
    let next = Math.min(i + quizRange, kanjiRange.length)
    ranges.push([i, next])
  }

  const wordCategories = level == "N3"
    ? Object.entries(wordsN3)
    : level == "N2"
      ? Object.entries(wordsN2)
      : []

  const lang = useContext(LangContext)
  const langActive = "text-highlight"
  const langInactive = ""

  function quizButtons(a: number, b: number, onSelect: (t: QuizType) => void) {
    return <div key={a} className='flex w-full text-nowrap'>
      <QuizRangeButton active={a == index && quizType == QuizType.Pairs} onClick={() => onSelect(QuizType.Pairs)}>P {a+1}-{b}</QuizRangeButton>
      <QuizRangeButton active={a == index && quizType == QuizType.List} onClick={() => onSelect(QuizType.List)}>L {a+1}-{b}</QuizRangeButton>
    </div>
  }

  function withPitch(kanaList: string[]) {
    return kanaList.map((kana, i) =>
      <a className={i % 2 == 1 ? "border-t-[1px] border-gray-500 break-keep" : "pt-[1px]"} >{kana}</a>
    )
  }

  function PanelContent() {
    return <>
      <div className='text-center text-sm m-1 font-bold'>Level</div>
      <div className='flex justify-center flex-nowrap mx-2'>
        {allLevels.map((name, i) => (
          <LevelButton key={name} checked={name == level} onClick={() => {
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
          ranges.map(([a, b]) => quizButtons(a, b,
              t => {
                setQuiz({
                  kanji: kanjiRange.slice(a, b),
                  index: a,
                  type: t
                })
                setExpanded(false)
              }
            )
          )
        }
        <div className='w-full flex flex-col'>
          {
            wordCategories.map(([cat, words]) =>
              <QuizRangeButton
                key={cat}
                active={false}
                onClick={() => {
                  setQuiz({
                    kanji: [],
                    pairs: words.map(w => [
                      w.meaning,
                      <div className='flex flex-col gap-1'>
                        <span>{w.kanji}</span>
                        <span className='text-sm text-gray-500'>{withPitch(w.kana)}</span>
                      </div> as any as string
                    ]),
                    type: QuizType.Pairs
                  })
                  setExpanded(false)
                }}
              >
                {cat}
              </QuizRangeButton>
            )
          }
        </div>
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
                setQuiz({ kanji, index: -1, type: QuizType.List })
              }
              setCustom(false)
            }
          }}/>
          : <QuizRangeButton active={index == -1}  onClick={() => setCustom(true)}>Custom</QuizRangeButton>
        }
      </div>
    </>
  }

  function ExpandButton() {
    return <button className='text-xl p-1 font-bold select-none font-[KanjiChart]' onClick={() => setExpanded(!expanded)}>
      { expanded ? "一" : "三" }
    </button>
  }

  return (
    <div
      className='z-10 bg-surface shadow-xl shadow-black h-screen absolute border-r-2 border-r-highlight me-2 overflow-clip transition-all'
      style={{
        width: expanded ? 230 : 34
      }}
    >
      <ExpandButton />
      { expanded ? <PanelContent /> : null }
    </div>
  )
}

type QuizParams = {
  kanji: Kanji[]
  pairs?: [string, string][]
  index?: number
  type: QuizType
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
          <GroupRow group={g as keyof typeof groups} />
        )
      }
    </div>
  )
}

type Route = Level | "groups"

function Content() {
  const [savedLevel, saveLevel] = useLocalStorage<Level>("currentLevel", "N5")
  const [level = savedLevel, setLevel] = useQueryParam<Route>("level")
  const [theme, setTheme] = useState({...themeNeutral, ...themes[level as Level]})
  const [quizParams, setQuizParams] = useState<QuizParams | null>(null)
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    if (level == "groups") {
      document.title = "JLPT Kanji groups"
    } else {
      document.title = `JLPT Study ${level}`
      saveLevel(level)
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
        <div className='flex h-screen bg-surface overflow-x-scroll no-scrollbar'>
          <LeftPanel
            setTheme={setThemePartial}
            setQuiz={setQuizParams}
            level={level}
            setLevel={setLevel}
            setLang={setLang}
            index={quizParams?.index}
            quizType={quizParams?.type}
          />
          <div className='w-full min-w-0 ps-10'>
            { quizParams == null
              ? level == "groups" ? <GroupsScreen /> : <ListScreen level={level} />
              : quizParams.type == QuizType.Pairs
                ? <PairQuizScreen level={level as Level} kanjiRange={quizParams.kanji} customPairs={quizParams.pairs}/>
                : <QuizScreen level={level as Level} kanjiRange={quizParams.kanji}/>
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
