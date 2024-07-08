type Level = "N5" | "N4" | "N3" | "N2" | "N1"

type Compound = {
  kanji: string
  kana: string
  translation: string
  type: string
}

type Kanji = {
  char: string
  kun: string[]
  on: string[]
  meaning: string[]
  compound: Compound[]
  rtk: string
}

interface JLPTKanji extends Kanji {
  level: Level
}

type Lang = "pl" | "en"

declare module 'kuroshiro' {
  export type System = "nippon" | "passport" | "hepburn"
  interface Util {
    kanaToRomaji: (kana: string, system: System) => string
  }
  const Kuroshiro: {
    Util: Util
  }
  export default Kuroshiro
}
