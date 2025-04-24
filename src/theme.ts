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
      main: '#5D4FFF', // Rich vibrant purple
      light: '#9D96FF',
      dark: '#4131CC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00D9B8', // Mint/turquoise
      light: '#61FFDB',
      dark: '#00A788',
      contrastText: '#000000',
    },
    background: {
      default: '#F8F9FF', // Subtle blue tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828', // Almost black
      secondary: '#475467', // Dark gray
    },
    success: {
      main: '#0CAA42', // Vibrant green
      light: '#6CEBA9',
      dark: '#0A7B34',
      contrastText: '#ffffff',
    },
    error: {
      main: '#F04438', // Bright red
      light: '#FDA29B',
      dark: '#B01B15',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAB00', // Amber
      light: '#FFD666',
      dark: '#B76E00',
      contrastText: '#000000',
    },
    info: {
      main: '#0091FF', // Sky blue
      light: '#7CD4FD',
      dark: '#0068B5',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
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
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      fontSize: '1.75rem',
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
      lineHeight: 1.6,
      fontSize: '1rem',
    },
    body2: {
      lineHeight: 1.6,
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
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
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(16, 24, 40, 0.05)',
    '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
    '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
    '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
    '0px 24px 32px -8px rgba(16, 24, 40, 0.08), 0px 8px 16px -8px rgba(16, 24, 40, 0.05)',
    '0px 32px 48px -8px rgba(16, 24, 40, 0.12), 0px 12px 24px -4px rgba(16, 24, 40, 0.04)',
    '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
    '0px 48px 80px -16px rgba(16, 24, 40, 0.16)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ] as const,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
        },
        'html, body': {
          width: '100%',
          height: '100%',
        },
        body: {
          backgroundColor: '#F8F9FF',
          color: '#101828',
          fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          scrollBehavior: 'smooth',
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        '@keyframes slideUp': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        '@keyframes slideInLeft': {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5),
          },
          [theme.breakpoints.between('sm', 'md')]: {
            padding: theme.spacing(2),
          },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(3),
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: false,
        disableElevation: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '50%',
            transform: 'scale(10, 10)',
            opacity: 0,
            transition: 'transform 0.5s, opacity 0.8s',
          },
          '&:active::after': {
            transform: 'scale(0, 0)',
            opacity: 0.3,
            transition: '0s',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.06)',
          backgroundSize: '200% auto',
          backgroundPosition: 'left center',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundPosition: 'right center',
          },
          '&.MuiButton-containedPrimary': {
            backgroundImage: 'linear-gradient(90deg, #5D4FFF 0%, #6B5CFF 50%, #5D4FFF 100%)',
          },
          '&.MuiButton-containedSecondary': {
            backgroundImage: 'linear-gradient(90deg, #00D9B8 0%, #14E8C7 50%, #00D9B8 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        startIcon: {
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.medium,
            transition: 'transform 0.2s ease',
          },
        },
        endIcon: {
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.medium,
            transition: 'transform 0.2s ease',
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
          borderRadius: 20,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
          },
          '&.animate-in': {
            animation: 'fadeIn 0.5s ease forwards, slideUp 0.5s ease forwards',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(16, 24, 40, 0.06)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1)',
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#5D4FFF',
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#5D4FFF',
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
          borderRadius: 12,
          padding: 8,
          transition: 'all 0.2s ease-in-out',
          '&:active': {
            transform: 'scale(0.95)',
          },
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover': {
              transform: 'translateY(-1px)',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
            },
          },
        },
        sizeSmall: {
          padding: 6,
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.small,
          },
        },
        sizeMedium: {
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.medium,
          },
        },
        sizeLarge: {
          padding: 12,
          '& .MuiSvgIcon-root': {
            fontSize: iconSizes.large,
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
  },
});

export const theme = responsiveFontSizes(baseTheme, {
  breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
  factor: 0.5,
}); 