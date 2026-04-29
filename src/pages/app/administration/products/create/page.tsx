import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import {
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    FormControl,
    FormLabel,
    Grid,
    Input,
    Typography,
    Select,
    MenuItem,
    Divider,
} from "@mui/material";

import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiRefresh from "@/icons/nexture/ni-refresh";

export default function CreateProductPage() {
    const navigate = useNavigate();

    const validationSchema = yup.object({
        titleEn: yup.string().required("Title (English) is required"),
        titleAr: yup.string().required("Title (Arabic) is required"),
        mainCategory: yup.string().required("Main Category is required"),
        subCategory: yup.string().required("Sub Category is required"),
        status: yup.string().required("Status is required"),
    });

    const formik = useFormik({
        initialValues: {
            titleEn: "",
            titleAr: "",
            mainCategory: "",
            subCategory: "",
            status: "Active",
            showInMainPage: false,
            showInFooter: false,
            manualDocument: null,
            brochureDocument: null,
            briefDescEn: "",
            briefDescAr: "",
            descEn: "",
            descAr: "",
            seoTitleEn: "",
            seoTitleAr: "",
            seoDescEn: "",
            seoDescAr: "",
            seoKeywordsEn: "",
            seoKeywordsAr: "",
            seoTagsEn: "",
            seoTagsAr: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log("Saving product:", values);
            // Add API call here
            navigate("/administration/products");
        },
    });

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        Add Product
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/administration">
                            Administration
                        </Link>
                        <Link color="inherit" to="/administration/products">
                            Products
                        </Link>
                        <Typography variant="body2">Add Product</Typography>
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
                                <Grid container spacing={3}>

                                    {/* General Info */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth error={formik.touched.titleEn && Boolean(formik.errors.titleEn)}>
                                            <FormLabel component="label">Title (English) <span className="text-red-500">*</span></FormLabel>
                                            <Input
                                                name="titleEn"
                                                value={formik.values.titleEn}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.titleEn && formik.errors.titleEn && <Typography variant="caption" color="error">{formik.errors.titleEn}</Typography>}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth error={formik.touched.titleAr && Boolean(formik.errors.titleAr)}>
                                            <FormLabel component="label">Title (Arabic) <span className="text-red-500">*</span></FormLabel>
                                            <Input
                                                name="titleAr"
                                                value={formik.values.titleAr}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                dir="rtl"
                                            />
                                            {formik.touched.titleAr && formik.errors.titleAr && <Typography variant="caption" color="error">{formik.errors.titleAr}</Typography>}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth error={formik.touched.mainCategory && Boolean(formik.errors.mainCategory)}>
                                            <FormLabel component="label">Main Category <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                name="mainCategory"
                                                value={formik.values.mainCategory}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Select Main Category</MenuItem>
                                                <MenuItem value="Electronics">Electronics</MenuItem>
                                                <MenuItem value="Home">Home</MenuItem>
                                            </Select>
                                            {formik.touched.mainCategory && formik.errors.mainCategory && <Typography variant="caption" color="error">{formik.errors.mainCategory}</Typography>}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}>
                                            <FormLabel component="label">Sub Category <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                name="subCategory"
                                                value={formik.values.subCategory}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Select Sub Category</MenuItem>
                                                <MenuItem value="Mobile">Mobile</MenuItem>
                                                <MenuItem value="Furniture">Furniture</MenuItem>
                                            </Select>
                                            {formik.touched.subCategory && formik.errors.subCategory && <Typography variant="caption" color="error">{formik.errors.subCategory}</Typography>}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                                            <FormLabel component="label">Status <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                name="status"
                                                value={formik.values.status}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            >
                                                <MenuItem value="Active">Active</MenuItem>
                                                <MenuItem value="Inactive">Inactive</MenuItem>
                                                <MenuItem value="Backlog">Backlog</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Document Uploads (Mock) */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormLabel component="label" className="block mb-1">Manual Document</FormLabel>
                                        <Input type="file" disableUnderline />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormLabel component="label" className="block mb-1">Brochure Document</FormLabel>
                                        <Input type="file" disableUnderline />
                                    </Grid>

                                    {/* Brief Description */}
                                    <Grid size={12}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Brief Description (English)</FormLabel>
                                            <Input
                                                name="briefDescEn"
                                                multiline
                                                rows={2}
                                                value={formik.values.briefDescEn}
                                                onChange={formik.handleChange}
                                                placeholder="Max 300 characters"
                                            />
                                            <Typography variant="caption" className="text-end block">300 characters left</Typography>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={12}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Brief Description (Arabic)</FormLabel>
                                            <Input
                                                name="briefDescAr"
                                                multiline
                                                rows={2}
                                                value={formik.values.briefDescAr}
                                                onChange={formik.handleChange}
                                                dir="rtl"
                                                placeholder="Max 300 characters"
                                            />
                                            <Typography variant="caption" className="text-end block">300 characters left</Typography>
                                        </FormControl>
                                    </Grid>

                                    {/* Full Description */}
                                    <Grid size={12}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Description (English)</FormLabel>
                                            <Input
                                                name="descEn"
                                                multiline
                                                rows={6}
                                                value={formik.values.descEn}
                                                onChange={formik.handleChange}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid size={12}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Description (Arabic)</FormLabel>
                                            <Input
                                                name="descAr"
                                                multiline
                                                rows={6}
                                                value={formik.values.descAr}
                                                onChange={formik.handleChange}
                                                dir="rtl"
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid size={12}>
                                        <Divider className="my-2" />
                                        <Typography variant="h5" className="mb-3 bg-gray-700 text-white p-2 inline-block rounded-sm">SEO Tags</Typography>
                                    </Grid>

                                    {/* SEO Section */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Title (English)</FormLabel>
                                            <Input name="seoTitleEn" value={formik.values.seoTitleEn} onChange={formik.handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Title (Arabic)</FormLabel>
                                            <Input name="seoTitleAr" value={formik.values.seoTitleAr} onChange={formik.handleChange} dir="rtl" />
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Description (English)</FormLabel>
                                            <Input name="seoDescEn" multiline rows={2} value={formik.values.seoDescEn} onChange={formik.handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Description (Arabic)</FormLabel>
                                            <Input name="seoDescAr" multiline rows={2} value={formik.values.seoDescAr} onChange={formik.handleChange} dir="rtl" />
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Keywords (English)</FormLabel>
                                            <Input name="seoKeywordsEn" multiline rows={2} value={formik.values.seoKeywordsEn} onChange={formik.handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Keywords (Arabic)</FormLabel>
                                            <Input name="seoKeywordsAr" multiline rows={2} value={formik.values.seoKeywordsAr} onChange={formik.handleChange} dir="rtl" />
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Other Tags (English)</FormLabel>
                                            <Input name="seoTagsEn" multiline rows={2} value={formik.values.seoTagsEn} onChange={formik.handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                                            <FormLabel component="label">Other Tags (Arabic)</FormLabel>
                                            <Input name="seoTagsAr" multiline rows={2} value={formik.values.seoTagsAr} onChange={formik.handleChange} dir="rtl" />
                                        </FormControl>
                                    </Grid>

                                    {/* Actions */}
                                    <Grid size={12} className="flex justify-end gap-2 mt-5">
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
                                        >
                                            Save
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
}
