import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import * as yup from "yup";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Input,
    Radio,
    RadioGroup,
    Typography,
    CircularProgress,
} from "@mui/material";

import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiRefresh from "@/icons/nexture/ni-refresh";

export default function EditStaffPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const validationSchema = yup.object({
        fullName: yup.string().trim().required("Full Name is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        empCode: yup.string().trim().required("Login ID is required"),
        //pin: yup.string().trim().test('is-valid-pin', 'PIN must be exactly 6 digits', value => !value || (value.length === 6 && /^\d+$/.test(value))),
        pin: yup.string().matches(/^\d{6}$/, "Login PIN must be exactly 6 digits"),
        status: yup.string().oneOf(["1", "0"]),
    });

    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            empCode: "",
            pin: "",
            status: "1",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_api.php?id=${id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        FullName: values.fullName,
                        Email: values.email,
                        EmpCode: values.empCode,
                        PIN: values.pin,
                        Status: values.status,
                        ModifiedBy: "Admin",
                    }),
                });
                const data = await response.json();
                if (data.status === "SUCCESS") {
                    toast.success("Staff updated successfully");
                    setTimeout(() => {
                        navigate("/master-setups/staff");
                    }, 1000);
                } else {
                    toast.error(data.message || "Failed to update staff");
                }
            } catch (error) {
                console.error("Error updating staff:", error);
                toast.error("An error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        // If data is passed via router state from listing page
        if (location.state) {
            const rowData: any = location.state;
            formik.setValues({
                fullName: rowData.fullName || "",
                email: rowData.email || "",
                empCode: rowData.empCode || "",
                pin: "", // Always leave PIN blank on load
                status: (rowData.status === "Active" || rowData.status === "1" || rowData.status === 1) ? "1" : "0",
            });
            setInitialLoading(false);
        } else {
            // Fetch the staff details from API if not passed via state
            const fetchStaffDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_api.php?id=${id}`);
                    if (!response.ok) throw new Error("Network response was not ok");
                    const data = await response.json();
                    if (data.status === "SUCCESS" && data.data) {
                        formik.setValues({
                            fullName: data.data.FullName || "",
                            email: data.data.Email || "",
                            empCode: data.data.EmpCode || "",
                            pin: "", // Always leave PIN blank on load
                            status: String(data.data.Status) === "1" ? "1" : "0",
                        });
                    } else {
                        toast.error("Failed to load staff details");
                        navigate("/master-setups/staff");
                    }
                } catch (error) {
                    console.error("Error fetching staff details:", error);
                    toast.error("An error occurred while loading details.");
                    navigate("/master-setups/staff");
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchStaffDetails();
        }
    }, [id, location.state, navigate]);

    if (initialLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{ height: "400px" }}>
                <CircularProgress />
            </Grid>
        );
    }

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Edit Maintenance Staff
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/pages">
                            Master Setups
                        </Link>
                        <Link color="inherit" to="/master-setups/staff">
                            Maintenance Staff
                        </Link>
                        <Typography variant="body2">Edit Maintenance Staff</Typography>
                    </Breadcrumbs>
                </Grid>
                <Grid size={{ xs: 12, md: "auto" }}>
                    <Button
                        className="surface-standard"
                        size="medium"
                        color="grey"
                        variant="surface"
                        startIcon={<NiArrowLeft size={"medium"} />}
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </Grid>
            </Grid>

            <Grid container size={12}>
                <Grid size={12}>
                    <Card className="mb-5">
                        <CardContent>
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={4} alignItems="flex-start">
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                        >
                                            <FormLabel component="label">
                                                Name <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Enter Full Name"
                                                id="fullName"
                                                name="fullName"
                                                value={formik.values.fullName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.fullName && formik.errors.fullName && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.fullName}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                        >
                                            <FormLabel component="label">
                                                Email <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Enter Email Address"
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.email}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.empCode && Boolean(formik.errors.empCode)}
                                        >
                                            <FormLabel component="label">
                                                Login ID (It should be numeric and six digits) <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Enter Login ID"
                                                id="empCode"
                                                name="empCode"
                                                value={formik.values.empCode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}

                                                disabled
                                            />
                                            {formik.touched.empCode && formik.errors.empCode && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.empCode}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.pin && Boolean(formik.errors.pin)}
                                        >
                                            <FormLabel component="label">
                                                Login PIN (It should be numeric and six digits)
                                            </FormLabel>
                                            <Input
                                                placeholder="Leave blank to keep current PIN"
                                                id="pin"
                                                name="pin"
                                                type="text"
                                                value={formik.values.pin}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                inputProps={{ maxLength: 6 }}
                                            />
                                            {formik.touched.pin && formik.errors.pin && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.pin}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                        <FormControl fullWidth size="small" className="mb-0">
                                            <FormLabel component="label" className="mb-2 block">
                                                Status
                                            </FormLabel>
                                            <RadioGroup
                                                row
                                                name="status"
                                                value={formik.values.status}
                                                onChange={formik.handleChange}
                                                className="gap-5"
                                            >
                                                <FormControlLabel
                                                    value="1"
                                                    control={
                                                        <Radio
                                                            size="small"
                                                            icon={<RadiobuttonSmallEmptyOutlined />}
                                                            checkedIcon={<RadiobuttonSmallChecked />}
                                                        />
                                                    }
                                                    label="Active"
                                                />
                                                <FormControlLabel
                                                    value="0"
                                                    control={
                                                        <Radio
                                                            size="small"
                                                            icon={<RadiobuttonSmallEmptyOutlined />}
                                                            checkedIcon={<RadiobuttonSmallChecked />}
                                                        />
                                                    }
                                                    label="Inactive"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <div className="mt-5 flex justify-end gap-2">
                                    <Button
                                        className="surface-standard"
                                        size="medium"
                                        color="grey"
                                        variant="surface"
                                        startIcon={<NiRefresh size={"medium"} />}
                                        onClick={() => formik.resetForm()}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        className="surface-standard"
                                        size="medium"
                                        color="primary"
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NiFloppyDisk size={"medium"} />}
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
}
