import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Dialog,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import EmployeeDetailsDialog from "./employeeDetailsDialog";
import NewEmployeeDialog from "./addEmployeeDailog";
import UpdateEmployeeDialog from "./updateEmployeeDialog";

interface Employee {
  id: number;
  full_name: string;
  salary: number;
  email: string;
  phone_number: string;
  date_of_birth: string;
  job_title: string;
  department: string;
  start_date: string;
  end_date?: string | null;
}

const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openNewEmployee, setOpenNewEmployee] = useState(false);
  const [openUpdateEmployee, setOpenUpdateEmployee] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // New state variables for search, sorting, filtering, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState<"name" | "salary">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [salaryRange, setSalaryRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:3000/employees")
      .then((res) => res.json())
      .then((data) => {
        console.log("Employees data:", data);
        setEmployees(data);
      })
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // Filter employees based on search term and salary range
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSalary = employee.salary >= salaryRange.min && employee.salary <= salaryRange.max;
    return matchesSearch && matchesSalary;
  });

  // Sort employees based on criteria and order
  const sortedEmployees = filteredEmployees.sort((a, b) => {
    if (sortCriteria === "name") {
      return sortOrder === "asc"
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name);
    } else {
      return sortOrder === "asc" ? a.salary - b.salary : b.salary - a.salary;
    }
  });

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = sortedEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleOpenDetailsDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDetails(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetails(false);
    setSelectedEmployee(null);
  };

  const handleOpenNewEmployeeDialog = () => {
    setOpenNewEmployee(true);
  };

  const handleCloseNewEmployeeDialog = () => {
    setOpenNewEmployee(false);
  };

  const handleOpenUpdateEmployeeDialog = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setOpenUpdateEmployee(true);
  };

  const handleCloseUpdateEmployeeDialog = () => {
    setOpenUpdateEmployee(false);
    setEmployeeToEdit(null);
  };

  const handleAddEmployee = (employeeData: Employee) => {
    const employeeToPost = {
      ...employeeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      end_date: null,
    };
  
    fetch('http://localhost:3000/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeToPost),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Server error: ${text}`);
          });
        }
        return response.json();
      })
      .then(() => {
        // Refetch employees after adding a new employee
        fetch("http://localhost:3000/employees")
          .then((res) => res.json())
          .then((data) => {
            setEmployees(data);
            handleCloseNewEmployeeDialog();
          })
          .catch((err) => console.error("Error refetching employees:", err));
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
      });
  };
  
  const handleUpdateEmployee = async (employeeData: Employee, id?: number) => {
    if (!id) {
      console.error("No ID provided for update");
      return;
    }
  
    const employeeId = Number(id);
    if (isNaN(employeeId)) {
      console.error("Invalid ID provided for update");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      // Refetch employees after updating an employee
      const refetchResponse = await fetch("http://localhost:3000/employees");
      const updatedEmployees = await refetchResponse.json();
      setEmployees(updatedEmployees);
      handleCloseUpdateEmployeeDialog();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Employee Management
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenNewEmployeeDialog} sx={{ mb: 2 }}>
        Add Employee
      </Button>

      {/* Search Bar */}
      <TextField
        label="Search by Name"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Sorting Controls */}
      <FormControl variant="outlined" sx={{ minWidth: 120, mr: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as "name" | "salary")}
          label="Sort By"
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="salary">Salary</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel>Order</InputLabel>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          label="Order"
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      {/* Salary Range Filter */}
      <TextField
        label="Min Salary"
        type="number"
        variant="outlined"
        value={salaryRange.min}
        onChange={(e) => setSalaryRange({ ...salaryRange, min: Number(e.target.value) })}
        sx={{ ml: 2, width: 120 }}
      />
      <TextField
        label="Max Salary"
        type="number"
        variant="outlined"
        value={salaryRange.max}
        onChange={(e) => setSalaryRange({ ...salaryRange, max: Number(e.target.value) })}
        sx={{ ml: 2, width: 120 }}
      />

      {/* Employee Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>${employee.salary ? employee.salary.toFixed(2) : "0.00"}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpenDetailsDialog(employee)}>
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ ml: 1 }}
                    onClick={() => handleOpenUpdateEmployeeDialog(employee)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Pagination
        count={Math.ceil(sortedEmployees.length / employeesPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />

      {/* Dialogs */}
      <Dialog open={openDetails} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        {selectedEmployee && <EmployeeDetailsDialog employee={selectedEmployee} onClose={handleCloseDetailsDialog} />}
      </Dialog>

      <NewEmployeeDialog open={openNewEmployee} onClose={handleCloseNewEmployeeDialog} onSave={handleAddEmployee} />
      <UpdateEmployeeDialog
        open={openUpdateEmployee}
        onClose={handleCloseUpdateEmployeeDialog}
        onSave={handleUpdateEmployee}
        employeeToEdit={employeeToEdit}
      />
    </Paper>
  );
};

export default EmployeePage;