import { ReactElement } from 'react'
import jlpt from './assets/jlpt.json'
import { themeNeutral, themes } from './theme'
import { getMeaning } from './QuizScreen'

function getLevel(k: string) {
  const lvls: Level[] = ["N5", "N4", "N3", "N2"]
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
      } else {
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

export default function KanjiCard({ kanji, onlyMeta }: { kanji: Kanji, onlyMeta?: boolean }) {
    return (
      <div className='px-4'>
        <div className='text-xl m-1'>{getMeaning(kanji).join(", ")}</div>
        { !onlyMeta &&
        <div className='text-8xl text-center font-[KanjiChart] bg-accent'>{kanji.char}</div>
        }
        <div className="my-2">
          <div>{kanji.on.join(", ")}</div>
          <div>{kanji.kun.join(", ")}</div>
        </div>
        <div className='border-2 rounded p-1 border-highlight'>
          <div className='text-xs font-bold'>Compounds</div>
          {kanji.compound.map(c => <KanjiCompound compound={c}/>)}
        </div>
      </div>
    )
  }