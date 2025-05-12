import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ProceduresOverviewTab = ({ currentProcedures, currentCategories, COLORS }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Procedure Growth Rates (%)" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={currentProcedures}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 20]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                <Legend />
                <Bar dataKey="growth" fill="#8884d8" name="Annual Growth Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Market Size by Procedure (2025 Projected, $B)" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={currentProcedures}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 12]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                <Legend />
                <Bar dataKey="marketSize2025" fill="#82ca9d" name="Market Size (Billion USD)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Procedures Detail" />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Procedure</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Growth Rate (%)</strong></TableCell>
                    <TableCell><strong>Market Size 2025 ($B)</strong></TableCell>
                    <TableCell><strong>Primary Age Group</strong></TableCell>
                    <TableCell><strong>Current Trends</strong></TableCell>
                    <TableCell><strong>Future Outlook</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProcedures.map((procedure) => (
                    <TableRow key={procedure.name}>
                      <TableCell>{procedure.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={procedure.category} 
                          size="small"
                          sx={{ backgroundColor: currentCategories ? COLORS[currentCategories.indexOf(procedure.category) % COLORS.length] + '40' : '#ccc', 
                               color: 'text.primary' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${procedure.growth}%`} 
                          color={procedure.growth > 10 ? "success" : "primary"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${procedure.marketSize2025}B</TableCell>
                      <TableCell>{procedure.primaryAgeGroup}</TableCell>
                      <TableCell>{procedure.trends}</TableCell>
                      <TableCell>{procedure.futureOutlook}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProceduresOverviewTab;
