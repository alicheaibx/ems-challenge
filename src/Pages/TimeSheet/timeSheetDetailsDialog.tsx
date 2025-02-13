import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

interface TimeSheetDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  timesheetId: number | null;
}

const TimeSheetDetailsDialog: React.FC<TimeSheetDetailsDialogProps> = ({ open, onClose, timesheetId }) => {
  const [timesheet, setTimesheet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTimesheetDetails = async () => {
      if (timesheetId !== null) {
        try {
          const response = await fetch(`http://localhost:3000/timesheets/${timesheetId}`);
          if (!response.ok) throw new Error('Failed to fetch timesheet details');
          const data = await response.json();
          setTimesheet(data);
        } catch (error) {
          console.error('Error fetching timesheet details:', error);
          alert('Failed to fetch timesheet details. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTimesheetDetails();
  }, [timesheetId]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Timesheet Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : timesheet ? (
          <Card>
            <CardContent>
              <Typography variant="h6">Employee Name: {timesheet.full_name}</Typography>
              <Typography variant="body1">Employee ID: {timesheet.employee_id}</Typography>
              <Typography variant="body1">Start Time: {new Date(timesheet.start_time).toLocaleString()}</Typography>
              <Typography variant="body1">End Time: {new Date(timesheet.end_time).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        ) : (
          <Typography>No details found for this timesheet.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeSheetDetailsDialog;