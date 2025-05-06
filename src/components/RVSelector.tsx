import { useState } from 'react';
import { Box, TextField, Typography, Table, TableBody, TableCell, TableRow, Paper, useTheme } from '@mui/material';

interface RVSelectorProps {
  onSpecsFound: (specs: { 
    dryWeight: number;
    hitchWeight: number;
    cargoWeight: number;
    freshWaterWeight: number;
    propaneWeight: number;
    grayWaterWeight: number;
    blackWaterWeight: number;
  }) => void;
}

const RVSelector = ({ onSpecsFound }: RVSelectorProps) => {
  const theme = useTheme();
  const [specs, setSpecs] = useState({
    dryWeight: 0,
    hitchWeight: 0,
    cargoWeight: 0,
    freshWaterWeight: 0,
    propaneWeight: 0,
    grayWaterWeight: 0,
    blackWaterWeight: 0,
  });

  const handleSpecChange = (field: keyof typeof specs, value: string) => {
    const numValue = value ? parseInt(value, 10) : 0;
    const newSpecs = { ...specs, [field]: numValue };
    setSpecs(newSpecs);
    onSpecsFound(newSpecs);
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: 'text.primary',
          mb: 3,
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        RV Specifications
      </Typography>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          }
        }}
      >
        <Table>
          <TableBody>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8,
                  width: '40%'
                }}
              >
                Dry Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.dryWeight || ''}
                  onChange={(e) => handleSpecChange('dryWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8
                }}
              >
                Hitch Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.hitchWeight || ''}
                  onChange={(e) => handleSpecChange('hitchWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8
                }}
              >
                Cargo Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.cargoWeight || ''}
                  onChange={(e) => handleSpecChange('cargoWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8
                }}
              >
                Fresh Water Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.freshWaterWeight || ''}
                  onChange={(e) => handleSpecChange('freshWaterWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8
                }}
              >
                Propane Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.propaneWeight || ''}
                  onChange={(e) => handleSpecChange('propaneWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  opacity: 0.8
                }}
              >
                Gray Water Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.grayWaterWeight || ''}
                  onChange={(e) => handleSpecChange('grayWaterWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell 
                component="th" 
                scope="row"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.secondary',
                  opacity: 0.8
                }}
              >
                Black Water Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.blackWaterWeight || ''}
                  onChange={(e) => handleSpecChange('blackWaterWeight', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      paddingRight: '8px',
                      fontWeight: 600
                    }
                  }}
                  inputProps={{ 
                    step: "1",
                    min: "0"
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default RVSelector; 