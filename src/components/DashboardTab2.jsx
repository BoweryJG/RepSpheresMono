import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader
} from '@mui/material';
import { 
  AreaChart, 
  Area, 
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
  ResponsiveContainer,
  Treemap
} from 'recharts';

const MarketAnalysisTab = ({ 
  currentMarketGrowth, 
  topMarketSizeProcedures, 
  categoryData, 
  treemapData, 
  industryTitle, 
  COLORS 
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={`${industryTitle} Market Growth (2020-2030, $B)`} />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentMarketGrowth}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorSize)" 
                  name="Market Size (Billion USD)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top Procedures by Market Size (2025)" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topMarketSizeProcedures}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 12]} />
                <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                <Legend />
                <Bar dataKey="marketSize2025" fill="#82ca9d" name="Market Size (Billion USD)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Category Market Distribution 2025" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="marketSize"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(1)}B`, 'Market Size']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Market Size Distribution by Procedure and Category" />
          <CardContent sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip 
                  formatter={(value, name, props) => [`$${value.toFixed(1)}B`, name]} 
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
                          {data.size && <p>Market Size: ${data.size.toFixed(1)}B</p>}
                          {data.growth && <p>Growth Rate: {data.growth}%</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MarketAnalysisTab;
