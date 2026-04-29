import { useFormik } from "formik";
import { useEffect } from "react";
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
  Divider,
} from "@mui/material";

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";

export default function MyAccountPage() {
  const navigate = useNavigate();

  const validationSchema = yup.object({
    organizationName: yup.string().required("Organization Name is required"),
    contactEmail: yup.string().email("Invalid email format").required("Contact Email is required"),
    phone: yup.string().required("Phone Number is required"),
    website: yup.string().url("Invalid URL format"),
    address: yup.string().required("Address is required"),
  });

  const formik = useFormik({
    initialValues: {
      organizationName: "",
      contactEmail: "",
      phone: "",
      website: "",
      address: "",
      planName: "",
      planExpiry: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log("Updating account:", values);
      // Add API call here
      navigate("/dashboard");
    },
  });

  useEffect(() => {
    // Mock data fetching
    const mockFetchAccount = () => {
      formik.setValues({
        organizationName: "Acme Corp",
        contactEmail: "admin@acmecorp.com",
        phone: "+1 555-0123",
        website: "https://www.acmecorp.com",
        address: "123 Business Rd, Tech City, TC 90210",
        planName: "Enterprise Plan",
        planExpiry: "2025-12-31",
      });
    };

    mockFetchAccount();
  }, []);

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid container spacing={2.5} className="w-full" size={12}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            My Account
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" to="/dashboard">
              Home
            </Link>
            <Link color="inherit" to="/configuration">
              Configuration
            </Link>
            <Typography variant="body2">My Account</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>

      <Grid container size={12}>
        <Grid size={12}>
          <Card className="mb-5">
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  {/* Organization Details */}
                  <Grid size={12}>
                    <Typography variant="h6" className="mb-2">
                      Organization Details
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                      error={formik.touched.organizationName && Boolean(formik.errors.organizationName)}
                    >
                      <FormLabel component="label">
                        Organization Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        placeholder="Organization Name"
                        id="organizationName"
                        name="organizationName"
                        value={formik.values.organizationName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.organizationName && formik.errors.organizationName && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.organizationName}
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
                      error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                    >
                      <FormLabel component="label">
                        Contact Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        placeholder="Contact Email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formik.values.contactEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.contactEmail && formik.errors.contactEmail && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.contactEmail}
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
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                    >
                      <FormLabel component="label">
                        Phone <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        placeholder="Phone"
                        id="phone"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.phone}
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
                      error={formik.touched.website && Boolean(formik.errors.website)}
                    >
                      <FormLabel component="label">
                        Website
                      </FormLabel>
                      <Input
                        placeholder="https://example.com"
                        id="website"
                        name="website"
                        value={formik.values.website}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.website && formik.errors.website && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.website}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                      error={formik.touched.address && Boolean(formik.errors.address)}
                    >
                      <FormLabel component="label">
                        Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        placeholder="Full Address"
                        id="address"
                        name="address"
                        multiline
                        rows={2}
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.address && formik.errors.address && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.address}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid size={12} className="my-2">
                    <Divider />
                  </Grid>

                  {/* Plan Details (Read-Only) */}
                  <Grid size={12}>
                    <Typography variant="h6" className="mb-2">
                      Subscription Plan
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <FormLabel component="label">
                        Current Plan
                      </FormLabel>
                      <Input
                        readOnly
                        disabled
                        value={formik.values.planName}
                        className="bg-gray-100"
                        disableUnderline
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <FormLabel component="label">
                        Expiry Date
                      </FormLabel>
                      <Input
                        readOnly
                        disabled
                        value={formik.values.planExpiry}
                        className="bg-gray-100"
                        disableUnderline
                      />
                    </FormControl>
                  </Grid>

                  {/* Actions */}
                  <Grid size={12} className="flex justify-end gap-2 mt-4">
                    <Button
                      className="surface-standard"
                      size="medium"
                      color="grey"
                      variant="surface"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
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
