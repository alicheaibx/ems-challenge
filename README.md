# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
curl http://localhost:3000/Endpoint

HTTP Method	Endpoint	Description
POST	/employees	Create a new employee.
GET	/employees	Get all employees.
GET	/employees/:id	Get a single employee by ID.
PUT	/employees/:id	Update an employee by ID.
DELETE	/employees/:id	Delete an employee by ID (and associated timesheets).
POST	/timesheets	Create a new timesheet entry.
GET	/timesheets	Get all timesheet entries.
GET	/timesheets/:id	Get a single timesheet entry by ID.
GET	/employees/:employee_id/timesheets	Get all timesheet entries for a specific employee.
PUT	/timesheets/:id	Update a timesheet entry by ID.
DELETE	/timesheets/:id	Delete a timesheet entry by ID.
 for instalizing database :npm run init-db
 after runing the instalizing of  database
 copy the ems db file into server folder then run this:
 the server :npx tsx server/index.ts