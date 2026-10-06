import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend
} from 'recharts';

const performanceData = [
  { metric: 'Initial JS Payload', before: 380, after: 125, unit: 'KB' },
  { metric: 'First Contentful Paint', before: 1800, after: 620, unit: 'ms' },
  { metric: 'Time to Interactive', before: 2400, after: 850, unit: 'ms' },
  { metric: 'Speed Index', before: 2100, after: 750, unit: 'ms' },
  { metric: 'Lighthouse Perf Score', before: 68, after: 99, unit: '/100' }
];

const skillRadarData = [
  { subject: 'React & Hooks', A: 95, fullMark: 100 },
  { subject: 'Code Splitting', A: 90, fullMark: 100 },
  { subject: 'Web Performance', A: 88, fullMark: 100 },
  { subject: 'State Mgmt', A: 85, fullMark: 100 },
  { subject: 'Full Stack APIs', A: 92, fullMark: 100 },
  { subject: 'DevTools Profiling', A: 90, fullMark: 100 },
];

export default function ProjectAnalyticsChart() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Performance Comparison Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            📊 Performance Benchmark: Before vs After Lazy Loading
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Comparing single bundle vs route-split code execution
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="metric" stroke="var(--text-muted)" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="before" name="Before (Single Bundle)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" name="After (Lazy Loaded Chunks)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--accent-purple)' }}>
            🎯 Optimization & React Competency Matrix
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Evaluated proficiency across core performance skills
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Radar name="Proficiency %" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
