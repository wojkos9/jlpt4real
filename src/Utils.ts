import Kuroshiro, { System } from "kuroshiro"
import { createContext } from "react"

export function rotArray<T>(array: T[], predicate: (t: T) => boolean, start: number, dir: number = 1) {
  function rot1(i: number) {
    return (i + dir + array.length) % array.length
  }

  for (let i = rot1(start); i != start; i = rot1(i)) {
    if (predicate(array[i])) {
      return i
    }
  }
  return start
}

export function splitBy<T>(array: T[], n: number) {
  const ranges: T[][] = []
  for (let i = 0; i < array.length; i += n) {
    ranges.push(array.slice(i, Math.min(i + n, array.length)))
  }
  return ranges
}

function rom(x: string, system?: System) {
  const systems: System[] = system ? [system] : ["nippon", "hepburn"]
  return systems.map(r => Kuroshiro.Util.kanaToRomaji(x, r))
}

function unique<T>(x: T[]): T[] {
  return Array.from(new Set(x))
}

export function toRomaji(readings: string[], system?: System) {
  return readings.map(o => unique(rom(o, system))).reduce((x, y) => x.concat(y), [])
}

export function allOnReadings(k: Kanji): string[] {
  return k.on.map(on => Kuroshiro.Util.kanaToHiragna(on))
    .concat(k.on)
    .concat(toRomaji(k.on))
}

export function getOn(k: Kanji) {
  return k.on //.slice(0, 1)
}

export const LangContext = createContext<Lang>("en")