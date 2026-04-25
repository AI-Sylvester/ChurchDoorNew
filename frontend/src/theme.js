import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A', // Deep Blue
      light: '#3B82F6',
      dark: '#172554',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Soft Slate
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none', // Modern buttons don't need ALL CAPS
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Softer, more modern corners globally
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(30, 58, 138, 0.39)', // Custom primary hover shadow
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI dark mode overlay
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', // Soft premium shadow
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1E3A8A',
        },
      },
    },
  },
});

export default theme;
