import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
} from "@mui/material";

import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

import NiRefresh from "@/icons/nexture/ni-refresh";
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";

export default function CreateRolePage() {
    const { canAdd } = usePermission("Roles");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const validationSchema = yup.object({
        groupName: yup.string().trim().required("Title is required"),
        status: yup.string().oneOf(["Active", "Inactive"]),
    });

    const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();

    const formik = useFormik({
        initialValues: {
            groupName: "",
            status: "Active",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const freshPermissions = await fetchMenuPermissions();
            const rolePermissions: any = getFeaturePermissions("Roles", freshPermissions);
            const canAddFresh = rolePermissions?.AddPermission === 1;

            if (!canAddFresh) {
                toast.error("You do not have permission to add roles.");
                setTimeout(() => {
                    navigate(`/administration/roles`);
                }, 1500);
                return;
            }

            setLoading(true);
            try {
                const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
                const userId = localStorage.getItem(`${storagePrefix}:userId`);
                const baseUrl = import.meta.env.VITE_BASE_URL;

                const queryParams = new URLSearchParams({
                    class: "general",
                    action: "AddEditRSIGeneralRole",
                    WebServiceUserName: "WebserviceUser",
                    Password: "oqkq12345234",
                });

                const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Trigger: "add",
                        TitleEnglish: values.groupName,
                        TitleArabic: values.groupName,
                        IsActive: values.status === "Active" ? 1 : 0,
                        UserID: userId,
                    }),
                });

                const data = await response.json();

                if (data.status === "SUCCESS") {
                    toast.success("Role created successfully");
                    const newRoleId = data.RoleID;
                    setTimeout(() => {
                        if (newRoleId) {
                            navigate(`/administration/roles/permissions/${newRoleId}`, { state: { roleName: values.groupName } });
                        } else {
                            navigate("/administration/roles");
                        }
                    }, 1500);
                } else {
                    toast.error(data.message || "Failed to create role");
                }
            } catch (error) {
                console.error("Create role error:", error);
                toast.error("An error occurred while creating the role.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Grid container spacing={5} className="w-full" size={12} >
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Add Role
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/pages">
                            Administration
                        </Link>
                        <Link color="inherit" to="/administration/roles">
                            Roles
                        </Link>
                        <Typography variant="body2">Add Role</Typography>
                    </Breadcrumbs>
                </Grid>
                <Grid size={{ xs: 12, md: "auto" }}>
                    <Button
                        className="surface-standard"
                        size="medium"
                        color="grey"
                        variant="surface"
                        startIcon={<NiArrowLeft />}
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
                            {/* <Typography variant="h6" component="h6" className="card-title">
                                Role Details
                            </Typography> */}

                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.groupName && Boolean(formik.errors.groupName)}
                                        >
                                            <FormLabel component="label">
                                                Title <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Title"
                                                id="groupName"
                                                name="groupName"
                                                value={formik.values.groupName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.groupName && formik.errors.groupName && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.groupName}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
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
                                        startIcon={<NiFloppyDisk size={"medium"} />}
                                        type="submit"
                                        disabled={loading || !canAdd}
                                    >
                                        {loading ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Grid >
    );
}
