type Level = "N5" | "N4" | "N3" | "N2"

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
  meaning: string
  compound: Compound[]
}

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