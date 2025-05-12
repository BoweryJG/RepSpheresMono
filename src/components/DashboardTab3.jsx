import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const PatientDemographicsTab = ({ 
  currentDemographics, 
  currentGenderDistribution, 
  currentProcedures, 
  currentCategories, 
  isDental,
  COLORS 
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Patient Age Distribution" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentDemographics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis domain={[0, 40]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8" name="Percentage of Patients (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Gender Distribution" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentGenderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Procedures by Age Group" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Procedure</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Primary Age Group</strong></TableCell>
                    <TableCell><strong>Key Demographic Factors</strong></TableCell>
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
                      <TableCell>{procedure.primaryAgeGroup}</TableCell>
                      <TableCell>
                        {isDental
                          ? (procedure.category === "Cosmetic" 
                            ? "Middle to high income, image-conscious, social media influenced" 
                            : procedure.category === "Orthodontics"
                            ? "Youth and increasingly adults, image-conscious, disposable income"
                            : procedure.category === "Preventive"
                            ? "All demographics, education-level correlation, insurance-driven"
                            : procedure.category === "Restorative"
                            ? "Varies by specific procedure, often need-based, insurance coverage important"
                            : procedure.category === "Periodontics"
                            ? "Middle-aged and older adults, health-conscious, systemic health awareness"
                            : procedure.category === "Endodontics"
                            ? "All income levels, pain-driven, insurance coverage important"
                            : procedure.category === "Oral Surgery"
                            ? "Mix of need-based and elective, varies by procedure type"
                            : procedure.category === "Pediatric"
                            ? "Children and adolescents, parent decision-making, prevention focused"
                            : "Early adopters, technology-focused practices, efficiency-driven"
                          )
                          : (procedure.category === "Injectables"
                            ? "Working professionals, image-conscious, recurring treatment model"
                            : procedure.category === "Energy-Based"
                            ? "Middle to high income, aging concerns, minimal downtime preference"
                            : procedure.category === "Body Contouring"
                            ? "Middle to high income, fitness-conscious but time-limited"
                            : procedure.category === "Skin Treatments"
                            ? "Wide demographic range, skin-health conscious, brand-loyal"
                            : procedure.category === "Advanced Treatments"
                            ? "Early adopters, high-income, health-conscious, regenerative focus"
                            : procedure.category === "Hair Treatments"
                            ? "Predominantly male (70%), image-conscious, professional environment"
                            : procedure.category === "Vascular Treatments"
                            ? "Middle-aged to older adults, appearance and comfort concerns"
                            : "Wellness-focused, holistic approach to beauty, health-conscious"
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

export default PatientDemographicsTab;
