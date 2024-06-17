import { useContext } from "react"
import { getMeaning } from "../QuizScreen/QuizScreen"
import { LangContext } from "../Utils"
import { themes } from "../theme"

export function SimilarRow({ kanji }: { kanji: JLPTKanji }) {
  const lang = useContext(LangContext)
  return (
    <tr className='text-nowrap'>
      <td style={{backgroundColor: themes[kanji.level].highlight}}>{kanji.char}</td>
      <td className='px-2'>{kanji.on[0]}</td>
      <td className='px-2'>{getMeaning(kanji, lang).join(", ")}</td>
    </tr>
  )
}