import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
  Fade,
  Slide,
} from '@mui/material';
import { PayloadCalculation, TruckSpecs } from '../types';
import VehicleSelector from '../components/VehicleSelector';
import RVSelector from '../components/RVSelector';

interface FormData {
  truckSpecs: TruckSpecs;
  rvSpecs: {
    dryWeight: number;
    hitchWeight: number;
    cargoWeight: number;
    freshWaterWeight: number;
    propaneWeight: number;
    grayWaterWeight: number;
    blackWaterWeight: number;
  };
  passengerWeight: number;
  cargoWeight: number;
}

const PayloadCalculator = () => {
  const theme = useTheme();
  const [result, setResult] = useState<PayloadCalculation | null>(null);
  const [formData, setFormData] = useState<FormData>({
    truckSpecs: {
      curbWeight: 0,
      gvwr: 0,
      gcvwr: 0,
      payload: 0,
      towingCapacity: 0,
    },
    rvSpecs: {
      dryWeight: 0,
      hitchWeight: 0,
      cargoWeight: 0,
      freshWaterWeight: 0,
      propaneWeight: 0,
      grayWaterWeight: 0,
      blackWaterWeight: 0,
    },
    passengerWeight: 0,
    cargoWeight: 0,
  });

  const handleTruckSpecsFound = (specs: Partial<TruckSpecs>) => {
    setFormData(prev => ({
      ...prev,
      truckSpecs: { ...prev.truckSpecs, ...specs }
    }));
  };

  const handleRVSpecsFound = (specs: FormData['rvSpecs']) => {
    setFormData(prev => ({
      ...prev,
      rvSpecs: specs
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = value ? parseInt(value, 10) : 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculatePayload = () => {
    const { truckSpecs, rvSpecs, passengerWeight, cargoWeight } = formData;
    const { curbWeight, gvwr, gcvwr, payload, towingCapacity } = truckSpecs;

    // Calculate total RV weight
    const totalRVWeight = 
      rvSpecs.dryWeight + 
      rvSpecs.cargoWeight + 
      rvSpecs.freshWaterWeight + 
      rvSpecs.propaneWeight + 
      rvSpecs.grayWaterWeight + 
      rvSpecs.blackWaterWeight;

    // Calculate total payload
    const totalPayload = passengerWeight + cargoWeight;
    const availablePayload = payload - totalPayload;
    const newGVW = curbWeight + totalPayload;
    const newGCVW = newGVW + totalRVWeight;
    const remainingTowingCapacity = towingCapacity - totalRVWeight;

    // Check if within limits
    const isWithinLimits = 
      newGVW <= gvwr && 
      newGCVW <= gcvwr && 
      totalPayload <= payload &&
      totalRVWeight <= towingCapacity;

    setResult({
      id: Date.now().toString(),
      date: new Date(),
      truckSpecs,
      passengerWeight,
      cargoWeight,
      hitchWeight: rvSpecs.hitchWeight,
      totalPayload,
      availablePayload,
      newGVW,
      newGCVW,
      remainingTowingCapacity,
      isWithinLimits,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
              textAlign: 'center',
              letterSpacing: '-1px',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            GVWR and Payload Calculator
          </Typography>

          <Box sx={{ display: 'grid', gap: 4 }}>
            <Slide direction="up" in timeout={1000}>
              <Card 
                elevation={0} 
                sx={{ 
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
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <VehicleSelector onSpecsFound={handleTruckSpecsFound} />
                  
                  <Divider sx={{ 
                    my: 4, 
                    borderColor: 'divider', 
                    opacity: 0.3,
                    '&::before, &::after': {
                      borderColor: 'divider',
                    }
                  }} />
                  
                  <RVSelector onSpecsFound={handleRVSpecsFound} />
                  
                  <Divider sx={{ 
                    my: 4, 
                    borderColor: 'divider', 
                    opacity: 0.3,
                    '&::before, &::after': {
                      borderColor: 'divider',
                    }
                  }} />
                  
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
                    Truck Payload
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Passenger Weight"
                      type="number"
                      value={formData.passengerWeight || ''}
                      onChange={(e) => handleInputChange('passengerWeight', e.target.value)}
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Cargo Weight"
                      type="number"
                      value={formData.cargoWeight || ''}
                      onChange={(e) => handleInputChange('cargoWeight', e.target.value)}
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
                    <Button
                      variant="contained"
                      size="large"
                      onClick={calculatePayload}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      Calculate Payload
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Slide>

            {result && (
              <Slide direction="up" in timeout={1000}>
                <Card 
                  elevation={0} 
                  sx={{ 
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
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
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
                      Hitched Totals
                    </Typography>
                    <TableContainer>
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
                                opacity: 0.8
                              }}
                            >
                              Available Payload
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                fontWeight: 700,
                                color: 'text.primary',
                                borderBottom: '1px solid',
                                borderBottomColor: 'divider',
                                fontSize: '1.1rem'
                              }}
                            >
                              {result.availablePayload.toLocaleString()} lbs
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
                              New GVW
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                fontWeight: 700,
                                color: 'text.primary',
                                borderBottom: '1px solid',
                                borderBottomColor: 'divider',
                                fontSize: '1.1rem'
                              }}
                            >
                              {result.newGVW.toLocaleString()} lbs
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
                              New GCVW
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                fontWeight: 700,
                                color: 'text.primary',
                                borderBottom: '1px solid',
                                borderBottomColor: 'divider',
                                fontSize: '1.1rem'
                              }}
                            >
                              {result.newGCVW.toLocaleString()} lbs
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
                              Remaining Towing Capacity
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                fontWeight: 700,
                                color: 'text.primary',
                                fontSize: '1.1rem'
                              }}
                            >
                              {result.remainingTowingCapacity.toLocaleString()} lbs
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Alert
                      severity={result.isWithinLimits ? 'success' : 'error'}
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          alignItems: 'center'
                        },
                        background: result.isWithinLimits 
                          ? 'rgba(76, 175, 80, 0.1)' 
                          : 'rgba(244, 67, 54, 0.1)',
                        color: result.isWithinLimits 
                          ? theme.palette.success.main 
                          : theme.palette.error.main,
                        border: `1px solid ${result.isWithinLimits 
                          ? theme.palette.success.main 
                          : theme.palette.error.main}`,
                        '& .MuiAlert-message': {
                          fontWeight: 600
                        },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                    >
                      {result.isWithinLimits
                        ? 'Your vehicle is within safe towing capacity limits'
                        : 'Warning: Your vehicle exceeds safe towing capacity limits'}
                    </Alert>
                  </CardContent>
                </Card>
              </Slide>
            )}
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default PayloadCalculator; 