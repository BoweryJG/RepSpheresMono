import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Demo/mock ticker data
const demoItems = [
  {
    label: 'US Dental Implants',
    value: '+2.1% MoM',
    trend: 'up',
    color: '#4CAF50',
  },
  {
    label: 'Aesthetic Market Value',
    value: '+$3.2B YoY',
    trend: 'up',
    color: '#FFD700',
  },
  {
    label: 'New FDA Approval',
    value: 'XYZ Laser Device',
    trend: 'news',
    color: '#EF8354',
  },
  {
    label: 'Practices Added',
    value: '+17 this week',
    trend: 'up',
    color: '#2D3142',
  },
  {
    label: 'Patient Demographics',
    value: '18-34 up 4%',
    trend: 'up',
    color: '#A9D6E5',
  },
];

export default function DashboardTicker({ items = demoItems, interval = 3500 }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearTimeout(timeoutRef.current);
  }, [index, items.length, interval]);

  const current = items[index];

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 1, md: 3 },
        py: 1,
        mb: 2,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.55)',
        boxShadow: '0 2px 8px 0 rgba(44,49,66,0.07)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        position: 'relative',
        gap: 2,
      }}
    >
      <Chip
        icon={<FiberManualRecordIcon sx={{ color: '#EF8354', fontSize: 18, animation: 'pulse 1.2s infinite alternate' }} />}
        label="LIVE"
        sx={{
          fontWeight: 800,
          color: '#2D3142',
          background: 'rgba(255,215,0,0.15)',
          border: '1.5px solid #FFD700',
          mr: 2,
          px: 1.5,
          letterSpacing: 1,
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0.4 },
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: '#2D3142',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 18,
            mr: 1.5,
            transition: 'color 0.3s',
          }}
        >
          {current.label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: current.color,
            fontSize: 18,
            whiteSpace: 'nowrap',
            transition: 'color 0.3s',
          }}
        >
          {current.value}
        </Typography>
      </Box>
    </Box>
  );
}
