'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import type { TeamAnomalyData } from '@/types';

interface TeamChartProps {
  data: TeamAnomalyData[];
}

const TEAM_COLORS = [
  '#DC2626', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#14B8A6', '#06B6D4',
  '#3B82F6', '#8B5CF6'
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TeamAnomalyData }> }) => {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '8px',
      padding: '12px 16px',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{d.team}</p>
      <p style={{ color: '#F87171', fontSize: '13px' }}>이상 거래: {d.count}건</p>
      <p style={{ color: '#94A3B8', fontSize: '12px' }}>비율: {d.percentage.toFixed(1)}%</p>
    </div>
  );
};

export default function TeamChart({ data }: TeamChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" vertical={false} />
        <XAxis
          dataKey="team"
          stroke="#64748B"
          fontSize={10}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.2)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {sorted.map((_, index) => (
            <Cell key={index} fill={TEAM_COLORS[index % TEAM_COLORS.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
