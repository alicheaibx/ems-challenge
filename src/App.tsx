import { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeesPage from './Pages/Employee/employee';
import TimesheetsPage from './Pages/TimeSheet/timeSheet';
import Navbar from './Components/Navbar';
import ErrorBoundary from './Components/errorBoundary'; // Import the ErrorBoundary

const App: FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<EmployeesPage />} />
          <Route path="/TimesheetsPage" element={<TimesheetsPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
