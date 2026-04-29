import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  CircularProgress,
} from "@mui/material";

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";

export default function ChangePasswordPage() {
  const { canEdit } = usePermission("Change Password");
  const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object({
    oldPassword: yup.string().required("Old Password is required"),
    newPassword: yup
      .string()
      .required("New Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number"),
    confirmPassword: yup
      .string()
      .required("Confirm Password is required")
      .oneOf([yup.ref("newPassword")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const freshPermissions = await fetchMenuPermissions();
      const modulePermissions: any = getFeaturePermissions("Change Password", freshPermissions);
      const canEditFresh = modulePermissions?.EditPermission === 1;

      if (!canEditFresh) {
        toast.error("You do not have permission to change password.");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
        return;
      }

      setLoading(true);
      try {
        const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
        const userId = localStorage.getItem(`${storagePrefix}:userId`) || 1; // Default to 1 if not found, or use a safer default like 10000 per user request example if applicable

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=ChangeRSIGeneralSystemUserPassword&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
          {
            method: "POST",
            body: JSON.stringify({
              UserID: userId,
              OldPassword: values.oldPassword,
              NewPassword: values.newPassword,
              ConfirmPassword: values.confirmPassword,
            }),
          }
        );
        const data = await response.json();

        if (data.status === "SUCCESS") {
          toast.success("Password changed successfully");
          formik.resetForm();
          // Optional: redirect after success
          // setTimeout(() => navigate("/dashboard"), 1500); 
        } else {
          toast.error(data.message || "Failed to change password");
        }
      } catch (error) {
        console.error("Error changing password:", error);
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
            Change Password
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" to="/dashboard">
              Home
            </Link>
            <Link color="inherit" to="/configuration">
              Configuration
            </Link>
            <Typography variant="body2">Change Password</Typography>
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
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                      error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
                    >
                      <FormLabel component="label">
                        Enter Old Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Old Password"
                        id="oldPassword"
                        name="oldPassword"
                        value={formik.values.oldPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.oldPassword && formik.errors.oldPassword && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.oldPassword}
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
                      error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                    >
                      <FormLabel component="label">
                        Enter New Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="New Password"
                        id="newPassword"
                        name="newPassword"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.newPassword && formik.errors.newPassword && (
                        <Typography variant="caption" color="error" className="mt-1">
                          {formik.errors.newPassword}
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
                      error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    >
                      <FormLabel component="label">
                        Confirm New Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Confirm New Password"
                        id="confirmPassword"
                        name="confirmPassword"
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

                  <Grid size={12} className="mt-2">
                    <Typography variant="caption" color="text.secondary" className="block">
                      NOTE: Password must atleast contain One Upper Case Letter, One Lower Case letter, One digit and Minimum 8 characters.
                    </Typography>
                  </Grid>

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
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NiFloppyDisk size={"medium"} />}
                      type="submit"
                      disabled={loading || !canEdit}
                    >
                      {loading ? "Updating..." : "Update"}
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
