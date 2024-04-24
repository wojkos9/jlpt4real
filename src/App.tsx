import { useState } from 'react'
import jlpt from './jlpt_shuffle.json'
import colors from 'tailwindcss/colors'
import { createTheming } from '@callstack/react-theme-provider'

type Level = keyof typeof jlpt

type Themes = {
  [key in Level]: {
    surface: React.CSSProperties
    accent: React.CSSProperties
    highlight: React.CSSProperties
  }
}

const themes: Themes = {
  "N5": {
    surface: {
      backgroundColor: colors.yellow["50"]
    },
    accent: {
      backgroundColor: colors.yellow["100"]
    },
    highlight: {
      backgroundColor: colors.yellow["200"]
    }
  },
  "N4": {
    surface: {
      backgroundColor: colors.green["50"]
    },
    accent: {
      backgroundColor: colors.green["200"]
    },
    highlight: {
      backgroundColor: colors.green["300"]
    }
  },
  "N3": {
    surface: {
      backgroundColor: colors.orange["50"]
    },
    accent: {
      backgroundColor: colors.orange["100"]
    },
    highlight: {
      backgroundColor: colors.orange["200"]
    }
  },
  "N2": {
    surface: {
      backgroundColor: colors.red["50"]
    },
    accent: {
      backgroundColor: colors.red["100"]
    },
    highlight: {
      backgroundColor: colors.red["200"]
    }
  }
}

const { ThemeProvider, useTheme } = createTheming(themes.N5)


type Compound = {
  kanji: string
  kana: string
  translation: string
  type: string
}

type Kanji = {
  char: string
  kun: string
  on: string
  meaning: string
  compound: Compound[]
}

type TileProps = {
  kanji: Kanji
  index: number
  rowIndex: number
  onClick: () => void
}

function Tile({ kanji: { char, on }, index, rowIndex, onClick }: TileProps) {
  const theme = useTheme()
  return (
    <div className='w-12 inline-flex flex-col align-middle m-[2px] cursor-pointer font-[KanjiChart]'>
      <div
        className="h-12 flex border-2 border-gray-400 rounded-lg text-[42px] justify-center items-center transition duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.6)]"
        style={index % 2 == rowIndex % 2 ? theme.accent : undefined}
        onClick={onClick}
      >
        {char}
      </div>
      <a className='text-center text-xs text-slate-600'>{on.length == 0 ? "-" : on.split(",")[0]}</a>
    </div>
  )
}

function Content({level, setKanji}: {level: Level; setKanji: (k: Kanji) => void}) {
  const ROW_LENGTH = 28
  const rows = []
  const data = jlpt[level]
  for (let i = 0; i < data.length; i += ROW_LENGTH) {
    rows.push(
      <div>
        {data.slice(i, i+ROW_LENGTH).map((k, j) => <Tile kanji={k} rowIndex={i / ROW_LENGTH} index={j} onClick={() => setKanji(k)}/>)}
      </div>
    )
  }
  return (
    <div className='flex-wrap'>{rows}</div>
  )
}

type LevelButtonProps = {
  onClick: () => void
  children: any
}

function LevelButton({ onClick, children }: LevelButtonProps) {
  return (
    <button
      className='border rounded m-1 p-2 bg-slate-500'
      onClick={onClick}>
        {children}
      </button>
  )
}

function Bar({ compound }: {compound: Compound}) {
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

function Foo({ kanji }: { kanji: Kanji }) {
  const theme = useTheme()
  return (
    <div className='px-4'>
      <div className='text-xl m-1'>{kanji.meaning}</div>
      <div className='text-8xl text-center font-[KanjiChart]'  style={theme.accent}>{kanji.char}</div>
      <div className='my-3 border-2 rounded p-1' style={{...theme.accent, borderColor: theme.highlight.backgroundColor}}>
        <div className='text-xs font-bold'>Compounds</div>
        {kanji.compound.map(c => <Bar compound={c}/>)}
      </div>
    </div>
  )
}

function LevelButton2({ variant, onClick, children, checked }: { variant: 'left' | 'right' | 'normal', onClick: () => void, children: any, checked: boolean }) {
  return (
    <button
      className={'outline outline-1 outline-gray-400 py-1 px-3 text-gray-700 font-bold text-sm hover:bg-gray-400' + ' ' + (
        variant == 'left' ? 'rounded-s-md' : variant == 'right' ? 'rounded-e-md' : ''
      ) + ' ' + (checked ? 'bg-gray-300' : 'bg-gray-100' )}
      onClick={onClick}>
        {children}
      </button>
  )
}

function App() {
  const [level, setLevel] = useState<Level>("N4")
  const [kanji, setKanji] = useState<Kanji | null>(jlpt[level][0])
  const theme = themes[level]
  const allLevels: Level[] = ["N5", "N4", "N3", "N2"]
  return (
    <ThemeProvider theme={theme}>
      <div className='flex h-screen' style={theme.surface}>
        <div className='w-[230px] h-screen'>
            <div className='text-center text-sm m-1'>level</div>
            <div className='flex justify-center flex-nowrap'>
              {allLevels.map((name, i) => (
                <LevelButton2 checked={name == level} onClick={() => {
                  setLevel(name)
                  setKanji(jlpt[name][0])
                }} variant={i == 0 ? 'left' : i == allLevels.length - 1 ? 'right' : 'normal'}>
                  {name}
                </LevelButton2>
              ))}
          </div>
        </div>
        <div className='w-full flex flex-col'>
          <div className='overflow-scroll flex-1 min-h-0' style={theme.surface}>
            <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List</h1>
            <div>This kanji list is derived from the pre-2010 Test Content Specification. As of 2010, there is no official kanji list.</div>
            <Content level={level} setKanji={setKanji} />
          </div>
          { kanji
            ? <div className='flex-1' style={theme.surface}>
                <Foo kanji={kanji} />
              </div>
            : null
          }
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
