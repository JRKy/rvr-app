import { useState } from 'react';
import { Box, TextField, Typography, Table, TableBody, TableCell, TableRow, Paper, useTheme } from '@mui/material';
import { TruckSpecs } from '../types';

interface VehicleSelectorProps {
  onSpecsFound: (specs: Partial<TruckSpecs>) => void;
}

const VehicleSelector = ({ onSpecsFound }: VehicleSelectorProps) => {
  const theme = useTheme();
  const [specs, setSpecs] = useState<Partial<TruckSpecs>>({
    curbWeight: 0,
    gvwr: 0,
    gcvwr: 0,
    payload: 0,
    towingCapacity: 0,
  });

  const handleSpecChange = (field: keyof TruckSpecs, value: string) => {
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
        Truck Specifications
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
                Curb Weight
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.curbWeight || ''}
                  onChange={(e) => handleSpecChange('curbWeight', e.target.value)}
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
                GVWR
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.gvwr || ''}
                  onChange={(e) => handleSpecChange('gvwr', e.target.value)}
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
                GCVWR
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.gcvwr || ''}
                  onChange={(e) => handleSpecChange('gcvwr', e.target.value)}
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
                Payload
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.payload || ''}
                  onChange={(e) => handleSpecChange('payload', e.target.value)}
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
                Towing Capacity
              </TableCell>
              <TableCell align="right">
                <TextField
                  variant="outlined"
                  type="number"
                  value={specs.towingCapacity || ''}
                  onChange={(e) => handleSpecChange('towingCapacity', e.target.value)}
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

export default VehicleSelector; 