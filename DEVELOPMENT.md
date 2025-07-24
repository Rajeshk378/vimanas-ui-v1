# Development Guidelines

## Component Development Checklist

Before committing new components, ensure:

### ✅ Code Quality
- [ ] No unused imports
- [ ] No unused variables
- [ ] No duplicate function definitions
- [ ] All useEffect dependencies are properly listed
- [ ] ESLint warnings are resolved

### ✅ Export/Import Standards
- [ ] Use proper default exports: `export default ComponentName`
- [ ] Use consistent import patterns
- [ ] Avoid anonymous default exports for services

### ✅ Component Structure
- [ ] Functions are defined before they are used
- [ ] State variables are properly initialized
- [ ] Event handlers are properly defined
- [ ] Component is properly exported

### ✅ Testing
- [ ] Component builds without errors (`npm run build`)
- [ ] Component renders without console errors
- [ ] All routes are accessible
- [ ] All interactive elements work as expected

## Common Issues to Avoid

1. **Duplicate Functions**: Check for duplicate function definitions with the same name
2. **Import Conflicts**: Ensure no naming conflicts between old and new components
3. **Missing Dependencies**: Add all dependencies to useEffect dependency arrays
4. **Unused Code**: Remove unused imports, variables, and functions

## Debugging Import Issues

If you encounter "Element type is invalid" errors:

1. Check for typos in import/export statements
2. Verify all components are properly exported
3. Ensure no duplicate component names in different directories
4. Check for unused imports that might be causing conflicts
5. Verify service exports use proper patterns

## VS Code Extensions Recommended

- ES7+ React/Redux/React-Native snippets
- Auto Import - ES6, TS, JSX, TSX
- ESLint
- Prettier - Code formatter