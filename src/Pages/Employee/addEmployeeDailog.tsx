import React, { useState, useEffect } from "react";
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
	Typography,
} from "@mui/material";
import { Employee } from "./Types";

interface NewEmployeeDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (employeeData: Employee) => void;
	employeeToEdit?: Employee | null;
}

const NewEmployeeDialog: React.FC<NewEmployeeDialogProps> = ({
	open,
	onClose,
	onSave,
	employeeToEdit,
}) => {
	const [fullName, setFullName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [dateOfBirth, setDateOfBirth] = useState<string>("");
	const [jobTitle, setJobTitle] = useState<string>("");
	const [department, setDepartment] = useState<string>("");
	const [salary, setSalary] = useState<string>("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [document, setDocument] = useState<File | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (employeeToEdit) {
			setFullName(employeeToEdit.full_name);
			setEmail(employeeToEdit.email);
			setPhoneNumber(employeeToEdit.phone_number);
			setDateOfBirth(employeeToEdit.date_of_birth);
			setJobTitle(employeeToEdit.job_title);
			setDepartment(employeeToEdit.department);
			setSalary(employeeToEdit.salary);
		} else {
			setFullName("");
			setEmail("");
			setPhoneNumber("");
			setDateOfBirth("");
			setJobTitle("");
			setDepartment("");
			setSalary("");
		}
	}, [employeeToEdit]);

	const handleFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		setFile: (file: File | null) => void
	) => {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	};

	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};
		if (!fullName) newErrors.fullName = "Full Name is required";
		if (!phoneNumber) newErrors.phoneNumber = "Phone Number is required";
		if (!salary || parseFloat(salary) < 1500)
			newErrors.salary = "Salary must be at least 1500";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) return;
		setLoading(true);
		try {
			const photoBase64 = photo ? await fileToBase64(photo) : null;
			const documentBase64 = document ? await fileToBase64(document) : null;

			const employeeData: Employee = {
				full_name: fullName,
				email: email,
				phone_number: phoneNumber,
				date_of_birth: dateOfBirth,
				job_title: jobTitle,
				department: department,
				salary: salary,
				photo: photoBase64,
				document: documentBase64,
			};

			onSave(employeeData);
			onClose();
		} catch (error) {
			console.error("Error saving employee:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{employeeToEdit ? "Update Employee" : "Add New Employee"}
			</DialogTitle>
			<DialogContent>
				{loading ? (
					<CircularProgress />
				) : (
					<>
						<TextField
							fullWidth
							label="Full Name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							margin="normal"
							error={!!errors.fullName}
							helperText={errors.fullName}
							required
						/>
						<TextField
							fullWidth
							label="Email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							margin="normal"
						/>
						<TextField
							fullWidth
							label="Phone Number"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							margin="normal"
							error={!!errors.phoneNumber}
							helperText={errors.phoneNumber}
							required
						/>
						<TextField
							fullWidth
							label="Date of Birth"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={dateOfBirth}
							onChange={(e) => setDateOfBirth(e.target.value)}
							margin="normal"
						/>
						<TextField
							fullWidth
							label="Job Title"
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
							margin="normal"
						/>
						<TextField
							fullWidth
							label="Department"
							value={department}
							onChange={(e) => setDepartment(e.target.value)}
							margin="normal"
						/>
						<TextField
							fullWidth
							label="Salary ($)"
							type="number"
							value={salary}
							onChange={(e) => setSalary(e.target.value)}
							margin="normal"
							error={!!errors.salary}
							helperText={errors.salary}
							required
						/>
						<FormControl fullWidth margin="normal">
							<InputLabel>Upload Photo</InputLabel>
							<input
								type="file"
								accept="image/*"
								onChange={(e) => handleFileChange(e, setPhoto)}
							/>
							{photo && <Typography variant="body2">{photo.name}</Typography>}
						</FormControl>
						<FormControl fullWidth margin="normal">
							<InputLabel>Upload Document</InputLabel>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={(e) => handleFileChange(e, setDocument)}
							/>
							{document && (
								<Typography variant="body2">{document.name}</Typography>
							)}
						</FormControl>
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="secondary">
					Cancel
				</Button>
				<Button onClick={handleSave} color="primary" disabled={loading}>
					{employeeToEdit ? "Save Employee" : "Add Employee"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NewEmployeeDialog;
