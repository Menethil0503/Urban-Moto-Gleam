import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Bebas Neue, sans-serif",
    body: "Space Grotesk, sans-serif",
  },
  colors: {
    urban: {
      950: "#05070F",
      900: "#0A0F1F",
      800: "#121B33",
      700: "#1E2A4D",
      500: "#1DD6C1",
      300: "#57B6FF",
      100: "#F6FBFF",
    },
  },
  styles: {
    global: {
      body: {
        bg: "urban.950",
        color: "urban.100",
      },
      "*::selection": {
        bg: "urban.500",
        color: "urban.950",
      },
    },
  },
});