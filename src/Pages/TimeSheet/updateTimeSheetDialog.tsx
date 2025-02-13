import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { Employee } from './Types'; // Assuming Employee type is imported from a separate file

interface UpdateTimesheetDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (timesheet: { id: number; employee_id: number; start_time: string; end_time: string }) => void;
  timesheetId: number | null;
  employees: Employee[];
}

const UpdateTimesheetDialog: React.FC<UpdateTimesheetDialogProps> = ({ open, onClose, onUpdate, timesheetId, employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (timesheetId !== null) {
      // Fetch the timesheet data based on the ID
      fetch(`http://localhost:3000/timesheets/${timesheetId}`)
        .then((response) => response.json())
        .then((data) => {
          setSelectedEmployee(data.employee_id);
          setStartTime(data.start_time);
          setEndTime(data.end_time);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching timesheet:', error);
          setLoading(false);
        });
    }
  }, [timesheetId]);

  const handleUpdate = () => {
    if (selectedEmployee && startTime && endTime && timesheetId !== null) {
      onUpdate({
        id: timesheetId,
        employee_id: selectedEmployee as number,
        start_time: startTime,
        end_time: endTime,
      });
      onClose();
    } else {
      // Handle validation if needed
      alert('Please fill in all fields.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Timesheet</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value as number)}
                label="Employee"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTimesheetDialog;