# 🎯 QUICK REFERENCE - PHASE 1

## ⚡ ACCESS IMMEDIAT

```bash
# Server running at:
http://localhost:3000

# Login:
email: ihmnprivate.app@gmail.com
password: [your password]

# Stop server:
Ctrl+C
```

---

## 📁 FILES STRUCTURE

```
src/
├── lib/design-system.ts (colors, spacing, fonts)
├── components/
│   ├── ui/          (Button, Input, Card, Modal, Table, etc)
│   ├── features/    (Dashboard, StudentList, ProfessorList)
│   └── shell/       (ModernLayout)
└── hooks/useToast.ts

pages/
├── Login.tsx
├── index.tsx        (Dashboard)
├── StudentPages.tsx
├── ProfPage.tsx
└── CoursesPage.tsx
```

---

## 🎨 USE COMPONENTS

### Button

```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  hint="Enter your email"
/>
```

### Card

```tsx
<Card hoverable variant="elevated">
  Content here
</Card>
```

### Modal

```tsx
<Modal isOpen={open} onClose={close} title="Title" size="md">
  <p>Content</p>
</Modal>
```

### Table

```tsx
<Table
  columns={[{ key: "name", label: "Name" }]}
  data={students}
  selectable
  onSelectionChange={setSelected}
  onRowClick={handleClick}
/>
```

### Toast

```tsx
const { success, error, warning, info } = useToast();
success("Success message");
error("Error message");
```

---

## 🎨 USE DESIGN SYSTEM

```tsx
import { colors, spacing, typography } from '@/src/lib/design-system'

// Colors
backgroundColor: colors.primary[600]
borderColor: colors.border
textColor: colors.text.secondary

// Spacing
padding: spacing[4]        // 16px
gap: spacing[3]            // 12px
marginBottom: spacing[6]   // 24px

// Typography
...typography.h2           // 24px, 700
...typography.body        // 16px, 400
...typography.bodySmall   // 14px, 400
```

---

## 📋 COMPONENT CHECKLIST

- [x] Button (primary, secondary, danger, ghost)
- [x] Input (with validation, hints, errors)
- [x] Card (hoverable, elevated)
- [x] Modal (with animations)
- [x] Table (selectable, sortable)
- [x] Badge (5 color variants)
- [x] Toast (4 types)
- [x] Spinner (3 sizes)
- [x] SearchInput (real-time)
- [x] Skeleton (loading placeholder)

---

## 🔄 COMMON PATTERNS

### Fetch & Display List

```tsx
const [data, setData] = useState([]);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
    setData(snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  });
  return () => unsubscribe();
}, []);

return <Table data={data} columns={columns} />;
```

### Add Item

```tsx
const handleAdd = async () => {
  try {
    await addDoc(collection(db, "users"), formData);
    success("Created!");
    setOpen(false);
    // List auto-refreshes via onSnapshot
  } catch (err) {
    error("Failed!");
  }
};
```

### Delete with Confirmation

```tsx
const handleDelete = async () => {
  if (confirm("Really delete?")) {
    await deleteDoc(doc(db, "users", id));
    success("Deleted!");
  }
};
```

### Search Filter

```tsx
const filtered = useMemo(() => {
  return items.filter((item) => item.name.includes(searchTerm));
}, [items, searchTerm]);
```

---

## 🎯 PAGE TEMPLATES

### Simple List Page

```tsx
export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ gap: spacing[4] }}>
      <Button onClick={() => setOpen(true)}>Add</Button>
      <Card>
        <SearchInput onSearch={setSearch} />
        <Table data={filtered} ... />
      </Card>
      <AddModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}
```

---

## 🚨 ERROR HANDLING

### Input Validation

```tsx
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!email) newErrors.email = "Required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Try/Catch

```tsx
try {
  await operation();
  success("Success!");
} catch (err) {
  error("Failed: " + err.message);
}
```

### Modal Confirmation

```tsx
<Modal
  isOpen={confirm}
  title="Sure?"
  footer={
    <>
      <Button variant="ghost" onClick={closeConfirm}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  Confirm deletion?
</Modal>
```

---

## 📱 RESPONSIVE TIPS

### Grid Auto-fit

```tsx
display: 'grid',
gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
```

### Flex Stack

```tsx
display: 'flex',
flexDirection: 'column',
gap: spacing[4],
```

### Media Query (CSS)

```tsx
// At breakpoints.md (768px)
@media (max-width: 768px) {
  // Adjust layout
}
```

---

## 🎨 COLORS QUICK REF

| Color    | Hex     | Use           |
| -------- | ------- | ------------- |
| Primary  | #2563EB | Main actions  |
| Success  | #16A34A | Confirmations |
| Danger   | #DC2626 | Destructions  |
| Warning  | #D97706 | Alerts        |
| Gray 900 | #111827 | Text dark     |
| Gray 50  | #F9FAFB | Background    |
| Border   | #E5E7EB | Dividers      |

---

## 🚀 COMMON COMMANDS

```bash
# Start dev server
yarn dev

# Build
yarn build

# Lint
yarn lint

# List installed
yarn list --depth=0
```

---

## 📖 USEFUL FILES TO READ

1. `PHASE_1_COMPLETE.md` - Overview
2. `ARCHITECTURE_OVERVIEW.md` - Technical details
3. `src/lib/design-system.ts` - Design tokens
4. `src/components/ui/Button.tsx` - Example component
5. `src/components/features/StudentList.tsx` - Example feature

---

## ❓ FAQ

**Q: How to add a new component?**
A: Create in `src/components/ui/`, use design-system, export

**Q: How to add a new page?**
A: Create in `pages/`, wrap with ModernLayout, add to sidebar

**Q: How to fetch data?**
A: Use `onSnapshot()` for real-time, `getDocs()` for one-time

**Q: How to show errors?**
A: Use `useToast()` hook → `error('message')`

**Q: How to add validation?**
A: Create `validate()` function, set errors, show in Input

**Q: How to delete safely?**
A: Show Modal confirmation, then delete on confirm

---

## 🎯 NEXT STEPS

1. Test all flows in browser
2. Read ARCHITECTURE_OVERVIEW.md
3. Study design-system.ts
4. Explore component examples
5. Plan Phase 2 features
6. Set up testing framework
7. Add more pages/features

---

## 📞 WHEN STUCK

1. Check the component example
2. Look at similar feature component
3. Read design-system.ts for styling
4. Check Firebase docs for queries
5. Refer to ARCHITECTURE_OVERVIEW.md

---

**Last Updated:** 4 Feb 2026  
**Phase:** 1 Complete ✅  
**Status:** Live & Ready 🚀
