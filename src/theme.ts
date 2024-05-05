import { createTheming } from '@callstack/react-theme-provider'
import colors from 'tailwindcss/colors'

export type Theme = {
  surface: string
  accent: string
  highlight: string
}

type Themes = {
  [key in Level]: Theme
}

type Neutrals = {
  neutral: Theme
}

export type ThemeSystem = Theme & Neutrals

const themeNeutral: Neutrals = {
  neutral: {
    surface: colors.gray["100"],
    accent: colors.gray["200"],
    highlight: colors.gray["400"]
  }
}

const themes: Themes = {
  "N5": {
    surface: colors.yellow["50"],
    accent: colors.yellow["100"],
    highlight: colors.yellow["200"]
  },
  "N4": {
    surface: colors.green["50"],
    accent: colors.green["200"],
    highlight: colors.green["300"]
  },
  "N3": {
    surface: colors.orange["50"],
    accent: colors.orange["100"],
    highlight: colors.orange["200"]
  },
  "N2": {
    surface: colors.red["50"],
    accent: colors.red["100"],
    highlight: colors.red["200"]
  }
}

const { ThemeProvider, useTheme } = createTheming<ThemeSystem>({...themes.N5, ...themeNeutral})

export { ThemeProvider, useTheme, themes, themeNeutral }