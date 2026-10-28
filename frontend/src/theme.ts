import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",
    },
    secondary: {
      main: "#06B6D4",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          transition: "transform 180ms ease, opacity 180ms ease",
          "&:active": {
            transform: "scale(0.98)",
          },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
          },
        },
      ],
    },
  },
});
