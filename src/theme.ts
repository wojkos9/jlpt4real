import { createTheming } from '@callstack/react-theme-provider'
import colors from 'tailwindcss/colors'

type Themes = {
  [key in Level]: {
    surface: React.CSSProperties
    accent: React.CSSProperties
    highlight: React.CSSProperties
  }
}

const themes: Themes = {
  "N5": {
    surface: {
      backgroundColor: colors.yellow["50"]
    },
    accent: {
      backgroundColor: colors.yellow["100"]
    },
    highlight: {
      backgroundColor: colors.yellow["200"]
    }
  },
  "N4": {
    surface: {
      backgroundColor: colors.green["50"]
    },
    accent: {
      backgroundColor: colors.green["200"]
    },
    highlight: {
      backgroundColor: colors.green["300"]
    }
  },
  "N3": {
    surface: {
      backgroundColor: colors.orange["50"]
    },
    accent: {
      backgroundColor: colors.orange["100"]
    },
    highlight: {
      backgroundColor: colors.orange["200"]
    }
  },
  "N2": {
    surface: {
      backgroundColor: colors.red["50"]
    },
    accent: {
      backgroundColor: colors.red["100"]
    },
    highlight: {
      backgroundColor: colors.red["200"]
    }
  }
}

const { ThemeProvider, useTheme } = createTheming(themes.N5)

export { ThemeProvider, useTheme, themes }