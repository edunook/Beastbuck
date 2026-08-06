# BEASTBUCK BUILD HEALTH REPORT

**Generated:** June 22, 2026  
**Phase:** 14 - Build Health  
**Status:** Complete

---

## AUDIT METHODOLOGY

Ran:
- npm install
- npm audit
- npm audit fix
- npm run lint
- npm run build

---

## BUILD RESULTS

### ✅ npm install
- **Status:** Success
- **Packages:** 491 packages audited
- **Vulnerabilities:** 11 (9 moderate, 2 high)

### ⚠️ npm audit
- **Status:** Vulnerabilities found
- **Total Vulnerabilities:** 11
- **Moderate:** 9
- **High:** 2

**Issues:**
- form-data <2.5.6 (High) - CRLF injection
- protobufjs <=7.6.2 (Moderate) - Schema-derived names
- uuid <11.1.1 (Moderate) - Missing buffer bounds check
- vite 8.0.0-8.0.15 (High) - NTLMv2 hash disclosure, fs.deny bypass

### ⚠️ npm audit fix
- **Status:** Partial fix applied
- **Vulnerabilities Fixed:** 3
- **Remaining Vulnerabilities:** 8 (all moderate)
- **Breaking Changes Required:** Yes (for full fix)

**Remaining Issues:**
- uuid <11.1.1 (Moderate) - Requires firebase-admin update (breaking change)

### ❌ npm run lint
- **Status:** Failed
- **Total Problems:** 175
- **Errors:** 154
- **Warnings:** 21

**Common Issues:**
- Unused variables/imports (no-unused-vars)
- Missing dependencies in useEffect (react-hooks/exhaustive-deps)
- Unnecessary try/catch (no-useless-catch)
- Undefined process (no-undef)

### ✅ npm run build
- **Status:** Success
- **Build Time:** 6.06s
- **Exit Code:** 0
- **TypeScript Errors:** 0
- **JavaScript Errors:** 0

---

## CHUNK SIZE ANALYSIS

### Large Chunks (> 500 KB)

| Chunk | Size (Uncompressed) | Size (Gzipped) | Severity |
|-------|-------------------|---------------|----------|
| WorkspaceDetail-DUMc2ssB.js | 400.32 KB | 124.72 KB | MEDIUM |
| firebase-vendor-VAy-jA54.js | 505.20 KB | 151.92 KB | MEDIUM |

### Large Chunks (> 100 KB)

| Chunk | Size (Uncompressed) | Size (Gzipped) |
|-------|-------------------|---------------|
| KnowledgeMap-dFasfVTX.js | 143.40 KB | 46.49 KB |
| index-BKsfYvmt.js | 188.00 KB | 52.30 KB |
| react-vendor-Cr6FXVqD.js | 231.99 KB | 74.24 KB |

---

## ISSUES FOUND

### 1. Security Vulnerabilities
- **Issue:** 8 moderate vulnerabilities remain after npm audit fix
- **Impact:** Potential security risks
- **Recommendation:** Update dependencies when breaking changes are acceptable
- **Severity:** Medium

### 2. ESLint Errors
- **Issue:** 154 ESLint errors across codebase
- **Impact:** Code quality issues, potential bugs
- **Recommendation:** Fix unused variables, imports, and dependencies
- **Severity:** Medium

### 3. Large Bundle Sizes
- **Issue:** Several chunks over 100 KB
- **Impact:** Slower initial load
- **Recommendation:** Implement code splitting and lazy loading
- **Severity:** Low

---

## RECOMMENDATIONS

### High Priority
1. Fix critical ESLint errors (unused variables, imports)
2. Update vulnerable dependencies when breaking changes acceptable

### Medium Priority
3. Fix remaining ESLint warnings (useEffect dependencies)
4. Implement code splitting for large chunks
5. Lazy load large components

### Low Priority
6. Increase chunk size warning limit temporarily
7. Implement bundle size monitoring
8. Add performance budgets

---

## SUMMARY

- **npm install:** ✅ SUCCESS
- **npm audit:** ⚠️ 8 moderate vulnerabilities
- **npm run lint:** ❌ 175 problems (154 errors, 21 warnings)
- **npm run build:** ✅ SUCCESS (6.06s)
- **TypeScript:** ✅ NO ERRORS
- **Bundle Size:** ⚠️ LARGE CHUNKS

**Overall Build Health:** ⚠️ GOOD (with issues)

**Critical Issues:** 0  
**Medium Issues:** 2 (vulnerabilities, lint errors)  
**Minor Issues:** 1 (bundle size)

---

## BUILD SCORE

**Current Score:** 75/100

**Deductions:**
- -15 points for ESLint errors
- -5 points for security vulnerabilities
- -5 points for large bundle sizes

**Status:** ⚠️ REQUIRES ATTENTION BEFORE PRODUCTION
