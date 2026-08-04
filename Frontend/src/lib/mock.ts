export interface MockUser {
  id: number;
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  password: string;
}

export interface MockAttendance {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  hours: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface MockReport {
  id: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  date: string;
  note: string;
  createdAt: string;
  status: string;
}

export const MOCK_DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@primeoak.com', password: 'admin123' },
  { role: 'HR Manager', email: 'bokang@primeoak.com', password: 'hr123' },
  { role: 'Employee', email: 'boitumelo@primeoak.com', password: 'emp123' },
];

const LATENCY = 350;
const ROLE_LABEL: Record<MockUser['role'], string> = {
  admin: 'Admin',
  hr: 'HR Manager',
  employee: 'Employee',
};

let nextUserId = 100;
let nextReportId = 0;

const users: MockUser[] = [
  { id: 1, employeeId: '10000001', name: 'Olwethu', surname: 'Xaba', email: 'admin@primeoak.com', role: 'admin', password: 'admin123' },
  { id: 2, employeeId: '00003333', name: 'Bokang', surname: 'Ngwetjana', email: 'bokang@primeoak.com', role: 'hr', password: 'hr123' },
  { id: 3, employeeId: '00002222', name: 'Boitumelo', surname: 'Magashula', email: 'boitumelo@primeoak.com', role: 'employee', password: 'emp123' },
  { id: 4, employeeId: '00001111', name: 'Mooketsi', surname: 'Mogale', email: 'mooketsi@primeoak.com', role: 'employee', password: 'emp123' },
  { id: 5, employeeId: '00004444', name: 'Paballo', surname: 'Diphoko', email: 'paballo@primeoak.com', role: 'employee', password: 'emp123' },
  { id: 6, employeeId: '00005555', name: 'Bongiwe', surname: 'Siboza', email: 'bongiwe@primeoak.com', role: 'employee', password: 'emp123' },
  { id: 7, employeeId: '00006666', name: 'Junior', surname: 'Mphefo', email: 'junior@primeoak.com', role: 'employee', password: 'emp123' },
];

const attendance: MockAttendance[] = [
  { id: 'a1', employeeId: '00002222', date: '04 August 2026', clockIn: '08:02', clockOut: '16:30', hours: '8.5 Hrs', status: 'Present' },
  { id: 'a2', employeeId: '00002222', date: '03 August 2026', clockIn: '07:55', clockOut: '16:12', hours: '8.3 Hrs', status: 'Present' },
  { id: 'a3', employeeId: '00002222', date: '31 July 2026', clockIn: '08:31', clockOut: null, hours: 'Pending', status: 'Late' },
  { id: 'a4', employeeId: '00001111', date: '04 August 2026', clockIn: '08:10', clockOut: '16:00', hours: '7.8 Hrs', status: 'Present' },
  { id: 'a5', employeeId: '00003333', date: '04 August 2026', clockIn: '07:48', clockOut: '17:02', hours: '9.2 Hrs', status: 'Present' },
];

const reports: MockReport[] = [];

const sleep = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY));

function fail(message: string): never {
  throw new Error(message);
}

function encodeB64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeB64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(length)));
}

function bytesToB64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomChallenge(): string {
  return bytesToB64Url(randomBytes(32));
}

interface TokenPayload {
  id: number;
  employeeId: string;
  name: string;
  role: MockUser['role'];
}

function signToken(user: MockUser): string {
  const payload = encodeB64Url(JSON.stringify({ id: user.id, employeeId: user.employeeId, name: user.name, role: user.role }));
  return `${payload}.${Math.random().toString(36).slice(2)}.mock`;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[0];
    return JSON.parse(decodeB64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

interface ApiUserView {
  id: number;
  fullName: string;
  email: string;
  role: MockUser['role'];
  employeeId: string;
}

function apiUserView(user: MockUser): ApiUserView {
  return { id: user.id, fullName: `${user.name} ${user.surname}`, email: user.email, role: user.role, employeeId: user.employeeId };
}

interface EmployeeView {
  id: number;
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

function employeeView(user: MockUser): EmployeeView {
  return { id: user.id, employeeId: user.employeeId, name: user.name, surname: user.surname, email: user.email, role: ROLE_LABEL[user.role] };
}

function roleKey(label: string): MockUser['role'] {
  if (label.toLowerCase().includes('hr') || label.toLowerCase().includes('manager')) return 'hr';
  if (label.toLowerCase() === 'admin') return 'admin';
  return 'employee';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface MockRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export function mockAuthForEmployee(employeeId: string): { token: string; user: ApiUserView } {
  const user = users.find((u) => u.employeeId === employeeId);
  if (!user) throw new Error('Employee not found');
  return { token: signToken(user), user: apiUserView(user) };
}

export async function mockRequest<T>(path: string, options: MockRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const body = (options.body ?? {}) as Record<string, unknown>;
  const token = options.token === undefined ? localStorage.getItem('primeoak_token') : options.token;
  const auth = token ? decodeToken(token) : null;

  await sleep();

  switch (`${method} ${path}`) {
    case 'POST /api/auth/login': {
      const user = users.find((u) => u.email === body.email && u.password === body.password);
      if (!user) fail('Invalid email or password');
      return { token: signToken(user), user: apiUserView(user) } as T;
    }

    case 'GET /api/employees': {
      return {
        data: users.map(employeeView),
        pagination: { page: 1, limit: 10, total: users.length, totalPages: 1 },
      } as T;
    }

    case 'POST /api/employees': {
      const { name, surname, email, employeeId, password } = body as Record<string, string>;
      if (users.some((u) => u.email === email)) fail('Email already exists');
      if (users.some((u) => u.employeeId === employeeId)) fail('Employee ID already exists');
      const user: MockUser = {
        id: nextUserId++,
        employeeId,
        name,
        surname,
        email,
        role: roleKey((body.role as string) ?? 'Employee'),
        password: password ?? 'password123',
      };
      users.push(user);
      return employeeView(user) as T;
    }

    case 'POST /api/webauthn/register/options': {
      const user = users.find((u) => u.employeeId === body.employeeId);
      if (!user) fail('Employee not found');
      return {
        challenge: randomChallenge(),
        rp: { id: window.location.hostname, name: 'PrimeOak Solutions' },
        user: { id: bytesToB64Url(randomBytes(16)), name: user.email, displayName: `${user.name} ${user.surname}` },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
        excludeCredentials: [],
      } as T;
    }

    case 'POST /api/webauthn/register/verify': {
      const user = users.find((u) => u.employeeId === body.employeeId);
      if (!user) fail('Employee not found');
      return { message: 'Biometric registered', credentialId: (body.id as string) ?? 'mock-credential' } as T;
    }

    case 'POST /api/webauthn/authenticate/options': {
      const user = users.find((u) => u.employeeId === body.employeeId);
      if (!user) fail('Employee not found');
      return {
        challenge: randomChallenge(),
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: 'required',
        allowCredentials: [],
      } as T;
    }

    case 'POST /api/webauthn/authenticate/verify': {
      const user = users.find((u) => u.employeeId === body.employeeId);
      if (!user) fail('Employee not found');
      return { token: signToken(user), user: apiUserView(user) } as T;
    }

    case 'POST /api/attendance/clock-in': {
      if (!auth) fail('Not authenticated');
      const now = new Date();
      const record: MockAttendance = {
        id: `a${Date.now()}`,
        employeeId: auth.employeeId,
        date: formatDate(now),
        clockIn: formatTime(now),
        clockOut: null,
        hours: 'Pending',
        status: 'Present',
      };
      attendance.unshift(record);
      return { message: 'Clocked in successfully', record } as T;
    }

    case 'POST /api/attendance/clock-out': {
      if (!auth) fail('Not authenticated');
      const latest = attendance.find((r) => r.employeeId === auth.employeeId && r.clockOut === null);
      if (!latest) fail('You have not clocked in yet');
      const now = new Date();
      const [hour, minute] = latest.clockIn.split(':').map(Number);
      const clockInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
      const hours = ((now.getTime() - clockInDate.getTime()) / 3_600_000).toFixed(1);
      latest.clockOut = formatTime(now);
      latest.hours = `${hours} Hrs`;
      return { message: 'Clocked out successfully', record: latest } as T;
    }

    case 'GET /api/attendance': {
      if (!auth) fail('Not authenticated');
      const data = attendance.filter((r) => r.employeeId === auth.employeeId);
      return { data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } } as T;
    }

    case 'POST /api/reports': {
      if (!auth) fail('Not authenticated');
      const { reason, date, note } = body as Record<string, string>;
      const user = users.find((u) => u.id === auth.id);
      const report: MockReport = {
        id: `rpt-${String(++nextReportId).padStart(3, '0')}`,
        employeeId: auth.employeeId,
        employeeName: user ? `${user.name} ${user.surname}` : auth.name,
        reason,
        date,
        note: note ?? '',
        createdAt: new Date().toISOString(),
        status: 'Open',
      };
      reports.unshift(report);
      return report as T;
    }

    case 'GET /api/reports': {
      if (!auth) fail('Not authenticated');
      const data = reports.filter((r) => r.employeeId === auth.employeeId);
      return { data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } } as T;
    }

    case 'GET /api/profile': {
      if (!auth) fail('Not authenticated');
      const user = users.find((u) => u.id === auth.id);
      if (!user) fail('Profile not found');
      return { id: user.id, fullName: `${user.name} ${user.surname}`, email: user.email, role: ROLE_LABEL[user.role], avatar: null } as T;
    }

    case 'PUT /api/profile': {
      if (!auth) fail('Not authenticated');
      const user = users.find((u) => u.id === auth.id);
      if (!user) fail('Profile not found');
      const { fullName, email } = body as Record<string, string>;
      if (fullName) {
        const parts = fullName.trim().split(/\s+/);
        user.name = parts[0] ?? user.name;
        user.surname = parts.slice(1).join(' ') || user.surname;
      }
      if (email) user.email = email;
      return { message: 'Profile updated successfully', user: apiUserView(user) } as T;
    }

    default:
      fail(`Mock API: no handler for ${method} ${path}`);
  }

  throw new Error(`Mock API: no handler for ${method} ${path}`);
}
