# IHMN Admin — Back-office web application

A **Next.js** administration panel built for IHMN (Institut d'Hygiène Mentale et de Neurologie), backed by **Firebase / Firestore**. It lets school administrators manage students, professors, and courses from a single interface.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 13](https://nextjs.org/) (React 18, TypeScript) |
| UI | [MUI v5](https://mui.com/) + [Tailwind CSS v3](https://tailwindcss.com/) |
| Database / Auth | [Firebase v9](https://firebase.google.com/) (Firestore + Authentication) |
| Data grid | [@mui/x-data-grid](https://mui.com/x/react-data-grid/) |
| Excel export | [ExcelJS](https://github.com/exceljs/exceljs) + [FileSaver.js](https://github.com/eligrey/FileSaver.js) |
| Icons | [MUI Icons](https://mui.com/material-ui/material-icons/) + [React Icons](https://react-icons.github.io/react-icons/) |

---

## Features implemented

### Authentication
- Firebase Auth with protected routes (redirect to login when unauthenticated)

### Students
- List all students in a searchable, sortable data-grid
- Add / delete a student
- Double-click to open the detailed student view
- **Detailed view**: edit personal info (name, surname, birthday, school year, email, phone, address), manage course enrolments, delete the student

### Courses
- Tree-view organised by **period → year → course name → professor → enrolled students**
- Add a course (period, year, course name, optional professor)
- Remove a course
- Search across courses
- Double-click on an enrolled student to open their detailed view

### Professors
- List all professors in a searchable data-grid
- Add / remove a professor
- Double-click to open the detailed professor view
- **Detailed view**: edit personal information, add / remove courses taught, tree-view of their courses, search across courses

---

## Not yet implemented

- Exam results & exam sessions
- Attendance sheets (*feuille de présence*)
- Exam session enrolment
- WhatsApp / Signal group links
- Supplementary trainings / internships (32 h cycles)
- Push notifications
- Student / professor profile photos
- Responsive layout fixes on courses and professor pages

---

## Getting started

### Prerequisites

- **Node.js** ≥ 18
- **Yarn** (or npm)
- A Firebase project with Firestore and Authentication enabled

### Installation

```bash
git clone https://github.com/mgamsdve/admin-ihmn-yrn.git
cd admin-ihmn-yrn
yarn install
```

### Environment variables

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_PROJECT_ID` | Firestore project ID |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_MESSENGING_SENDER_ID` | Firebase messaging sender ID (note: env var name kept as-is to match `.env.example`) |
| `NEXT_PUBLIC_APP_ID` | Firebase app ID |

### Running locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
yarn build
yarn start
```

---

## Project structure

```
├── Components/          # Reusable React components (dialogs, grids, tree views…)
├── context/             # React context providers
├── pages/               # Next.js pages (students, courses, professors, login…)
├── public/              # Static assets
├── styles/              # Global CSS
├── firebase.ts          # Firebase client initialisation
├── firebase-admin.ts    # Firebase Admin SDK initialisation (server-side)
├── firebaseFun.ts       # Firestore helper functions
├── FicheExcel.ts        # Excel export logic
└── .env.example         # Environment variable template
```
