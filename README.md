# PrimeOak Solutions — HR Dashboard

HR dashboard application built with Vite, React, TypeScript, and Tailwind CSS. Features authentication, employee management, attendance tracking, payroll, reporting, and profile management.

## Tech Stack

- **Vite** — dev server & bundler
- **React 19** — UI library
- **TypeScript 6** — type safety
- **Tailwind CSS 3** — utility-first styling
- **lucide-react** — icon library
- **Font Awesome 6** — icon library (via CDN)
- **framer-motion** — page transitions and UI animations

## Project Structure

```
primeoak-auth/
├── src/
│   ├── assets/                     # Images (logo.jpeg, prime_oak.jpeg, user-Logo.jpg)
│   ├── components/
│   │   ├── auth/                   # SignIn, SignUp, TermsPage
│   │   └── layout/
│   │       └── Sidebar.tsx         # Navigation sidebar
│   ├── pages/
│   │   ├── DashboardPage.tsx       # HR Dashboard with metrics & chart
│   │   ├── EmployeesPage.tsx       # Employee directory with search
│   │   ├── AttendancePage.tsx      # Attendance log table
│   │   ├── ReportPage.tsx          # Incident/absence report form
│   │   ├── RegisterEmployeePage.tsx # Employee list + registration form
│   │   ├── PayrollPage.tsx         # Payroll management table
│   │   └── UserProfilePage.tsx     # Profile view/edit
│   ├── App.tsx                     # Root app with auth flow + sidebar routing
│   ├── index.css                   # Custom CSS + Tailwind directives
│   └── main.tsx                    # React DOM mount
├── index.html
├── tailwind.config.js              # Brand colors (brand-blue: #0062AD)
├── vite.config.ts
└── tsconfig*.json
```

## Features

- **Authentication** — sign in/sign up with credential validation (`admin@primeoak.co.za` / `password123`)
- **Dashboard** — stat cards (total employees, present, absent), weekly attendance bar chart (green/red)
- **Employees** — employee directory with search filtering
- **Attendance** — attendance log table with Present/Absent badges
- **Report** — create incident/absence reports against employees
- **Register Employee** — employee list view and registration form with biometric fingerprint icon
- **Payroll** — payroll records with pay periods, hours, overtime, gross/net pay, and payment status
- **Profile** — user profile with editable fields and avatar
- **Dark Mode** — toggle via `dark` class on `<html>`
- **Animations** — framer-motion page transitions and staggered UI entrance animations

## Getting Started

```bash
npm install
npm run dev
```

## Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@primeoak.co.za   |
| Password | password123            |

## Backend API Contract

All endpoints return JSON. Authenticate via `Authorization: Bearer <token>` header.

---

### Authentication

#### POST /api/auth/login

Authenticate a user and return a session token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response — 200 OK:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "Admin | Staff",
    "avatar": "string | null"
  }
}
```

**Response — 401 Unauthorized:**
```json
{
  "error": "Invalid email or password"
}
```

#### POST /api/auth/logout

Invalidate the current session.

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Dashboard

#### GET /api/dashboard/metrics

Return key HR metrics for the dashboard summary cards.

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "totalEmployees": 10,
  "presentToday": 7,
  "absentToday": 3,
  "onLeaveToday": 0
}
```

#### GET /api/dashboard/weekly-attendance

Return daily present/absent counts for the current week (Monday–Friday).

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "data": [
    { "day": "Monday",    "present": 9, "absent": 1 },
    { "day": "Tuesday",   "present": 8, "absent": 2 },
    { "day": "Wednesday", "present": 10,"absent": 0 },
    { "day": "Thursday",  "present": 9, "absent": 1 },
    { "day": "Friday",    "present": 6, "absent": 4 }
  ]
}
```

---

### Employees

#### GET /api/employees

List all employees. Supports optional search filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param    | Type   | Required | Description                        |
|----------|--------|----------|------------------------------------|
| `search` | string | No       | Filter by name or employee ID      |
| `page`   | number | No       | Page number (default: 1)           |
| `limit`  | number | No       | Records per page (default: 20)     |

**Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "00001111",
      "name": "Boitumelo Magashula",
      "jobTitle": "Employee",
      "role": "Staff",
      "email": "b.magashula@primeoak.co.za",
      "phone": "+27 12 345 6789",
      "department": "Operations",
      "startDate": "2025-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1
  }
}
```

#### GET /api/employees/:id

Return a single employee by ID.

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "id": "00001111",
  "name": "Boitumelo Magashula",
  "jobTitle": "Employee",
  "role": "Staff",
  "email": "b.magashula@primeoak.co.za",
  "phone": "+27 12 345 6789",
  "department": "Operations",
  "startDate": "2025-01-15",
  "address": "123 Main St, Pretoria"
}
```

**Response — 404 Not Found:**
```json
{
  "error": "Employee not found"
}
```

#### POST /api/employees

Register a new employee.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "string",
  "surname": "string",
  "email": "string",
  "role": "string",
  "employeeId": "string",
  "password": "string"
}
```

**Response — 201 Created:**
```json
{
  "id": "00007777",
  "name": "New Employee",
  "surname": "Staff",
  "email": "n.employee@primeoak.co.za",
  "role": "Employee"
}
```

---

### Attendance

#### GET /api/attendance

Return attendance log records. Supports date range and employee filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param        | Type   | Required | Description                         |
|--------------|--------|----------|-------------------------------------|
| `startDate`  | string | No       | Filter from date (YYYY-MM-DD)       |
| `endDate`    | string | No       | Filter to date (YYYY-MM-DD)         |
| `employeeId` | string | No       | Filter by specific employee         |
| `status`     | string | No       | Filter by status (Present / Absent) |
| `page`       | number | No       | Page number                         |
| `limit`      | number | No       | Records per page                    |

**Response — 200 OK:**
```json
{
  "data": [
    {
      "employeeId": "00003333",
      "date": "10 July 2026",
      "checkIn": "08:00",
      "checkOut": "16:00",
      "overtime": "2 Hrs",
      "status": "Present"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### GET /api/attendance/:employeeId

Return attendance records for a specific employee.

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "employee": {
    "id": "00003333",
    "name": "Bokang Ngwetjana",
    "jobTitle": "HR Management",
    "role": "Admin"
  },
  "records": [
    {
      "date": "10 July 2026",
      "checkIn": "08:00",
      "checkOut": "16:00",
      "overtime": "2 Hrs",
      "status": "Present"
    }
  ],
  "summary": {
    "totalDays": 22,
    "present": 20,
    "absent": 2,
    "totalOvertimeHours": 12
  }
}
```

---

### Reports

#### POST /api/reports

Create a report against an employee.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "employeeId": "00001111",
  "title": "Repeated Absence",
  "description": "string"
}
```

**Response — 201 Created:**
```json
{
  "id": "rpt-001",
  "employeeId": "00001111",
  "title": "Repeated Absence",
  "description": "string",
  "createdAt": "2026-07-29T12:00:00Z"
}
```

#### GET /api/reports

List all reports with optional employee filter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param        | Type   | Required | Description                  |
|--------------|--------|----------|------------------------------|
| `employeeId` | string | No       | Filter by employee           |
| `page`       | number | No       | Page number                  |
| `limit`      | number | No       | Records per page             |

**Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "rpt-001",
      "employeeId": "00001111",
      "employeeName": "Boitumelo Magashula",
      "title": "Repeated Absence",
      "description": "string",
      "createdAt": "2026-07-29T12:00:00Z",
      "status": "Open"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Payroll

#### GET /api/payroll

List payroll records.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param  | Type   | Required | Description                |
|--------|--------|----------|----------------------------|
| `month` | number | No       | Filter by month            |
| `year`  | number | No       | Filter by year             |
| `page`  | number | No       | Page number                |
| `limit` | number | No       | Records per page           |

**Response — 200 OK:**
```json
{
  "data": [
    {
      "employeeId": "00003333",
      "payStart": "10 July 2026",
      "payEnd": "10 July 2026",
      "hours": 75,
      "overtime": 2,
      "grossPay": "R1 750",
      "deduction": "R50.00",
      "netPay": "R1 700",
      "paymentDate": "31 July 2026",
      "status": "Pending"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

---

### Profile

#### GET /api/profile

Return the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response — 200 OK:**
```json
{
  "id": "00008888",
  "fullName": "Olwethu Xaba",
  "email": "oXaba@gmail.com",
  "role": "HR Manager",
  "avatar": "string | null"
}
```

#### PUT /api/profile

Update the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fullName": "string",
  "email": "string",
  "role": "string"
}
```

**Response — 200 OK:**
```json
{
  "message": "Profile updated successfully"
}
```

---

## Scripts

| Command            | Description                       |
|--------------------|-----------------------------------|
| `npm run dev`      | Start dev server                  |
| `npm run build`    | TypeScript check + Vite build     |
| `npm run preview`  | Preview production build          |
| `npm run lint`     | Run linter                        |
