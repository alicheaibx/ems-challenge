import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import NewTimesheetDialog from './newTimesheetDialog';
import UpdateTimesheetDialog from './updateTimeSheetDialog';
import TimeSheetDetailsDialog from './timeSheetDetailsDialog'; // Import the new dialog
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import '@schedule-x/theme-default/dist/index.css';
import { createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';

// Define types
interface Timesheet {
  id: number;
  employee_id: number;
  full_name: string;
  start_time: string;
  end_time: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface NewTimesheet {
  employee_id: number;
  start_time: string;
  end_time: string;
}

const TimesheetsPage: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false); // State for details dialog
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [view, setView] = useState<'table' | 'calendar'>('table');

  // Initialize the calendar app
  const calendarApp = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events: [
      
    ],
  });

  // Fetch timesheets from the API
  const fetchTimesheets = async () => {
    try {
      const response = await fetch('http://localhost:3000/timesheets');
      if (!response.ok) throw new Error('Failed to fetch timesheets');
      const data: Timesheet[] = await response.json();
      setTimesheets(data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      alert('Failed to fetch timesheets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  // Handle opening/closing the dialog
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // Handle opening/closing the update dialog
  const handleOpenUpdateDialog = (id: number) => {
    setSelectedTimesheetId(id);
    setOpenUpdateDialog(true);
  };
  const handleCloseUpdateDialog = () => setOpenUpdateDialog(false);

  // Handle opening/closing the details dialog
  const handleOpenDetailsDialog = (id: number) => {
    setSelectedTimesheetId(id);
    setOpenDetailsDialog(true);
  };
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedTimesheetId(null);
  };

  // Save a new timesheet
  const handleSaveTimesheet = async (timesheet: NewTimesheet) => {
    try {
      const response = await fetch('http://localhost:3000/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timesheet),
      });

      if (!response.ok) throw new Error('Failed to save timesheet');

      setOpenDialog(false);
      await fetchTimesheets(); // Refetch timesheets after saving
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert('Failed to save timesheet. Please try again.');
    }
  };

  // Update an existing timesheet
  const handleUpdateTimesheet = async (timesheet: {
    id: number;
    employee_id: number;
    start_time: string;
    end_time: string;
  }) => {
    try {
      const response = await fetch(`http://localhost:3000/timesheets/${timesheet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timesheet),
      });

      if (!response.ok) throw new Error('Failed to update timesheet');

      setOpenUpdateDialog(false);
      await fetchTimesheets(); // Refetch timesheets after updating
    } catch (error) {
      console.error('Error updating timesheet:', error);
      alert('Failed to update timesheet. Please try again.');
    }
  };

  // Filter timesheets based on search term and selected employee
  const filteredTimesheets = timesheets.filter((timesheet) => {
    return (
      timesheet.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedEmployee === '' || timesheet.employee_id === selectedEmployee)
    );
  });

  // Map filtered timesheets to calendar events
  const eventData: CalendarEvent[] = filteredTimesheets
    .map((timesheet) => {
      const start = new Date(timesheet.start_time);
      const end = new Date(timesheet.end_time);

      // Check for invalid start_time or end_time
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error(`Invalid date for timesheet ${timesheet.id}:`, {
          start_time: timesheet.start_time,
          end_time: timesheet.end_time,
        });
        return null;
      }

      // Return valid calendar event
      return {
        id: timesheet.id.toString(),
        title: `${timesheet.full_name}'s Shift`,
        start: start.toISOString(),
        end: end.toISOString(),
      };
    })
    .filter((event): event is CalendarEvent => event !== null);

  // Update calendar events when eventData changes
  useEffect(() => {
    if (calendarApp && calendarApp.events) {
      // Clear existing events
      const existingEvents = calendarApp.events.getAll();
      existingEvents.forEach((event) => calendarApp.events.remove(event.id));
  
      // Add new events
      eventData.forEach((event) => {
        console.log('Adding event:', event); // Debugging log
        calendarApp.events.add(event);
      });
    }
  }, [eventData, calendarApp]);
  
  // Debugging: Log eventData whenever it changes
  useEffect(() => {
    console.log('eventData:', eventData);
  }, [eventData]);
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Timesheets
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Add Timesheet
      </Button>

      <FormControlLabel
        control={
          <Switch
            checked={view === 'calendar'}
            onChange={(e) => setView(e.target.checked ? 'calendar' : 'table')}
          />
        }
        label={view === 'calendar' ? 'Calendar View' : 'Table View'}
      />

      <TextField
        label="Search by Employee Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Employee</InputLabel>
        <Select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value as number | '')}
        >
          <MenuItem value="">All Employees</MenuItem>
          {Array.from(new Set(timesheets.map((timesheet) => timesheet.employee_id))).map((employeeId) => (
            <MenuItem key={employeeId} value={employeeId}>
              {timesheets.find((timesheet) => timesheet.employee_id === employeeId)?.full_name ||
                `Employee ${employeeId}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : view === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>{timesheet.id}</TableCell>
                  <TableCell>{timesheet.employee_id}</TableCell>
                  <TableCell>{timesheet.full_name}</TableCell>
                  <TableCell>{new Date(timesheet.start_time).toLocaleString()}</TableCell>
                  <TableCell>{new Date(timesheet.end_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDetailsDialog(timesheet.id)}
                      style={{ marginRight: '8px' }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleOpenUpdateDialog(timesheet.id);
                      }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : filteredTimesheets.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No timesheets found.
        </Typography>
      ) : (
        <div style={{ height: '100%', minHeight: '600px' }}>
          <ScheduleXCalendar calendarApp={calendarApp} />
        </div>
      )}

      <NewTimesheetDialog open={openDialog} onClose={handleCloseDialog} onSave={handleSaveTimesheet} />
      <UpdateTimesheetDialog
        open={openUpdateDialog}
        onClose={handleCloseUpdateDialog}
        onUpdate={handleUpdateTimesheet}
        timesheetId={selectedTimesheetId}
        employees={timesheets.map((ts) => ({ id: ts.employee_id, full_name: ts.full_name }))}
      />
      <TimeSheetDetailsDialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        timesheetId={selectedTimesheetId}
      />
    </Container>
  );
};

export default TimesheetsPage;