import { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
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
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";

export default function CreateBranchPage() {
    const { canAdd } = usePermission("Branches");
    const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const validationSchema = yup.object({
        branchName: yup.string().trim().required("Title is required"),
        status: yup.string().oneOf(["Active", "Inactive"]),
    });

    const formik = useFormik({
        initialValues: {
            branchName: "",
            status: "Active",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const freshPermissions = await fetchMenuPermissions();
            const modulePermissions: any = getFeaturePermissions("Branches", freshPermissions);
            const canAddFresh = modulePermissions?.AddPermission === 1;

            if (!canAddFresh) {
                toast.error("You do not have permission to add branches.");
                setTimeout(() => {
                    navigate("/master-setups/branches");
                }, 1500);
                return;
            }

            setLoading(true);
            try {
                const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
                const userId = localStorage.getItem(`${storagePrefix}:userId`) || 1;

                const response = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=AddEditRSIGeneralMaster&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            Trigger: "add",
                            MasterType: 1,
                            TitleEnglish: values.branchName,
                            TitleArabic: values.branchName,
                            IsActive: values.status === "Active" ? 1 : 0,
                            UserID: userId,
                        }),
                    }
                );
                const data = await response.json();
                if (data.status === "SUCCESS") {
                    toast.success("Branch created successfully");
                    setTimeout(() => {
                        navigate("/master-setups/branches");
                    }, 1000);
                } else {
                    toast.error(data.message || "Failed to create branch");
                }
            } catch (error) {
                console.error("Error creating branch:", error);
                toast.error("An error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Add Branch
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/pages">
                            Master Setups
                        </Link>
                        <Link color="inherit" to="/master-setups/branches">
                            Branches
                        </Link>
                        <Typography variant="body2">Add Branch</Typography>
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
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                                        >
                                            <FormLabel component="label">
                                                Title <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Title"
                                                id="branchName"
                                                name="branchName"
                                                value={formik.values.branchName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.branchName && formik.errors.branchName && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.branchName}
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
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NiFloppyDisk size={"medium"} />}
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
        </Grid>
    );
}
