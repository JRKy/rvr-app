import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define icon sizes
const iconSizes = {
  tiny: 16,
  small: 20,
  medium: 24,
  large: 32,
  huge: 40,
} as const;

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0ea5e9', // Bright teal
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#f97316', // Coral accent
      light: '#fb923c',
      dark: '#ea580c',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f8fafc', // Light slate
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#475569', // Slate 600
    },
    divider: 'rgba(0, 0, 0, 0.06)',
    success: {
      main: '#10B981', // Emerald
      light: '#D1FAE5',
      dark: '#059669',
    },
    error: {
      main: '#EF4444', // Red
      light: '#FEE2E2',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FEF3C7',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6', // Blue
      light: '#DBEAFE',
      dark: '#2563EB',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: '1.125rem',
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.5,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.5,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.03)',
    '0 2px 4px rgba(0, 0, 0, 0.04)',
    '0 4px 8px rgba(0, 0, 0, 0.05)',
    '0 8px 16px rgba(0, 0, 0, 0.06)',
    '0 12px 24px rgba(0, 0, 0, 0.07)',
    '0 16px 32px rgba(0, 0, 0, 0.08)',
    '0 20px 40px rgba(0, 0, 0, 0.09)',
    '0 24px 48px rgba(0, 0, 0, 0.10)',
    '0 28px 56px rgba(0, 0, 0, 0.11)',
    '0 32px 64px rgba(0, 0, 0, 0.12)',
    '0 36px 72px rgba(0, 0, 0, 0.13)',
    '0 40px 80px rgba(0, 0, 0, 0.14)',
    '0 44px 88px rgba(0, 0, 0, 0.15)',
    '0 48px 96px rgba(0, 0, 0, 0.16)',
    '0 52px 104px rgba(0, 0, 0, 0.17)',
    '0 56px 112px rgba(0, 0, 0, 0.18)',
    '0 60px 120px rgba(0, 0, 0, 0.19)',
    '0 64px 128px rgba(0, 0, 0, 0.20)',
    '0 68px 136px rgba(0, 0, 0, 0.21)',
    '0 72px 144px rgba(0, 0, 0, 0.22)',
    '0 76px 152px rgba(0, 0, 0, 0.23)',
    '0 80px 160px rgba(0, 0, 0, 0.24)',
    '0 84px 168px rgba(0, 0, 0, 0.25)',
    '0 88px 176px rgba(0, 0, 0, 0.26)',
  ] as const,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        body: {
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
          },
          [theme.breakpoints.between('sm', 'md')]: {
            padding: theme.spacing(1.5),
          },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(2),
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
          transition: 'all 0.3s ease',
          '&.animate-in': {
            animation: 'fadeIn 0.5s ease forwards, slideUp 0.5s ease forwards',
          },
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        },
        elevation3: {
          boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        },
        elevation4: {
          boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#94A3B8',
          },
          '@media (max-width:600px)': {
            margin: '0.5rem 0',
            padding: '0.5rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            borderColor: '#E2E8F0',
            '&:hover': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused': {
              borderColor: '#94A3B8',
              boxShadow: 'none',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          WebkitTapHighlightColor: 'transparent',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0F766E',
          },
          '@media (max-width:600px)': {
            fontSize: '1rem',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          padding: '12px 24px',
          WebkitTapHighlightColor: 'transparent',
          '@media (max-width:600px)': {
            minHeight: 40,
            fontSize: '0.875rem',
            padding: '8px 16px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 4px rgba(16, 24, 40, 0.06)',
          padding: '12px 16px',
          alignItems: 'center',
          animation: 'slideInLeft 0.3s ease forwards',
        },
        standardSuccess: {
          backgroundColor: 'rgba(12, 170, 66, 0.08)',
          color: '#0A7B34',
          '& .MuiAlert-icon': {
            color: '#0CAA42',
          },
        },
        standardError: {
          backgroundColor: 'rgba(240, 68, 56, 0.08)',
          color: '#B01B15',
          '& .MuiAlert-icon': {
            color: '#F04438',
          },
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 171, 0, 0.08)',
          color: '#B76E00',
          '& .MuiAlert-icon': {
            color: '#FFAB00',
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 145, 255, 0.08)',
          color: '#0068B5',
          '& .MuiAlert-icon': {
            color: '#0091FF',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E2E8F0',
          padding: '16px',
          '@media (max-width:600px)': {
            padding: '12px 8px',
            fontSize: '0.875rem',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          WebkitTapHighlightColor: 'transparent',
          '&.MuiChip-filled': {
            backgroundColor: '#F1F5F9',
          },
          '@media (max-width:600px)': {
            fontSize: '0.75rem',
            height: 28,
          },
        },
        label: {
          padding: '0 12px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          color: '#ffffff',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
        },
        arrow: {
          color: '#1E293B',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: '#0F766E',
              opacity: 1,
              border: 0,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          border: '1px solid #CBD5E1',
          backgroundColor: '#E2E8F0',
          opacity: 1,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #E2E8F0',
          '@media (max-width:600px)': {
            height: 56,
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '8px 0',
          minWidth: 64,
          color: '#64748B',
          '&.Mui-selected': {
            color: '#0F766E',
          },
          '@media (max-width:600px)': {
            padding: '6px 0',
          },
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.medium,
            transition: 'all 0.2s ease-in-out',
          },
          '&.Mui-selected .MuiSvgIcon-root': {
            transform: 'scale(1.1)',
          },
        },
        label: {
          fontSize: '0.75rem',
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 8px rgba(15, 23, 42, 0.1)',
          '&:active': {
            boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.05)',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: iconSizes.medium,
          transition: 'all 0.2s ease-in-out',
          '&.icon-tiny': {
            fontSize: iconSizes.tiny,
          },
          '&.icon-small': {
            fontSize: iconSizes.small,
          },
          '&.icon-medium': {
            fontSize: iconSizes.medium,
          },
          '&.icon-large': {
            fontSize: iconSizes.large,
          },
          '&.icon-huge': {
            fontSize: iconSizes.huge,
          },
          '@media (max-width:600px)': {
            '&.icon-tiny': {
              fontSize: iconSizes.tiny - 2,
            },
            '&.icon-small': {
              fontSize: iconSizes.small - 2,
            },
            '&.icon-medium': {
              fontSize: iconSizes.medium - 2,
            },
            '&.icon-large': {
              fontSize: iconSizes.large - 4,
            },
            '&.icon-huge': {
              fontSize: iconSizes.huge - 8,
            },
          },
        },
        fontSizeSmall: {
          fontSize: iconSizes.small,
        },
        fontSizeMedium: {
          fontSize: iconSizes.medium,
        },
        fontSizeLarge: {
          fontSize: iconSizes.large,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          fontSize: iconSizes.medium,
          transition: 'all 0.2s ease-in-out',
        },
        fontSizeSmall: {
          fontSize: iconSizes.small,
        },
        fontSizeLarge: {
          fontSize: iconSizes.large,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: 8,
          color: '#64748B',
          '&:hover': {
            backgroundColor: '#F1F5F9',
            color: '#1E293B',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.medium,
          },
          '@media (max-width:600px)': {
            minWidth: 36,
            '& .MuiSvgIcon-root': {
              fontSize: iconSizes.small,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          boxShadow: 'none',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '&:hover': {
            backgroundColor: '#F1F5F9',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.875rem',
          },
        },
      },
    },
  },
});

export const theme = responsiveFontSizes(baseTheme); 