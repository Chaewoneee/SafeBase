'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { TrendDataPoint } from '@/types';

interface TrendChartProps {
  data: TrendDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '8px',
      padding: '12px 16px',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '8px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 500 }}>
          {entry.name}: {entry.value}건
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradDanger" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCaution" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#94A3B8', paddingTop: '8px' }}
        />
        <Area type="monotone" dataKey="danger" name="위험" stackId="1" stroke="#DC2626" fill="url(#gradDanger)" strokeWidth={2} />
        <Area type="monotone" dataKey="warning" name="경고" stackId="1" stroke="#F97316" fill="url(#gradWarning)" strokeWidth={2} />
        <Area type="monotone" dataKey="caution" name="주의" stackId="1" stroke="#F59E0B" fill="url(#gradCaution)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
