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
  neutral: Theme & { text: string }
}

export type ThemeSystem = Theme & Neutrals

const themeNeutralLight: Neutrals = {
  neutral: {
    surface: colors.gray["100"],
    accent: colors.gray["200"],
    highlight: colors.gray["400"],
    text: colors.black
  }
}

const themesLight: Themes = {
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
    surface: colors.pink["50"],
    accent: colors.pink["100"],
    highlight: colors.pink["200"]
  },
  "N1": {
    surface: colors.purple["50"],
    accent: colors.purple["100"],
    highlight: colors.purple["200"]
  }
}


const themeNeutralDark: Neutrals = {
  neutral: {
    surface: colors.gray["900"],
    accent: colors.gray["800"],
    highlight: colors.gray["600"],
    text: colors.white
  }
}

const themesDark: Themes = {
  "N5": {
    surface: colors.yellow["950"],
    accent: colors.yellow["900"],
    highlight: colors.yellow["800"]
  },
  "N4": {
    surface: colors.green["950"],
    accent: colors.green["800"],
    highlight: colors.green["700"]
  },
  "N3": {
    surface: colors.orange["950"],
    accent: colors.orange["900"],
    highlight: colors.orange["800"]
  },
  "N2": {
    surface: colors.pink["950"],
    accent: colors.pink["900"],
    highlight: colors.pink["800"]
  },
  "N1": {
    surface: colors.purple["950"],
    accent: colors.purple["900"],
    highlight: colors.purple["800"]
  }
}

const themesMono = Object.fromEntries(
Object.entries(themesDark).map(([k, v]) =>
  [k, {
    surface:  colors.gray["900"],
    accent:  colors.gray["800"],
    highlight: v.highlight
  }])
) as Themes

const isDark = true
const themeNeutral = isDark ? themeNeutralDark : themeNeutralLight
const themes = isDark ? themesMono : themesLight

function mapTheme(theme: ThemeSystem) {
  return {
    '--color-surface': theme.surface,
    '--color-accent': theme.accent,
    '--color-highlight': theme.highlight,
    '--color-n-surface': theme.neutral.surface,
    '--color-n-accent': theme.neutral.accent,
    '--color-n-highlight': theme.neutral.highlight,
    '--color-text': theme.neutral.text
  }
}

function applyTheme(theme: ThemeSystem) {
  const props = mapTheme(theme)
  for (const [name, value] of Object.entries(props)) {
    document.documentElement.style.setProperty(name, value)
  }
}

const { ThemeProvider, useTheme } = createTheming<ThemeSystem>({...themes.N5, ...themeNeutral})

export { ThemeProvider, useTheme, themes, themeNeutral, applyTheme }