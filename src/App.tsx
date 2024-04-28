import { useState } from 'react'
import jlpt from './assets/jlpt.json'
import colors from 'tailwindcss/colors'
import QuizScreen from './QuizScreen'
import Tile from './Tile'
import { useTheme, ThemeProvider, themes } from './theme'

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
            kanji={k}
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

function KanjiCompound({ compound }: {compound: Compound}) {
  const theme = useTheme()
  return (
    <div className='text-lg'>
      <div className='inline mx-1'>{compound.kanji}</div>
      <div className='inline mx-1' style={theme.highlight}>{compound.kana}</div>
      <div className='inline mx-1 align-middle text-base'>{compound.translation}</div>
      <div className='inline mx-1 align-middle text-xs'>({compound.type})</div>
    </div>
  )
}

function KanjiCard({ kanji }: { kanji: Kanji }) {
  const theme = useTheme()
  return (
    <div className='px-4'>
      <div className='text-xl m-1'>{kanji.meaning}</div>
      <div className='text-8xl text-center font-[KanjiChart]'  style={theme.accent}>{kanji.char}</div>
      <div className="my-2">
        <div>{kanji.on.join(", ")}</div>
        <div>{kanji.kun.join(", ")}</div>
      </div>
      <div className='border-2 rounded p-1' style={{...theme.accent, borderColor: theme.highlight.backgroundColor}}>
        <div className='text-xs font-bold'>Compounds</div>
        {kanji.compound.map(c => <KanjiCompound compound={c}/>)}
      </div>
    </div>
  )
}

function LevelButton({ variant, onClick, children, checked }: { variant: 'left' | 'right' | 'normal', onClick: () => void, children: any, checked: boolean }) {
  const borderRadius = variant == 'left' ? 'rounded-s-md' : variant == 'right' ? 'rounded-e-md' : ''
  return (
    <button
      className={`outline outline-1 outline-gray-400 py-1 px-3 text-gray-700 font-bold text-sm hover:bg-gray-400 ${borderRadius}`}
      style={{
        backgroundColor: checked ? colors.gray["300"] : colors.gray["100"]
      }}
      onClick={onClick}>
        {children}
      </button>
  )
}

function QuizButton({active, onClick}: {active: boolean, onClick: () => void}) {
  const theme = useTheme()
  return (
    <button
      className='m-2 p-1 w-24 border rounded-sm bg-gray-200 hover:bg-gray-300'
      style={{borderColor: active ? theme.highlight.backgroundColor : colors.gray["400"]}}
      onClick={onClick}
    >
      Quiz
    </button>
  )
}

function ListScreen({ setTheme }: { setTheme: (x: typeof themes["N5"]) => void }) {
  const [level, setLevel] = useState<Level>("N4")
  const [kanji, setKanji] = useState<Kanji | null>(jlpt[level][0])
  const [isQuiz, setIsQuiz] = useState(false)
  const theme = useTheme()
  const allLevels: Level[] = ["N5", "N4", "N3", "N2"]
  return (
      <div className='flex h-screen' style={theme.surface}>
        <div className='w-[230px] h-screen'>
          <div className='text-center text-sm m-1'>level</div>
          <div className='flex justify-center flex-nowrap'>
            {allLevels.map((name, i) => (
              <LevelButton checked={name == level} onClick={() => {
                setTheme(themes[name])
                setLevel(name)
                setKanji(jlpt[name][0])
              }} variant={i == 0 ? 'left' : i == allLevels.length - 1 ? 'right' : 'normal'}>
                {name}
              </LevelButton>
            ))}
          </div>
          <div className='flex justify-center '>
            <QuizButton active={isQuiz} onClick={() => setIsQuiz(!isQuiz)} />
          </div>
        </div>
        <div className='w-full flex flex-col'>
          <div className='overflow-scroll flex-1 min-h-0' style={theme.surface}>
            <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List</h1>
            <div>This kanji list is derived from the pre-2010 Test Content Specification. As of 2010, there is no official kanji list.</div>
            <Content level={level} setKanji={setKanji} currentKanji={kanji?.char} isQuiz={isQuiz} />
          </div>
          { kanji
            ? <div className='flex-1' style={theme.surface}>
                <KanjiCard kanji={kanji} />
              </div>
            : null
          }
        </div>
      </div>
  )
}

function App() {
  const [theme, setTheme] = useState(themes["N4"])
  return (
    <ThemeProvider theme={theme}>
      {/* <ListScreen setTheme={setTheme} /> */}
      <QuizScreen kanjiRange={jlpt.N5}/>
    </ThemeProvider>
  )
}

export default App
