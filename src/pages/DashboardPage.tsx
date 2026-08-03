import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';
import { apiGet } from '../services/api';
import { getEmployees } from '../services/employeeService';
import { getCurrentHr } from '../services/authService';

interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  attendanceDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedHours: number;
  overtimeHours: number;
  status: string;
}

interface WeeklyAttendance {
  day: string;
  date: string;
  present: number;
  absent: number;
}

function getDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLastFiveWeekdays(): Array<{
  day: string;
  date: string;
}> {
  const dates: Array<{
    day: string;
    date: string;
  }> = [];

  const currentDate = new Date();

  while (dates.length < 5) {
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.unshift({
        day: currentDate.toLocaleDateString(
          'en-ZA',
          {
            weekday: 'long',
          },
        ),
        date: getDateOnly(currentDate),
      });
    }

    currentDate.setDate(
      currentDate.getDate() - 1,
    );
  }

  return dates;
}

export function DashboardPage() {
  const [totalEmployees, setTotalEmployees] =
    useState(0);

  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord[]>([]);

  const [attendanceHistory, setAttendanceHistory] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentHr = getCurrentHr();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [
          employees,
          todayRecords,
          historyRecords,
        ] = await Promise.all([
          getEmployees(),

          apiGet<AttendanceRecord[]>(
            '/Attendance/today',
          ),

          apiGet<AttendanceRecord[]>(
            '/Attendance/history',
          ),
        ]);

        setTotalEmployees(employees.length);
        setTodayAttendance(todayRecords);
        setAttendanceHistory(historyRecords);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load dashboard data.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const presentToday = useMemo(
    () =>
      todayAttendance.filter(
        (record) =>
          record.status.toLowerCase() !==
          'absent',
      ).length,
    [todayAttendance],
  );

  const absentToday = useMemo(
    () =>
      todayAttendance.filter(
        (record) =>
          record.status.toLowerCase() ===
          'absent',
      ).length,
    [todayAttendance],
  );

  const weeklyData = useMemo<
    WeeklyAttendance[]
  >(() => {
    const weekdays = getLastFiveWeekdays();

    return weekdays.map((weekday) => {
      const recordsForDay =
        attendanceHistory.filter(
          (record) =>
            record.attendanceDate ===
            weekday.date,
        );

      const present =
        recordsForDay.filter(
          (record) =>
            record.status.toLowerCase() !==
            'absent',
        ).length;

      const absent =
        recordsForDay.filter(
          (record) =>
            record.status.toLowerCase() ===
            'absent',
        ).length;

      return {
        ...weekday,
        present,
        absent,
      };
    });
  }, [attendanceHistory]);

  const maxVal = useMemo(() => {
    const highestValue = Math.max(
      totalEmployees,
      ...weeklyData.map(
        (record) =>
          record.present + record.absent,
      ),
      1,
    );

    return highestValue;
  }, [totalEmployees, weeklyData]);

  const yAxisValues = useMemo(() => {
    const values: number[] = [];

    for (let step = 0; step <= 5; step += 1) {
      values.push(
        Math.round((maxVal / 5) * step),
      );
    }

    return values;
  }, [maxVal]);

  const stats = [
    {
      label: 'Total employees',
      value: loading
        ? '...'
        : totalEmployees.toString(),
      icon: 'employees',
      cls: 'blue',
    },
    {
      label: 'Present Today',
      value: loading
        ? '...'
        : presentToday.toString(),
      icon: 'present',
      cls: 'green',
    },
    {
      label: 'Absent Today',
      value: loading
        ? '...'
        : absentToday.toString(),
      icon: 'absent',
      cls: 'red',
    },
  ];

  return (
    <>
      <h1 className="page-title">
        HR Dashboard
      </h1>

      <p className="welcome-text">
        Welcome back
        {currentHr?.name
          ? `, ${currentHr.name}`
          : ''}
      </p>

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      <section className="stats-row">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`stat-card ${stat.cls}`}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: index * 0.1,
            }}
          >
            <div className="icon-wrapper">
              <Icon
                name={stat.icon as any}
                className="w-5 h-5"
              />
            </div>

            <div className="stat-info">
              <span className="stat-label">
                {stat.label}
              </span>

              <span className="stat-value">
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="card-panel">
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot green" />
              Present
            </div>

            <div className="legend-item">
              <span className="legend-dot red" />
              Absent
            </div>
          </div>

          <div className="chart-body">
            <div className="y-axis">
              {yAxisValues.map((value) => (
                <span key={value}>
                  {value}
                </span>
              ))}
            </div>

            <div className="grid-lines">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="grid-line"
                />
              ))}
            </div>

            <div className="chart-columns">
              {weeklyData.map(
                (record, index) => {
                  const presentPercentage =
                    (record.present / maxVal) *
                    100;

                  const absentPercentage =
                    (record.absent / maxVal) *
                    100;

                  return (
                    <motion.div
                      key={record.date}
                      className="column-group"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.3,
                        delay:
                          0.3 + index * 0.08,
                      }}
                    >
                      <div
                        className="bar"
                        style={{
                          height: '100%',
                        }}
                      >
                        <motion.div
                          className="bar-segment red"
                          initial={{
                            height: 0,
                          }}
                          animate={{
                            height: `${absentPercentage}%`,
                          }}
                          transition={{
                            duration: 0.4,
                            delay:
                              0.4 +
                              index * 0.08,
                          }}
                          title={`${record.absent} absent`}
                        />

                        <motion.div
                          className="bar-segment green"
                          initial={{
                            height: 0,
                          }}
                          animate={{
                            height: `${presentPercentage}%`,
                          }}
                          transition={{
                            duration: 0.4,
                            delay:
                              0.5 +
                              index * 0.08,
                          }}
                          title={`${record.present} present`}
                        />
                      </div>

                      <span className="x-label">
                        {record.day}
                      </span>
                    </motion.div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Today&apos;s Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Attendance records
              </span>

              <strong className="text-slate-900 dark:text-slate-100">
                {loading
                  ? '...'
                  : todayAttendance.length}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Total hours worked
              </span>

              <strong className="text-slate-900 dark:text-slate-100">
                {loading
                  ? '...'
                  : todayAttendance
                      .reduce(
                        (total, record) =>
                          total +
                          record.totalWorkedHours,
                        0,
                      )
                      .toFixed(2)}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Overtime hours
              </span>

              <strong className="text-slate-900 dark:text-slate-100">
                {loading
                  ? '...'
                  : todayAttendance
                      .reduce(
                        (total, record) =>
                          total +
                          record.overtimeHours,
                        0,
                      )
                      .toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}