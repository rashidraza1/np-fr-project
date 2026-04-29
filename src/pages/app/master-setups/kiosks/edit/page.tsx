import { useFormik } from "formik";
import { useEffect, useState } from "react";
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
    Box,
} from "@mui/material";

import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiRefresh from "@/icons/nexture/ni-refresh";
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";

export default function EditKioskPage() {
    const { canEdit } = usePermission("Kiosks");
    const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const validationSchema = yup.object({
        name: yup.string().trim().required("Title Name (English) is required"),
        titleArabic: yup.string().trim().required("Title Name (Arabic) is required"),
        status: yup.string().oneOf(["Active", "Inactive"]),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            titleArabic: "",
            status: "Active",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}api/kiosk_api.php`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        name: values.name,
                        TitleArabic: values.titleArabic,
                        status: values.status,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    toast.success("Payment machine updated successfully");
                    setTimeout(() => {
                        navigate("/master-setups/kiosks");
                    }, 1000);
                } else {
                    toast.error(data.message || "Failed to update Payment machine");
                }
            } catch (error) {
                console.error("Error updating Payment machine:", error);
                toast.error("An error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (location.state) {
            const rowData: any = location.state;
            formik.setValues({
                name: rowData.kioskName || "",
                titleArabic: rowData.titleArabic || "",
                status: rowData.status || "Active",
            });
            setInitialLoading(false);
        } else {
            const fetchKioskDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}api/kiosk_api.php?id=${id}`);
                    const data = await response.json();
                    if (data.success && data.data) {
                        formik.setValues({
                            name: data.data.name || "",
                            titleArabic: data.data.TitleArabic || "",
                            status: data.data.IsActive == 1 ? "Active" : "Inactive",
                        });
                    } else {
                        toast.error("Failed to load kiosk details");
                        navigate("/master-setups/kiosks");
                    }
                } catch (error) {
                    console.error("Error fetching kiosk details:", error);
                    toast.error("An error occurred while loading details.");
                    navigate("/master-setups/kiosks");
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchKioskDetails();
        }
    }, [id, location.state, navigate]);

    if (initialLoading) {
        return (
            <Box className="flex justify-center items-center h-[400px]">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Edit Payment machine
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/pages">
                            Master Setups
                        </Link>
                        <Link color="inherit" to="/master-setups/kiosks">
                            Payment machine
                        </Link>
                        <Typography variant="body2">Edit Payment machine</Typography>
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
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.name && Boolean(formik.errors.name)}
                                        >
                                            <FormLabel component="label">
                                                Title <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Title"
                                                id="name"
                                                name="name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.name && formik.errors.name && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.name}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    {/* <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl
                                            className="outlined"
                                            variant="standard"
                                            size="small"
                                            fullWidth
                                            error={formik.touched.titleArabic && Boolean(formik.errors.titleArabic)}
                                        >
                                            <FormLabel component="label">
                                                Title Name (Arabic) <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                placeholder="Title Name (Arabic)"
                                                id="titleArabic"
                                                name="titleArabic"
                                                value={formik.values.titleArabic}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                dir="rtl"
                                            />
                                            {formik.touched.titleArabic && formik.errors.titleArabic && (
                                                <Typography variant="caption" color="error" className="mt-1">
                                                    {formik.errors.titleArabic}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid> */}
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
                                        disabled={loading}
                                    >
                                        {loading ? "Updating..." : "Update"}
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
