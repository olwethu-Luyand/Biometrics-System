import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useTableVersion } from '../lib/supabaseRealtime';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Stats {
  total: number;
  present: number;
  absent: number;
}

interface DashboardPageProps {
  userName?: string;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DashboardPage({ userName = 'Olwethu' }: DashboardPageProps) {
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, absent: 0 });
  const [weekly, setWeekly] = useState<{ day: string; present: number; absent: number }[]>([]);
  const [source, setSource] = useState<'supabase' | 'mock'>('mock');
  const attendanceVersion = useTableVersion('attendance');
  const usersVersion = useTableVersion('users');

  useEffect(() => {
    if (!supabase) return;
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const todayIso = toIso(new Date());

    Promise.all([
      supabase.from('employee_roster').select('employee_id'),
      supabase.from('attendance').select('employee_id, date, clock_in').gte('date', toIso(start)),
    ])
      .then(([usersRes, attRes]) => {
        if (usersRes.error || attRes.error || !usersRes.data) return;
        const total = usersRes.data.length;
        const rows = attRes.data ?? [];
        const presentToday = rows.filter((r) => r.date === todayIso && r.clock_in).length;
        setStats({ total, present: presentToday, absent: Math.max(total - presentToday, 0) });

        const presentByDate = new Map<string, number>();
        for (const r of rows) {
          if (r.clock_in) presentByDate.set(r.date, (presentByDate.get(r.date) ?? 0) + 1);
        }
        const week: { day: string; present: number; absent: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const presentCount = presentByDate.get(toIso(d)) ?? 0;
          week.push({ day: DAY_NAMES[d.getDay()], present: presentCount, absent: Math.max(total - presentCount, 0) });
        }
        setWeekly(week);
        setSource('supabase');
      })
      .catch(() => {});
  }, [attendanceVersion, usersVersion]);

  const axisMax = Math.max(Math.ceil(Math.max(...weekly.flatMap((d) => [d.present, d.absent]), 2) / 2) * 2, 2);

  return (
    <>
      <h1 className="page-title">HR Dashboard</h1>
      <p className="welcome-text">Welcome back, {userName}</p>
      <p className="text-xs text-slate-400 mb-4">Data source: {source === 'supabase' ? 'Supabase' : 'Mock'}</p>

      <section className="stats-row">
        {[
          { label: 'Total employees', value: String(stats.total), icon: 'employees', cls: 'blue' },
          { label: 'Present Today', value: String(stats.present), icon: 'present', cls: 'green' },
          { label: 'Absent Today', value: String(stats.absent), icon: 'absent', cls: 'red' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.cls}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
          >
            <div className="icon-wrapper"><Icon name={s.icon as never} className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="card-panel">
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot green" /> Present</div>
            <div className="legend-item"><span className="legend-dot red" /> Absent</div>
          </div>
          <div className="chart-body">
            <div className="y-axis">
              <span>0</span><span>{axisMax / 2}</span><span>{axisMax}</span>
            </div>
            <div className="grid-lines">
              <div className="grid-line" /><div className="grid-line" /><div className="grid-line" />
            </div>
            <div className="chart-columns">
              {weekly.map((d, i) => {
                const presentPct = (d.present / axisMax) * 100;
                const absentPct = (d.absent / axisMax) * 100;
                return (
                  <motion.div
                    key={d.day}
                    className="column-group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  >
                    <div className="bar" style={{ height: '100%' }}>
                      <motion.div
                        className="bar-segment red"
                        initial={{ height: 0 }}
                        animate={{ height: `${absentPct}%` }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                      />
                      <motion.div
                        className="bar-segment green"
                        initial={{ height: 0 }}
                        animate={{ height: `${presentPct}%` }}
                        transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                      />
                    </div>
                    <span className="x-label">{d.day}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card-panel" />
      </section>
    </>
  );
}
