import { useTheme } from "./theme"

function KanjiCompound({ compound }: {compound: Compound}) {
    const theme = useTheme()
    return (
      <div className='text-lg'>
        <div className='inline mx-1'>{compound.kanji}</div>
        <div className='inline mx-1' style={{backgroundColor: theme.highlight}}>{compound.kana}</div>
        <div className='inline mx-1 align-middle text-base'>{compound.translation}</div>
        <div className='inline mx-1 align-middle text-xs'>({compound.type})</div>
      </div>
    )
  }

export default function KanjiCard({ kanji, onlyMeta }: { kanji: Kanji, onlyMeta?: boolean }) {
    const theme = useTheme()
    return (
      <div className='px-4'>
        <div className='text-xl m-1'>{kanji.meaning.join(", ")}</div>
        { !onlyMeta &&
        <div className='text-8xl text-center font-[KanjiChart]' style={{backgroundColor: theme.accent}}>{kanji.char}</div>
        }
        <div className="my-2">
          <div>{kanji.on.join(", ")}</div>
          <div>{kanji.kun.join(", ")}</div>
        </div>
        <div className='border-2 rounded p-1' style={{backgroundColor: theme.accent, borderColor: theme.highlight}}>
          <div className='text-xs font-bold'>Compounds</div>
          {kanji.compound.map(c => <KanjiCompound compound={c}/>)}
        </div>
      </div>
    )
  }