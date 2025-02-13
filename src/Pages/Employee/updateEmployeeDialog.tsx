import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { Employee } from './Types'; // Assuming Employee type is imported

interface UpdateEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (employeeData: Employee, isUpdate: boolean, id?: number) => void;
  employeeToEdit: Employee | null;
}

const UpdateEmployeeDialog: React.FC<UpdateEmployeeDialogProps> = ({ open, onClose, onSave, employeeToEdit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    job_title: '',
    department: '',
    salary: '',
    photo: null as File | null,
    document: null as File | null,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        full_name: employeeToEdit.full_name,
        email: employeeToEdit.email,
        phone_number: employeeToEdit.phone_number,
        date_of_birth: employeeToEdit.date_of_birth
          ? formatDate(employeeToEdit.date_of_birth, 'dd-MM-yyyy', 'yyyy-MM-dd')
          : '',
        job_title: employeeToEdit.job_title,
        department: employeeToEdit.department,
        salary: employeeToEdit.salary,
        photo: null,
        document: null,
      });
    }
  }, [employeeToEdit]);

  const formatDate = (date: string, fromFormat: string, toFormat: string) => {
    if (!date) return '';

    try {
      const [day, month, year] = date.split('-');
      if (fromFormat === 'dd-MM-yyyy' && toFormat === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
      if (fromFormat === 'yyyy-MM-dd' && toFormat === 'dd-MM-yyyy') return `${day}-${month}-${year}`;
      return date;
    } catch (error) {
      console.error('Error formatting date:', error);
      return date; // Return the original date if formatting fails
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'document') => {
    if (event.target.files && event.target.files[0]) {
      setFormData((prev) => ({ ...prev, [field]: event.target.files![0] }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSave = async () => {
    setLoading(true);

    const photoBase64 = formData.photo ? await fileToBase64(formData.photo) : null;
    const documentBase64 = formData.document ? await fileToBase64(formData.document) : null;

    const employeeData: Employee = {
      ...formData,
      date_of_birth: formatDate(formData.date_of_birth, 'yyyy-MM-dd', 'dd-MM-yyyy'),
      photo: photoBase64,
      document: documentBase64,
    };

    onSave(employeeData, true, employeeToEdit?.id);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Employee</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <TextField fullWidth label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Date of Birth" name="date_of_birth" type="date" InputLabelProps={{ shrink: true }} value={formData.date_of_birth} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Salary ($)" name="salary" type="number" value={formData.salary} onChange={handleChange} margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Upload Photo</InputLabel>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
              {formData.photo && <p>{formData.photo.name}</p>}
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Upload Document</InputLabel>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document')} />
              {formData.document && <p>{formData.document.name}</p>}
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Update Employee
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateEmployeeDialog;