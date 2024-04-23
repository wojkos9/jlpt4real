import { useState } from 'react'
import jlpt from './jlpt.json'

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
  onClick: () => void
}

function Tile({ kanji: { char, on }, onClick }: TileProps) {
  return (
    <div className='w-12 inline-flex flex-col align-middle m-[2px] cursor-pointer font-[KanjiChart]'>
      <div
        className="h-12 flex border-2 bg-green-200 border-gray-400 rounded-lg text-[42px] justify-center items-center transition duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.6)]"
        onClick={onClick}
      >
        {char}
      </div>
      {/* <a className='text-center text-xs text-slate-600'>{on.split(",")[0]}</a> */}
    </div>
  )
}

type Level = keyof typeof jlpt

function Content({level, setKanji}: {level: Level; setKanji: (k: Kanji) => void}) {
  const ROW_LENGTH = 28
  const rows = []
  const data = jlpt[level]
  for (let i = 0; i < data.length; i += ROW_LENGTH) {
    rows.push(
      <div>
        {data.slice(i, i+ROW_LENGTH).map(k => <Tile kanji={k} onClick={() => setKanji(k)}/>)}
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
  return (
    <div className='text-lg'>
      <div className='inline mx-1'>{compound.kanji}</div>
      <div className='inline mx-1 bg-green-400'>{compound.kana}</div>
      <div className='inline mx-1 align-middle text-base'>{compound.translation}</div>
      <div className='inline mx-1 align-middle text-xs'>({compound.type})</div>
    </div>
  )
}

function Foo({ kanji }: { kanji: Kanji }) {
  return (
    <div className='px-4'>
      <div className='text-xl m-1'>{kanji.meaning}</div>
      <div className='text-8xl text-center bg-green-300 font-[KanjiChart]'>{kanji.char}</div>
      <div className='my-3 border-2 rounded border-green-700 bg-green-300 p-1'>
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
  const [kanji, setKanji] = useState<Kanji | null>(null)
  const allLevels: Level[] = ["N5", "N4", "N3", "N2"]
  return (
    <div className='flex h-screen bg-green-100'>
      <div className='w-[230px] h-screen'>
          <div className='text-center text-sm m-1'>level</div>
          <div className='flex justify-center flex-nowrap'>
            {allLevels.map((name, i) => (
              <LevelButton2 checked={name == level} onClick={() => setLevel(name)} variant={i == 0 ? 'left' : i == allLevels.length - 1 ? 'right' : 'normal'}>
                {name}
              </LevelButton2>
            ))}
        </div>
      </div>
      <div className='w-full flex flex-col'>
        <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List</h1>
        <div>This kanji list is derived from the pre-2010 Test Content Specification. As of 2010, there is no official kanji list.</div>
        <div className='flex-1 flex flex-col'>
          <div className='p-3 bg-green-300 overflow-scroll flex-1'>
            <Content level={level} setKanji={setKanji} />
          </div>
          { kanji
            ? <div className='bg-green-400 flex-1'>
                <Foo kanji={kanji} />
              </div>
            : null
          }
        </div>
      </div>
    </div>
  )
}

export default App
