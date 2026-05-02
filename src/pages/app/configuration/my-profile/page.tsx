import { useFormik } from "formik";
import { useEffect, useState } from "react";
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

export default function MyProfilePage() {
  const { canEdit } = usePermission("My Profile");
  const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const validationSchema = yup.object({
    fullName: yup.string().required("Full Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    mobile: yup.string().required("Mobile Number is required"),
    fax: yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobile: "",
      fax: "",
      gender: "",
      role: "",
      branch: "",
      department: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const freshPermissions = await fetchMenuPermissions();
      const modulePermissions: any = getFeaturePermissions("My Profile", freshPermissions);
      const canEditFresh = modulePermissions?.EditPermission === 1;

      if (!canEditFresh) {
        toast.error("You do not have permission to update profile.");
        return;
      }

      if (!profileData) {
        toast.error("Profile data not loaded.");
        return;
      }

      setLoading(true);
      try {
        const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
        const userId = localStorage.getItem(`${storagePrefix}:userId`) || "10000";

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=AddEditRSIGeneralSystemUser&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
          {
            method: "POST",
            body: JSON.stringify({
              Trigger: "edit",
              TableID: userId,
              Email: values.email,
              FullNameEnglish: values.fullName,
              FullNameArabic: profileData.FullNameArabic, // Preserve existing
              RoleID: profileData.RoleID,
              BranchID: profileData.BranchID,
              DepartmentID: profileData.DepartmentID,
              IsMale: profileData.IsMale,
              ContactNumber: values.mobile,
              IsActive: profileData.IsActive,
              UserID: userId,
            }),
          }
        );

        const data = await response.json();

        if (data.status === "SUCCESS") {
          toast.success(data.message || "Profile updated successfully");
        } else {
          toast.error(data.message || "Failed to update profile");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("An error occurred while updating profile.");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
        const userId = localStorage.getItem(`${storagePrefix}:userId`) || "10000"; // Defaulting to 10000 as per user example

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralSystemUsers&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
          {
            method: "POST",
            body: JSON.stringify({
              TableID: userId,
            }),
          }
        );
        const data = await response.json();

        if (data.status === "SUCCESS" && data.data && data.data.RecordListing && data.data.RecordListing.length > 0) {
          const record = data.data.RecordListing[0];
          setProfileData(record);
          formik.setValues({
            fullName: record.FullNameEnglish || "",
            email: record.Email || "",
            mobile: record.ContactNumber || "",
            fax: "", // API doesn't seem to return Fax in the example, leaving empty
            gender: record.Gender || "",
            role: record.RoleTitleEnglish || "",
            branch: record.BranchTitleEnglish || "",
            department: record.DepartmentTitleEnglish || "",
          });
        } else {
          toast.error(data.message || "Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("An error occurred while fetching profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <ToastContainer />
      <Grid container spacing={2.5} className="w-full" size={12}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            My Profile
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" to="/dashboard">
              Home
            </Link>
            <Link color="inherit" to="/configuration">
              Configuration
            </Link>
            <Typography variant="body2">My Profile</Typography>
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
                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <FormLabel component="label">
                        Full Name
                      </FormLabel>
                      <Input
                        placeholder="Full Name"
                        id="fullName"
                        name="fullName"
                        value={formik.values.fullName}
                        readOnly
                        disabled
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
                        Email
                      </FormLabel>
                      <Input
                        placeholder="Email"
                        id="email"
                        name="email"
                        value={formik.values.email}
                        readOnly
                        disabled
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
                      error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                    >
                      <FormLabel component="label">
                        Contact Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input
                        placeholder="Contact Number"
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

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl
                      className="outlined"
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <FormLabel component="label">
                        Gender
                      </FormLabel>
                      <Input
                        placeholder="Gender"
                        id="gender"
                        name="gender"
                        value={formik.values.gender}
                        readOnly
                        disabled
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
                        Role
                      </FormLabel>
                      <Input
                        readOnly
                        disabled
                        value={formik.values.role}
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
                        Branch
                      </FormLabel>
                      <Input
                        readOnly
                        disabled
                        value={formik.values.branch}
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
                        Department
                      </FormLabel>
                      <Input
                        readOnly
                        disabled
                        value={formik.values.department}
                        className="bg-gray-100"
                        disableUnderline
                      />
                    </FormControl>
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
                      Update
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
