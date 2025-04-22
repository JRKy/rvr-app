import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface FuelEntry {
  id: string;
  date: Date;
  odometer: number;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  mpg: number;
}

interface FormData {
  odometer: number;
  gallons: number;
  pricePerGallon: number;
}

const FuelTracker = () => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const lastEntry = entries[entries.length - 1];
    const milesDriven = lastEntry ? data.odometer - lastEntry.odometer : 0;
    const mpg = milesDriven > 0 ? milesDriven / data.gallons : 0;
    
    const newEntry: FuelEntry = {
      id: Date.now().toString(),
      date: new Date(),
      odometer: data.odometer,
      gallons: data.gallons,
      pricePerGallon: data.pricePerGallon,
      totalCost: data.gallons * data.pricePerGallon,
      mpg: mpg,
    };

    setEntries([...entries, newEntry]);
    reset();
  };

  const calculateStats = () => {
    if (entries.length === 0) return null;

    const totalGallons = entries.reduce((sum, entry) => sum + entry.gallons, 0);
    const totalCost = entries.reduce((sum, entry) => sum + entry.totalCost, 0);
    const averageMPG = entries.reduce((sum, entry) => sum + entry.mpg, 0) / entries.length;
    const totalMiles = entries[entries.length - 1].odometer - entries[0].odometer;

    return {
      totalGallons,
      totalCost,
      averageMPG,
      totalMiles,
      costPerMile: totalCost / totalMiles,
    };
  };

  const stats = calculateStats();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: 4
          }}
        >
          RVR - Fuel Tracker
        </Typography>

        <Box sx={{ display: 'grid', gap: 4 }}>
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Odometer Reading"
                    type="number"
                    {...register('odometer', { required: true, min: 0 })}
                    error={!!errors.odometer}
                    helperText={errors.odometer?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                      '& input': {
                        textAlign: 'right',
                        paddingRight: '8px'
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
                    label="Gallons Filled"
                    type="number"
                    {...register('gallons', { required: true, min: 0 })}
                    error={!!errors.gallons}
                    helperText={errors.gallons?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                      '& input': {
                        textAlign: 'right',
                        paddingRight: '8px'
                      }
                    }}
                    inputProps={{ 
                      step: "0.01",
                      min: "0"
                    }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Price per Gallon"
                    type="number"
                    {...register('pricePerGallon', { required: true, min: 0 })}
                    error={!!errors.pricePerGallon}
                    helperText={errors.pricePerGallon?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                      '& input': {
                        textAlign: 'right',
                        paddingRight: '8px'
                      }
                    }}
                    inputProps={{ 
                      step: "0.01",
                      min: "0"
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Add Fuel Entry
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {stats && (
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    mb: 3
                  }}
                >
                  Fuel Statistics
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& > *': {
                    flex: '1 1 200px',
                    minWidth: '200px'
                  }
                }}>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Total Miles</Typography>
                    <Typography variant="h6">{stats.totalMiles.toLocaleString()}</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Average MPG</Typography>
                    <Typography variant="h6">{stats.averageMPG.toFixed(1)}</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Total Fuel Cost</Typography>
                    <Typography variant="h6">${stats.totalCost.toFixed(2)}</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Cost per Mile</Typography>
                    <Typography variant="h6">${stats.costPerMile.toFixed(2)}</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          )}

          {entries.length > 0 && (
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    mb: 3
                  }}
                >
                  Fuel History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Odometer</TableCell>
                        <TableCell align="right">Gallons</TableCell>
                        <TableCell align="right">Price/Gal</TableCell>
                        <TableCell align="right">Total Cost</TableCell>
                        <TableCell align="right">MPG</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                          <TableCell align="right">{entry.odometer.toLocaleString()}</TableCell>
                          <TableCell align="right">{entry.gallons.toFixed(2)}</TableCell>
                          <TableCell align="right">${entry.pricePerGallon.toFixed(2)}</TableCell>
                          <TableCell align="right">${entry.totalCost.toFixed(2)}</TableCell>
                          <TableCell align="right">{entry.mpg.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default FuelTracker; 