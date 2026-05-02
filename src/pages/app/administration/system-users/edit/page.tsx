import { useFormik } from "formik";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import * as yup from "yup";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    Autocomplete,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Input,
    TextField,
    Radio,
    RadioGroup,
    Typography,
    CircularProgress,
} from "@mui/material";

import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiRefresh from "@/icons/nexture/ni-refresh";
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";

export default function EditSystemUserPage() {
    const { canEdit } = usePermission("System Users");
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [rolesOptions, setRolesOptions] = useState<any[]>([]);
    const [branchesOptions, setBranchesOptions] = useState<any[]>([]);
    const [departmentsOptions, setDepartmentsOptions] = useState<any[]>([]);

    const fetchOptions = useCallback(async (action: string, setter: React.Dispatch<React.SetStateAction<any[]>>, body: any = { IsActive: 1 }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=${action}&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                }
            );
            const data = await response.json();
            if (data.status === "SUCCESS" && data.data?.RecordListing) {
                setter(data.data.RecordListing);
            }
        } catch (error) {
            console.error(`Error fetching ${action}: `, error);
        }
    }, []);

    useEffect(() => {
        fetchOptions("RSIGeneralRoles", setRolesOptions);
        fetchOptions("RSIGeneralMasterList", setBranchesOptions, { MasterType: 1, Title: "", IsActive: "" });
        fetchOptions("RSIGeneralMasterList", setDepartmentsOptions, { MasterType: 2, Title: "", IsActive: "" });
    }, [fetchOptions]);
    const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();

    const validationSchema = yup.object({
        role: yup.object().nullable().required("Role is required"),
        fullName: yup.string().trim().required("Full Name is required"),
        status: yup.string().required("Status is required"),
        gender: yup.string().required("Gender is required"),
        branch: yup.object().nullable().required("Branch is required"),
        department: yup.object().nullable().required("Department is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        mobile: yup.string().required("Contact Number is required"),

        password: yup.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password")], "Passwords must match")
            .when("password", {
                is: (val: string) => val && val.length > 0,
                then: (schema) => schema.required("Confirm Password is required"),
                otherwise: (schema) => schema.notRequired(),
            }),
        sendCredentials: yup.boolean(),
    });

    const formik = useFormik({
        initialValues: {
            role: null,
            fullName: "",
            status: "Active",
            gender: "",
            branch: null,
            department: null,
            email: "",
            mobile: "",
            password: "",
            confirmPassword: "",
            sendCredentials: false,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const freshPermissions = await fetchMenuPermissions();
            const modulePermissions: any = getFeaturePermissions("System Users", freshPermissions);
            const canEditFresh = modulePermissions?.EditPermission === 1;

            if (!canEditFresh) {
                toast.error("You do not have permission to edit system users.");
                setTimeout(() => {
                    navigate("/administration/system-users");
                }, 1500);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=AddEditRSIGeneralSystemUser&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            Trigger: "edit",
                            Email: values.email,
                            Password: values.password,
                            FullNameEnglish: values.fullName,
                            FullNameArabic: values.fullName,
                            RoleID: (values.role as any)?.TableID,
                            BranchID: (values.branch as any)?.TableID,
                            DepartmentID: (values.department as any)?.TableID,
                            IsMale: values.gender === "Male" ? 1 : 0,
                            ContactNumber: values.mobile,
                            IsActive: values.status === "Active" ? 1 : 0,
                            UserID: Number(localStorage.getItem(`${import.meta.env.VITE_STORAGE_PREFIX || "nx"}:userId`)) || 0,
                            TableID: id
                        }),
                    }
                );
                const data = await response.json();
                if (data.status === "SUCCESS") {
                    toast.success(data.message || "User updated successfully");
                    setTimeout(() => {
                        navigate("/administration/system-users");
                    }, 1000);
                } else {
                    toast.error(data.message || "Failed to update user");
                }
            } catch (error) {
                console.error("Error updating user:", error);
                toast.error("An error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        onReset: () => {
            formik.resetForm();
        }
    });

    useEffect(() => {
        if (location.state) {
            const data = location.state;
            formik.setValues({
                role: { TableID: data.RoleID, TitleEnglish: data.RoleTitleEnglish } as any, // Adjust based on Autocomplete value expectation
                fullName: data.FullNameEnglish,
                status: data.IsActive === "1" ? "Active" : "Inactive",
                gender: data.IsMale === "1" ? "Male" : "Female", // Assuming default string "1" or "0"
                branch: { TableID: data.BranchID, TitleEnglish: data.BranchTitleEnglish } as any,
                department: { TableID: data.DepartmentID, TitleEnglish: data.DepartmentTitleEnglish } as any,
                email: data.Email,
                mobile: data.ContactNumber,
                password: "",
                confirmPassword: "",
                sendCredentials: false,
            });
        } else if (id) {
            // Fallback: Fetch data if no state (direct link access)
            const fetchUser = async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralSystemUsers&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                        {
                            method: "POST",
                            body: JSON.stringify({ TableID: id }),
                        }
                    );
                    const data = await response.json();
                    if (data.status === "SUCCESS" && data.data) {
                        let userData = data.data;
                        if (data.data.RecordListing) {
                            userData = Array.isArray(data.data.RecordListing) ? data.data.RecordListing[0] : data.data.RecordListing;
                        } else if (Array.isArray(data.data)) {
                            userData = data.data[0];
                        }

                        formik.setValues({
                            role: { TableID: userData.RoleID, TitleEnglish: userData.RoleTitleEnglish } as any,
                            fullName: userData.FullNameEnglish,
                            status: userData.IsActive === "1" ? "Active" : "Inactive",
                            gender: userData.IsMale === "1" ? "Male" : "Female",
                            branch: { TableID: userData.BranchID, TitleEnglish: userData.BranchTitleEnglish } as any,
                            department: { TableID: userData.DepartmentID, TitleEnglish: userData.DepartmentTitleEnglish } as any,
                            email: userData.Email,
                            mobile: userData.ContactNumber,
                            password: "",
                            confirmPassword: "",
                            sendCredentials: false,
                        });
                    }
                } catch (e) {
                    console.error("Error fetching user details", e);
                }
            };
            fetchUser();
        }
    }, [id, location.state, formik.setValues]);

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Edit System User
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/pages">
                            Administration
                        </Link>
                        <Link color="inherit" to="/administration/system-users">
                            System Users
                        </Link>
                        <Typography variant="body2">Edit System User</Typography>
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
                <form onSubmit={formik.handleSubmit} className="w-full">
                    <Grid container spacing={4}>
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" className="mb-4 font-bold">
                                        System User
                                    </Typography>

                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.role && Boolean(formik.errors.role)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Role <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Autocomplete
                                                    id="role"
                                                    options={rolesOptions}
                                                    getOptionLabel={(option) => option.TitleEnglish || ""}
                                                    value={rolesOptions.find((r) => r.TableID === (formik.values.role as any)?.TableID) || null}
                                                    onChange={(_, newValue) => formik.setFieldValue("role", newValue)}
                                                    onBlur={formik.handleBlur}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant="standard"
                                                            error={formik.touched.role && Boolean(formik.errors.role)}
                                                        />
                                                    )}
                                                />
                                                {formik.touched.role && formik.errors.role && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.role}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Full Name <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Input
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

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.gender && Boolean(formik.errors.gender)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Gender <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="gender"
                                                    value={formik.values.gender}
                                                    onChange={formik.handleChange}
                                                    className="gap-5"
                                                >
                                                    <FormControlLabel
                                                        value="Male"
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                icon={<RadiobuttonSmallEmptyOutlined />}
                                                                checkedIcon={<RadiobuttonSmallChecked />}
                                                            />
                                                        }
                                                        label="Male"
                                                    />
                                                    <FormControlLabel
                                                        value="Female"
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                icon={<RadiobuttonSmallEmptyOutlined />}
                                                                checkedIcon={<RadiobuttonSmallChecked />}
                                                            />
                                                        }
                                                        label="Female"
                                                    />
                                                </RadioGroup>
                                                {formik.touched.gender && formik.errors.gender && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.gender}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.branch && Boolean(formik.errors.branch)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Branch <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Autocomplete
                                                    id="branch"
                                                    options={branchesOptions}
                                                    getOptionLabel={(option) => option.TitleEnglish || ""}
                                                    value={branchesOptions.find((b) => b.TableID === (formik.values.branch as any)?.TableID) || null}
                                                    onChange={(_, newValue) => formik.setFieldValue("branch", newValue)}
                                                    onBlur={formik.handleBlur}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant="standard"
                                                            error={formik.touched.branch && Boolean(formik.errors.branch)}
                                                        />
                                                    )}
                                                />
                                                {formik.touched.branch && formik.errors.branch && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.branch}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.department && Boolean(formik.errors.department)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Department <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Autocomplete
                                                    id="department"
                                                    options={departmentsOptions}
                                                    getOptionLabel={(option) => option.TitleEnglish || ""}
                                                    value={departmentsOptions.find((d) => d.TableID === (formik.values.department as any)?.TableID) || null}
                                                    onChange={(_, newValue) => formik.setFieldValue("department", newValue)}
                                                    onBlur={formik.handleBlur}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant="standard"
                                                            error={formik.touched.department && Boolean(formik.errors.department)}
                                                        />
                                                    )}
                                                />
                                                {formik.touched.department && formik.errors.department && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.department}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Contact Number <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Input
                                                    id="mobile"
                                                    name="mobile"
                                                    value={formik.values.mobile}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.mobile && formik.errors.mobile && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.mobile}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.status && Boolean(formik.errors.status)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Status <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="status"
                                                    value={formik.values.status}
                                                    onChange={formik.handleChange}
                                                    className="gap-5"
                                                >
                                                    <FormControlLabel
                                                        value="Active"
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
                                                        value="Inactive"
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
                                                {formik.touched.status && formik.errors.status && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.status}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" className="mb-4 font-bold">
                                        Login Details
                                    </Typography>

                                    <Grid container spacing={3} alignItems="center">
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    value={formik.values.email}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.email && formik.errors.email && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.email}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.password && Boolean(formik.errors.password)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Password <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={formik.values.password}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="bg-blue-50"
                                                />
                                                {formik.touched.password && formik.errors.password && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.password}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControl
                                                className="outlined"
                                                variant="standard"
                                                size="small"
                                                fullWidth
                                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                            >
                                                <FormLabel component="label" className="mb-1">
                                                    Confirm Password <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formik.values.confirmPassword}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                                    <Typography variant="caption" color="error" className="mt-1">
                                                        {formik.errors.confirmPassword}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="sendCredentials"
                                                        checked={formik.values.sendCredentials}
                                                        onChange={formik.handleChange}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" style={{ maxWidth: "150px" }}>
                                                        Send Login Credentials to User via Email
                                                    </Typography>
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={12}>
                            <div className="flex justify-end gap-2">
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
                                    disabled={loading || !canEdit}
                                >
                                    {loading ? "Updating..." : "Update"}
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
}
