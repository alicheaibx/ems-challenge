import React from "react";
import {
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from "@mui/material";

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

interface EmployeeDetailsDialogProps {
  employee: Employee;
  onClose: () => void;
}

const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({ employee, onClose }) => {
  return (
    <>
      <DialogTitle>Employee Details</DialogTitle>
      <DialogContent>
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Name:</strong> {employee.full_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Email:</strong> {employee.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Phone:</strong> {employee.phone_number}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>DOB:</strong> {employee.date_of_birth}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Job Title:</strong> {employee.job_title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Department:</strong> {employee.department}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Salary:</strong> ${employee.salary.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardContent>
            <Button variant="contained" color="secondary" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </>
  );
};

export default EmployeeDetailsDialog;
