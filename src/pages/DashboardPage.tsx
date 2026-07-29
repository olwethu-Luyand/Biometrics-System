import { motion } from 'framer-motion';

const weeklyData = [
  { day: 'Monday', present: 9, absent: 1 },
  { day: 'Tuesday', present: 8, absent: 2 },
  { day: 'Wednesday', present: 10, absent: 0 },
  { day: 'Thursday', present: 9, absent: 1 },
  { day: 'Friday', present: 6, absent: 4 },
];

const maxVal = 10;

export function DashboardPage() {
  return (
    <>
      <h1 className="page-title">HR Dashboard</h1>
      <p className="welcome-text">Welcome back, Olwethu</p>

      <section className="stats-row">
        {[
          { label: 'Total employees', value: '10', icon: 'fa-users', cls: 'blue' },
          { label: 'Present Today', value: '7', icon: 'fa-user-check', cls: 'green' },
          { label: 'Absent Today', value: '3', icon: 'fa-user-minus', cls: 'red' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.cls}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
          >
            <div className="icon-wrapper"><i className={`fa-solid ${s.icon}`} /></div>
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
              <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
            </div>
            <div className="grid-lines">
              <div className="grid-line" /><div className="grid-line" /><div className="grid-line" />
              <div className="grid-line" /><div className="grid-line" /><div className="grid-line" />
            </div>
            <div className="chart-columns">
              {weeklyData.map((d, i) => {
                const presentPct = (d.present / maxVal) * 100;
                const absentPct = (d.absent / maxVal) * 100;
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
