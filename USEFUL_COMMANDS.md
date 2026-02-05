#!/bin/bash

# USEFUL COMMANDS - DEMO B

## 🚀 DEV WORKFLOW

# Start development server

yarn dev

# Build production

yarn build

# Start production server (after build)

yarn start

# Check TypeScript

yarn tsc --noEmit

# Lint code

yarn lint

# Format code

yarn format

---

## 📁 PROJECT EXPLORATION

# List source files

ls src/

# View design system

cat src/lib/design-system.ts

# View component structure

ls src/components/ui/
ls src/components/features/
ls src/components/shell/

# View pages

ls pages/

# View documentation

ls \*.md

---

## 🧪 TESTING

# Build test

yarn build

# Type checking

yarn tsc --noEmit

# View specific page

# http://localhost:3000/Login

# http://localhost:3000

# http://localhost:3000/StudentPages

# http://localhost:3000/CoursesPage

# http://localhost:3000/ProfPage

---

## 📖 DOCUMENTATION QUICK ACCESS

# Read executive summary

cat EXECUTIVE_SUMMARY.md

# Read quick start

cat QUICK_START.md

# Read phase 1 roadmap

cat PHASE_1_ROADMAP.md

# View all md files

ls \*.md

---

## 🎨 DESIGN SYSTEM EDITS

# Edit design tokens (affects whole app!)

nano src/lib/design-system.ts

# View colors

grep -A 50 "colors = {" src/lib/design-system.ts

# View spacing

grep -A 10 "spacing = {" src/lib/design-system.ts

# View typography

grep -A 30 "typography = {" src/lib/design-system.ts

---

## 🧩 COMPONENT EXPLORATION

# View Button component

cat src/components/ui/Button.tsx

# View Input component

cat src/components/ui/Input.tsx

# View Card component

cat src/components/ui/Card.tsx

# View Toast hook

cat src/hooks/useToast.ts

# View Dashboard

cat src/components/features/Dashboard.tsx

# View Layout

cat src/components/shell/ModernLayout.tsx

---

## 📝 FILE COUNTS

# Count lines of code

find src -name "_.tsx" -o -name "_.ts" | xargs wc -l

# Count components

ls src/components/ui/ | wc -l

# Count files in src

find src -type f | wc -l

# Count documentation

ls \*.md | wc -l

---

## 🔄 GIT OPERATIONS (When ready)

# Check status

git status

# Add all changes

git add .

# Commit

git commit -m "feat: demo B - design system and modern login/dashboard"

# View history

git log --oneline

---

## 🌐 SERVER MANAGEMENT

# Kill processes on port 3000

lsof -ti:3000 | xargs kill -9

# Check port 3000

lsof -i:3000

# Alternative: start fresh

rm -rf .next
yarn dev

---

## 🔍 DEBUGGING

# Check console for errors

# Open DevTools (F12) → Console tab

# Check Network tab

# Open DevTools (F12) → Network tab

# Check TypeScript errors

yarn tsc --noEmit

# Check for 'any' types

grep -r "any" src/ --include="_.tsx" --include="_.ts"

---

## 📊 ANALYSIS

# Find all uses of design system

grep -r "colors\." src/ | head -20

# Find all components imports

grep -r "from '@/src/components" src/

# Find all hooks usage

grep -r "useToast\|useRouter\|useAuth" src/

---

## 🧹 CLEANUP

# Remove build artifacts

rm -rf .next

# Remove node_modules (if needed)

rm -rf node_modules
yarn install

# Clean cache

yarn cache clean

---

## 📈 PERFORMANCE

# Build size analysis

yarn build

# Check .next/static for bundle info

# View performance metrics

# Use browser DevTools → Lighthouse

---

## 🔐 SECURITY

# Check for vulnerabilities

yarn audit

# Update dependencies (carefully!)

yarn upgrade

---

## 📚 DOCUMENTATION COMMANDS

# View file structure

tree -L 3 -I node_modules

# Count documentation files

ls \*.md | wc -l

# Find specific doc

grep -l "Phase 1" \*.md

# Search in docs

grep -r "design system" . --include="\*.md"

---

## 🚀 DEPLOYMENT PREP

# Build for production

yarn build

# Test production build

yarn start

# Check env variables

cat .env.local (if exists)

# View build output

ls -la .next/

---

## 📱 MOBILE TESTING

# Get your IP (Windows)

ipconfig

# Look for IPv4 Address

# Get your IP (Mac/Linux)

ifconfig

# Open on mobile

# http://[YOUR_IP]:3000

---

## 🎯 QUICK REFERENCE

# Most common:

yarn dev → Start development
yarn build → Build production
yarn lint → Check code quality

# Design system:

src/lib/design-system.ts → Edit here for global changes

# Components:

src/components/ui/ → Reusable UI
src/components/features/ → Complex features
src/components/shell/ → Layout

# Pages:

pages/Login.tsx → Login page
pages/index.tsx → Dashboard
pages/\_app.tsx → App config

# Docs:

EXECUTIVE_SUMMARY.md → Start here
QUICK_START.md → How to use
PHASE_1_ROADMAP.md → What's next

---

## 💡 TIPS

# Hot reload works automatically

# Just save file, browser updates

# TypeScript errors show in IDE

# Fix before building

# Use design tokens everywhere

# colors.primary[600], spacing[4], etc

# Components are in src/

# Pages are in pages/

# Docs are in root

# Ask VS Code for IntelliSense

# Start typing color → get suggestions

---

## 🆘 TROUBLESHOOTING COMMANDS

# Port already in use?

lsof -i:3000 | xargs kill -9

# Build fails?

rm -rf .next && yarn build

# TypeScript errors?

yarn tsc --noEmit

# Module not found?

yarn install

# Strange behavior?

rm -rf node_modules && yarn install

---

## 📞 USEFUL RESOURCES

# Check Next.js docs

# https://nextjs.org/docs

# Check React docs

# https://react.dev

# Check TypeScript docs

# https://www.typescriptlang.org

---

End of commands.
Happy coding! 🚀
