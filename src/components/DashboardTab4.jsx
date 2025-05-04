import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter,
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const GrowthPredictionsTab = ({ 
  topGrowthProcedures, 
  currentProcedures, 
  categoryData, 
  currentCategories, 
  isDental,
  COLORS,
  allProcedures
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top 5 Procedures by Growth Rate" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topGrowthProcedures}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 20]} />
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
          <CardHeader title="Growth vs. Market Size" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="marketSize2025" 
                  name="Market Size" 
                  domain={[0, 12]}
                  label={{ value: 'Market Size (Billion USD)', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="growth" 
                  name="Growth Rate" 
                  domain={[0, 20]}
                  label={{ value: 'Growth Rate (%)', angle: -90, position: 'left' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    return name === 'Growth Rate' 
                      ? [`${value}%`, name] 
                      : [`$${value}B`, 'Market Size'];
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ 
                          backgroundColor: '#fff', 
                          padding: '10px', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}>
                          <p><strong>{data.name}</strong></p>
                          <p>Market Size: ${data.marketSize2025}B</p>
                          <p>Growth Rate: {data.growth}%</p>
                          <p>Category: {data.category}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Scatter 
                  name="Procedures" 
                  data={currentProcedures} 
                  fill="#8884d8" 
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top Growth Categories (2025-2030)" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={150} data={categoryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 20]} />
                <Radar 
                  name="Average Growth Rate (%)" 
                  dataKey={(entry => {
                    const procs = allProcedures.filter(p => p.category === entry.name);
                    return procs.reduce((sum, p) => sum + p.growth, 0) / procs.length;
                  })}
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Avg. Growth Rate']} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="10-Year Growth Forecast Highlights" />
          <CardContent sx={{ height: 400, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Growth Drivers for {isDental ? "Dental" : "Aesthetic"} Industry
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Short-term (1-3 Years)
              </Typography>
              <Typography variant="body1" paragraph>
                {isDental 
                  ? "Digital technology adoption, clear aligner expansion, and AI diagnostics will drive near-term growth. The post-pandemic catch-up in delayed treatments continues to boost procedure volumes."
                  : "Non-invasive technologies, preventative 'prejuvenation' treatments for younger patients, and expanded male market penetration will be the primary near-term drivers."
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Mid-term (3-5 Years)
              </Typography>
              <Typography variant="body1" paragraph>
                {isDental 
                  ? "Integration of 3D printing for chairside restorations, telehealth monitoring for orthodontics, and regenerative dental materials will shape the mid-term market."
                  : "Combination treatments, longer-lasting injectables, and the integration of regenerative technologies will significantly expand the mid-term market opportunities."
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Long-term (5-10 Years)
              </Typography>
              <Typography variant="body1" paragraph>
                {isDental 
                  ? "Bioprinting for replacement tissues, AI-driven personalized treatment planning, and complete digital workflows will transform long-term industry growth potential."
                  : "Gene therapy for aesthetic applications, expanded applications for exosome and stem cell treatments, and AI-personalized protocols will define the long-term market evolution."
                }
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Emerging Trends to Watch
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>1.</strong> {isDental 
                  ? "Integration of systemic health monitoring with oral health analytics"
                  : "Personalized skincare formulations based on genetic and microbiome analysis"
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>2.</strong> {isDental 
                  ? "Subscription-based preventive care models and memberships"
                  : "Virtual reality consultations and treatment simulations"
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>3.</strong> {isDental 
                  ? "Robotics for minimally invasive surgical procedures"
                  : "Environmental protection skincare and treatments (pollution, blue light, etc.)"
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>4.</strong> {isDental 
                  ? "Nanotechnology for targeted drug delivery in periodontal treatments"
                  : "Hormone optimization integration with aesthetic treatment protocols"
                }
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>5.</strong> {isDental 
                  ? "AI-powered smile design with emotional response prediction"
                  : "Gut-skin axis treatments addressing microbiome for aesthetic outcomes"
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Procedure Future Outlook" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Procedure</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Current Growth</strong></TableCell>
                    <TableCell><strong>Market Size 2025</strong></TableCell>
                    <TableCell><strong>5-Year Outlook</strong></TableCell>
                    <TableCell><strong>10-Year Outlook</strong></TableCell>
                    <TableCell><strong>Key Growth Factors</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topGrowthProcedures.map((procedure) => (
                    <TableRow key={procedure.name}>
                      <TableCell>{procedure.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={procedure.category} 
                          size="small"
                          sx={{ backgroundColor: COLORS[currentCategories.indexOf(procedure.category) % COLORS.length] + '40', 
                               color: 'text.primary' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${procedure.growth}%`} 
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${procedure.marketSize2025}B</TableCell>
                      <TableCell>
                        {procedure.growth > 15 
                          ? "Very strong growth trajectory"
                          : procedure.growth > 10 
                          ? "Strong growth trajectory"
                          : "Moderate growth trajectory"
                        }
                      </TableCell>
                      <TableCell>
                        {isDental 
                          ? (procedure.category === "Digital Dentistry"
                            ? "Expected to become standard of care across most practices"
                            : procedure.category === "Cosmetic"
                            ? "Continued strong demand with improved materials and techniques"
                            : procedure.category === "Orthodontics" && procedure.name.includes("Clear")
                            ? "Potential market saturation with emergence of new competitors"
                            : "Steady growth with technological advancements"
                          )
                          : (procedure.category === "Advanced Treatments"
                            ? "Exponential growth as research validates effectiveness"
                            : procedure.category === "Injectables"
                            ? "Strong but moderating growth as market matures"
                            : procedure.category === "Energy-Based"
                            ? "Continued innovation driving strong long-term prospects"
                            : "Expansion into new demographic segments"
                          )
                        }
                      </TableCell>
                      <TableCell>
                        {isDental 
                          ? (procedure.category === "Digital Dentistry"
                            ? "Technology cost reduction, workflow efficiency, improved outcomes"
                            : procedure.category === "Cosmetic"
                            ? "Social media influence, aging population, minimally invasive options"
                            : procedure.category === "Orthodontics"
                            ? "Adult treatment acceptance, telehealth integration, aesthetic focus"
                            : "Aging population, insurance coverage, preventive focus"
                          )
                          : (procedure.category === "Advanced Treatments"
                            ? "Clinical validation, increased accessibility, natural approach demand"
                            : procedure.category === "Injectables"
                            ? "Younger demographic adoption, male market, longer-lasting formulations"
                            : procedure.category === "Energy-Based"
                            ? "Non-invasive preference, technological improvements, combination treatments"
                            : "Personalization, wellness integration, subscription models"
                          )
                        }
                      </TableCell>
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

export default GrowthPredictionsTab;
