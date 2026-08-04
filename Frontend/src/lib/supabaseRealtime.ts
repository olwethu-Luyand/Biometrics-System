import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type RealtimeTable = 'users' | 'attendance' | 'reports' | 'payroll' | 'audit_logs';

const TABLES: RealtimeTable[] = ['users', 'attendance', 'reports', 'payroll', 'audit_logs'];

const subscribers = new Map<RealtimeTable, Set<() => void>>();

if (supabase) {
  const channel = supabase.channel('primeoak-changes');
  for (const table of TABLES) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      subscribers.get(table)?.forEach((cb) => cb());
    });
  }
  channel.subscribe();
}

export function subscribeToTable(table: RealtimeTable, callback: () => void): () => void {
  if (!subscribers.has(table)) subscribers.set(table, new Set());
  subscribers.get(table)?.add(callback);
  return () => {
    subscribers.get(table)?.delete(callback);
  };
}

export function useTableVersion(table: RealtimeTable): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeToTable(table, () => setVersion((v) => v + 1)), [table]);
  return version;
}
