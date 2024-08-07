import { ReactElement, useContext, useMemo } from 'react'
import jlpt from '../jlpt'
import { themeNeutral, themes } from '../theme'
import { getMeaning } from '../QuizScreen/QuizScreen'
import { LangContext } from '../Utils'
import cangjie from '../cangjie'

function getLevel(k: string) {
  const lvls: Level[] = ["N5", "N4", "N3", "N2", "N1"]
  for (let lvl of lvls) {
    if (jlpt[lvl].some(x => x.char == k)) {
      return lvl
    }
  }
}

function KanjiCompound({ compound }: {compound: Compound}) {
    let kanji: ReactElement[] = []
    for (const k of compound.kanji) {
      const lvl = getLevel(k)
      let col
      if (lvl != null) {
        col = themes[lvl].highlight
      } else if (!/[あ-んア-ン]/.test(k)) {
        col = themeNeutral.neutral.highlight
      }

      kanji.push(
        <a className='rounded me-px' style={{backgroundColor: col}}>{k}</a>
      )
    }
    return (
      <div className='text-lg'>
        <div className='inline mx-1'>{kanji}</div>
        <div className='inline mx-1 bg-highlight'>{compound.kana}</div>
        <div className='inline mx-1 align-middle text-base'>{compound.translation}</div>
        <div className='inline mx-1 align-middle text-xs'>({compound.type})</div>
      </div>
    )
  }

type Compound2 = {
  kanji: string
  kana: string
  meaning: string[]
}

export default function KanjiCard({ kanji, onlyMeta, comp }: { kanji: Kanji, onlyMeta?: boolean, comp?: Compound2 }) {
  const lang = useContext(LangContext)
    return (
      <div className='px-4'>
        <div className='text-xl m-1'>{getMeaning(kanji, lang).join(", ")}</div>
        { !onlyMeta &&
        <div className='text-8xl text-center font-[KanjiChart] bg-accent'>{kanji.char}</div>
        }
        <div>
          { comp ? `${comp.kanji} - ${comp.kana} ${comp.meaning.slice(0, 3).join(", ")}` : "" }
        </div>
        <div className="mt-2">
          <div>{kanji.on.join(", ")}</div>
          <div>{kanji.kun.join(", ")}</div>
        </div>
        <div className='text-xs my-1'>
          { cangjie[kanji.char][0].toUpperCase() }
        </div>
        <div className='border-2 rounded p-1 border-highlight'>
          <div className='text-xs font-bold'>Compounds</div>
          {kanji.compound.map(c => <KanjiCompound compound={c}/>)}
        </div>
      </div>
    )
  }