import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reshapeArabic } from "@/utils/arabic-reshaper";
import { arabicFontBase64 } from "@/utils/arabic-font";

import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  FilledInput,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  PopoverVirtualElement,
  Select,
  SelectProps,
  TextField,
  Tooltip,
  Typography,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowSpacingParams,
  GridRowId,
} from "@mui/x-data-grid";

import { DataGridPaginationFullPage } from "@/components/data-grid/data-grid-pagination";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiDocumentFull from "@/icons/nexture/ni-document-full";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import NiShieldCheck from "@/icons/nexture/ni-shield-check";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiMinusSquare from "@/icons/nexture/ni-minus-square";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import NiPlus from "@/icons/nexture/ni-plus";
import NiSearch from "@/icons/nexture/ni-search";
import NiDuplicate from "@/icons/nexture/ni-duplicate";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { useLayoutContext } from "@/components/layout/layout-context";

const initialRows = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    mobile: "1234567890",
    branch: "Main Branch",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    mobile: "9876543210",
    branch: "Downtown Branch",
    role: "Manager",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    mobile: "5551234567",
    branch: "Main Branch",
    role: "User",
    status: "Inactive",
  },
];

type Row = (typeof initialRows)[number] & { fullData?: any };

export default function Page() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>(),
  });

  const navigate = useNavigate();

  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterRole, setFilterRole] = useState<any | null>(null);
  const [filterBranch, setFilterBranch] = useState<any | null>(null);

  const [visibleRows, setVisibleRows] = useState<Row[]>([]);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  const [rolesOptions, setRolesOptions] = useState<any[]>([]);
  const [branchesOptions, setBranchesOptions] = useState<any[]>([]);
  const [departmentsOptions, setDepartmentsOptions] = useState<any[]>([]);

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [loading, setLoading] = useState(false);

  const { canAdd, canEdit, canDelete } = usePermission("System Users");

  interface SystemUserItems {
    TableID: string;
    RoleID: string;
    BranchID: string;
    DepartmentID: string;
    Email: string;
    FullNameEnglish: string;
    FullNameArabic: string;
    ProfileImage: string;
    IsMale: string;
    Gender: string;
    ContactNumber: string;
    IsActive: string;
    LastLoginIP: string;
    LastLoginDateTime: string;
    CreationDateTime: string | null;
    RoleTitleEnglish: string;
    RoleTitleArabic: string;
    BranchTitleEnglish: string;
    BranchTitleArabic: string;
    DepartmentTitleEnglish: string;
    DepartmentTitleArabic: string;
  }

  interface HelperApiResponse {
    status: string;
    code: number;
    data: {
      RecordListing: SystemUserItems[];
    };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const fetchRolesOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralRoles&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({ IsActive: "1" }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data?.RecordListing) {
        setRolesOptions(data.data.RecordListing);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, []);

  const fetchBranchesOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralMasterList&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({ MasterType: 1, IsActive: "1" }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data?.RecordListing) {
        setBranchesOptions(Array.isArray(data.data.RecordListing) ? data.data.RecordListing : [data.data.RecordListing]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, []);

  const fetchDepartmentsOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralMasterList&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({ MasterType: 2, IsActive: "1" }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data?.RecordListing) {
        setDepartmentsOptions(Array.isArray(data.data.RecordListing) ? data.data.RecordListing : [data.data.RecordListing]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }, []);

  useEffect(() => {
    fetchRolesOptions();
    fetchBranchesOptions();
    fetchDepartmentsOptions();
  }, [fetchRolesOptions, fetchBranchesOptions, fetchDepartmentsOptions]);

  const fetchSystemUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralSystemUsers&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            Name: filterSearch,
            Email: "",
            RoleID: filterRole?.TableID || "",
            BranchID: filterBranch?.TableID || "",
            DepartmentID: "",
            IsActive: filterStatus === "Active" ? "1" : filterStatus === "Inactive" ? "0" : "",
          }),
        },
      );
      const data: HelperApiResponse = await response.json();
      if (data.status === "SUCCESS" && data.code === 200) {
        const mappedRows = data.data.RecordListing.map((item) => ({
          id: Number(item.TableID),
          name: item.FullNameEnglish,
          email: item.Email,
          mobile: item.ContactNumber,
          branch: item.BranchTitleEnglish,
          role: item.RoleTitleEnglish,
          status: item.IsActive === "1" ? "Active" : "Inactive",
          fullData: item,
        }));
        setVisibleRows(mappedRows);
        setIsTableVisible(true);
      } else {
        setVisibleRows([]);
      }
    } catch (error) {
      console.error("Error fetching system users:", error);
      setVisibleRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterSearch, filterStatus, filterRole, filterBranch]);

  // useEffect(() => {
  //   fetchSystemUsers();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // Initial load

  const handleSearch = () => {
    fetchSystemUsers();
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    const freshPermissions = await fetchMenuPermissions();
    const modulePermissions: any = getFeaturePermissions("System Users", freshPermissions);
    const canDeleteFresh = modulePermissions?.DeletePermission === 1;

    if (!canDeleteFresh) {
      toast.error("You do not have permission to delete system users.");
      setDeleteDialogOpen(false);
      return;
    }

    setLoading(true);
    try {
      const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
      const userId = localStorage.getItem(`${storagePrefix}:userId`) || 1;

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=DeleteRSIGeneralSystemUser&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            UserID: userId,
            TableID: String(userToDelete),
          }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS") {
        toast.success("User deleted successfully");
        fetchSystemUsers();
        await fetchMenuPermissions(); // Refresh state for menu consistency
      } else {
        toast.error(data.message || "Failed to delete user");
        await fetchMenuPermissions();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleExportExcel = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = visibleRows.map(row => ({
      "Full Name": row.name,
      "Full Name Arabic": row.fullData?.FullNameArabic || "",
      "Branch": row.branch,
      "Role": row.role,
      "Status": row.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "System Users");

    XLSX.writeFile(workbook, "System_Users_List.xlsx", { bookType: 'xlsx', type: 'binary' });
    toast.success("Excel file downloaded successfully");
  };

  const handleExportPDF = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const doc = new jsPDF();
    let isFontLoaded = false;

    // Add the custom Arabic font to the VFS
    try {
      if (arabicFontBase64 && !arabicFontBase64.includes("PLACEHOLDER")) {
        doc.addFileToVFS("ArabicFont.ttf", arabicFontBase64);
        doc.addFont("ArabicFont.ttf", "ArabicFont", "normal");
        isFontLoaded = true;
      }
    } catch (e) {
      console.warn("Could not load custom Arabic font, using fallback.", e);
      isFontLoaded = false;
    }

    const tableColumn = ["Full Name", "Full Name (Arabic)", "Branch", "Role", "Status"];
    const tableRows = visibleRows.map(row => [
      row.name,
      reshapeArabic(row.fullData?.FullNameArabic || ""),
      row.branch,
      row.role,
      row.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        font: isFontLoaded ? "ArabicFont" : "helvetica",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        fontStyle: isFontLoaded ? 'normal' : 'bold',
        textColor: [0, 0, 0]
      },
      didParseCell: (data) => {
        // Right align the Arabic column (index 1)
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        } else {
          data.cell.styles.halign = 'left';
        }
      }
    });

    if (isFontLoaded) {
      doc.setFont("ArabicFont");
    }

    doc.text("System Users List", 14, 15);
    doc.save("System_Users_List.pdf");
    toast.success("PDF file downloaded successfully");
  };

  const columns: GridColDef<(typeof initialRows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false, align: "center", headerAlign: "center" },
    {
      field: "name",
      headerName: "Full Name",
      flex: 1,
      minWidth: 150,
      align: "left",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center justify-start w-full">
          <Typography variant="body2" className="text-text-primary text-left">
            {params.value}
          </Typography>
        </Box>
      ),
    },

    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      minWidth: 120,
      align: "left",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center justify-start w-full">
          <Typography variant="body2" className="text-text-primary text-left">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 100,
      align: "left",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center justify-start w-full">
          <Typography variant="body2" className="text-text-primary text-left">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      align: "center",
      headerAlign: "center",
      width: 100,
      type: "singleSelect",
      valueOptions: ["Active", "Inactive"],
      renderCell: (params: GridRenderCellParams<any, string>) => {
        const value = params.value;
        if (value === "Active") {
          return (
            <Button
              className="pointer-events-none self-center"
              size="tiny"
              color="success"
              variant="pastel"
              startIcon={<NiCheckSquare size={"tiny"} />}
            >
              {value}
            </Button>
          );
        } else {
          return (
            <Button
              className="pointer-events-none self-center"
              size="tiny"
              color="grey"
              variant="pastel"
              startIcon={<NiMinusSquare size={"tiny"} />}
            >
              {value}
            </Button>
          );
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 80,
      align: "center",
      headerAlign: "center",
      getActions: (params) => {
        const actions = [];

        if (canEdit) {
          actions.push(
            <GridActionsCellItem
              key={1}
              icon={<NiPenSquare size="medium" />}
              label="Edit"
              showInMenu
              onClick={() => navigate(`/administration/system-users/edit/${params.id}`)}
            />
          );
          actions.push(
            <GridActionsCellItem
              key={2}
              icon={<NiShieldCheck size="medium" />}
              label="Permission"
              showInMenu
              onClick={() => navigate(`/administration/system-users/permissions/${params.id}`)}
            />
          );
        }

        if (canDelete) {
          actions.push(
            <GridActionsCellItem
              key={0}
              icon={<NiCrossSquare size="medium" />}
              label="Delete"
              showInMenu
              onClick={() => confirmDelete(params.id)}
            />
          );
        }

        return actions;
      },
    },
  ];

  function TableToolbar() {
    const [anchorElExport, setAnchorElExport] = useState<EventTarget | Element | PopoverVirtualElement | null>(null);
    const openExport = Boolean(anchorElExport);
    const handleClickExport = (event: Event | SyntheticEvent) => {
      setAnchorElExport(event.currentTarget);
    };
    const handleCloseExport = () => {
      setAnchorElExport(null);
    };

    const [anchorElSelection, setAnchorElSelection] = useState<EventTarget | Element | PopoverVirtualElement | null>(
      null,
    );
    const openSelection = Boolean(anchorElSelection);
    const handleClickSelection = (event: Event | SyntheticEvent) => {
      setAnchorElSelection(event.currentTarget);
    };
    const handleCloseSelection = () => {
      setAnchorElSelection(null);
    };

    return (
      <Toolbar className="min-h-auto border-none">
        <Box className="flex w-full flex-row items-center justify-end gap-2">
          {rowSelectionModel.ids.size > 0 && (
            <>
              <Tooltip title="Selection">
                <Button
                  className="surface-standard"
                  size="medium"
                  color="grey"
                  variant="surface"
                  onClick={handleClickSelection}
                  endIcon={
                    <NiChevronRightSmall
                      size={"medium"}
                      className={cn("transition-transform rtl:rotate-180", openSelection && "rotate-90 rtl:rotate-90")}
                    />
                  }
                >
                  {rowSelectionModel.ids.size > 1
                    ? rowSelectionModel.ids.size + " Items"
                    : rowSelectionModel.ids.size + " Item"}
                </Button>
              </Tooltip>

              <Menu
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                anchorEl={anchorElSelection as Element}
                open={openSelection}
                onClose={handleCloseSelection}
                className="mt-1"
              >
                <MenuItem
                  onClick={() => {
                    handleCloseSelection();
                  }}
                >
                  <ListItemIcon>
                    <NiPenSquare size="medium" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseSelection();
                  }}
                >
                  <ListItemIcon>
                    <NiDuplicate size="medium" />
                  </ListItemIcon>
                  <ListItemText>Duplicate</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseSelection();
                    const selectionCount = rowSelectionModel.ids.size;

                    if (selectionCount === 1) {
                      const id = Array.from(rowSelectionModel.ids)[0];
                      confirmDelete(id);
                    } else {
                      // TODO: Implement bulk delete
                      toast.info("Bulk delete not implemented yet. Please select one user.");
                    }
                  }}
                >
                  <ListItemIcon>
                    <NiCrossSquare size="medium" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}

          <Tooltip title="Columns">
            <ColumnsPanelTrigger
              render={(props) => (
                <Button
                  {...props}
                  className="icon-only surface-standard"
                  size="medium"
                  color="grey"
                  variant="surface"
                >
                  <NiCols size={"medium"} />
                </Button>
              )}
            />
          </Tooltip>

          <Tooltip title="Export">
            <Button
              className="icon-only surface-standard"
              size="medium"
              color="grey"
              variant="surface"
              startIcon={<NiArrowInDown size={"medium"} />}
              onClick={handleClickExport}
            />
          </Tooltip>

          <Menu
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            anchorEl={anchorElExport as Element}
            open={openExport}
            onClose={handleCloseExport}
            className="mt-1"
          >
            <MenuItem onClick={() => { handleExportPDF(); handleCloseExport(); }}>
              <ListItemIcon>
                <NiDocumentFull size="medium" />
              </ListItemIcon>
              <ListItemText>Export PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleExportExcel(); handleCloseExport(); }}>
              <ListItemIcon>
                <NiDocumentChart size="medium" />
              </ListItemIcon>
              <ListItemText>Export Excel</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    );
  }

  return (
    <Grid container spacing={5}>
      <ToastContainer />
      <Grid size={12}>
        <Toolbar className="min-h-auto border-none p-0!">
          <Grid container spacing={5} className="mb-4 w-full">
            <Grid container spacing={2.5} className="w-full" size={12}>
              <Grid size={{ xs: 12, md: "grow" }}>
                <Typography variant="h1" component="h1" className="mb-0">
                  System Users
                </Typography>
                <Breadcrumbs>
                  <Link color="inherit" to="/dashboard">
                    Home
                  </Link>
                  <Link color="inherit" to="/pages">
                    Administration
                  </Link>
                  <Typography variant="body2">System Users</Typography>
                </Breadcrumbs>
              </Grid>

              <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
                {canAdd && (
                  <Tooltip title="Add Item">
                    <Button
                      component={Link}
                      to="/administration/system-users/create"
                      className="surface-standard"
                      size="medium"
                      color="grey"
                      variant="surface"
                      startIcon={<NiPlus size={"medium"} />}
                    >
                      Add New Record
                    </Button>
                  </Tooltip>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={5} className="w-full" size={12}>
              <Grid size={12}>
                <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
                  <Typography variant="h6" className="text-text-primary px-2">Name</Typography>
                  <Grid container spacing={2} className="w-full">
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl variant="outlined" size="medium" className="mb-0 w-full">
                        <InputLabel>Name</InputLabel>
                        <FilledInput
                          disableUnderline
                          className="bg-transparent"
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          endAdornment={
                            <>
                              <InputAdornment position="end" className={cn(filterSearch === "" && "hidden")}>
                                <IconButton edge="end" onClick={() => setFilterSearch("")}>
                                  <NiCross size="medium" className="text-text-disabled" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl variant="outlined" size="medium" className="mb-0 w-full">
                        <Autocomplete
                          options={rolesOptions}
                          getOptionLabel={(option) => option.TitleEnglish || ""}
                          value={filterRole}
                          onChange={(_, newValue) => setFilterRole(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Role"
                              variant="filled"
                              InputProps={{ ...params.InputProps, disableUnderline: true, className: "bg-transparent" }}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl variant="outlined" size="medium" className="mb-0 w-full">
                        <Autocomplete
                          options={branchesOptions}
                          getOptionLabel={(option) => option.TitleEnglish || ""}
                          value={filterBranch}
                          onChange={(_, newValue) => setFilterBranch(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Branch"
                              variant="filled"
                              InputProps={{ ...params.InputProps, disableUnderline: true, className: "bg-transparent" }}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl variant="outlined" size="medium" className="mb-0 w-full">
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, lg: "grow" }} className="flex flex-row items-end justify-end gap-2 flex-wrap px-2">
                      <Button
                        size="medium"
                        color="primary"
                        variant="contained"
                        className="w-44 h-[48px]"
                        startIcon={<NiSearch />}
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                      {visibleRows.length > 0 && (
                        <>
                          <Tooltip title="Export to Excel">
                            <Button
                              size="medium"
                              color="error"
                              variant="contained"
                              className="w-44 h-[48px]"
                              startIcon={<NiDocumentChart size={"medium"} />}
                              onClick={handleExportExcel}
                            >
                              Export Excel
                            </Button>
                          </Tooltip>
                          <Tooltip title="Export to PDF">
                            <Button
                              size="medium"
                              color="warning"
                              variant="contained"
                              className="w-44 h-[48px]"
                              startIcon={<NiDocumentFull size={"medium"} />}
                              onClick={handleExportPDF}
                            >
                              Export PDF
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </Grid>
      {isTableVisible && (
        <Grid size={12}>
          <DataGrid
            rows={visibleRows}
            columns={columns}
            initialState={{
              columns: { columnVisibilityModel: { id: false } },
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            getRowSpacing={getRowSpacing}
            rowHeight={68}
            columnHeaderHeight={32}
            checkboxSelection
            disableRowSelectionOnClick
            pageSizeOptions={[10]}
            className="full-page border-none"
            pagination
            slotProps={{
              panel: {
                className: "mt-1!",
              },
              main: {
                className: "min-h-[815px]! overflow-visible",
              },
            }}
            slots={{
              basePagination: DataGridPaginationFullPage,
              columnSortedDescendingIcon: () => {
                return <NiArrowDown size={"small"}></NiArrowDown>;
              },
              columnSortedAscendingIcon: () => {
                return <NiArrowUp size={"small"}></NiArrowUp>;
              },
              columnFilteredIcon: () => {
                return <NiFilterPlus size={"small"}></NiFilterPlus>;
              },
              columnReorderIcon: () => {
                return <NiChevronLeftRightSmall size={"small"}></NiChevronLeftRightSmall>;
              },
              columnMenuIcon: () => {
                return <NiEllipsisVertical size={"small"}></NiEllipsisVertical>;
              },
              columnMenuSortAscendingIcon: NiArrowUp,
              columnMenuSortDescendingIcon: NiArrowDown,
              columnMenuFilterIcon: NiFilter,
              columnMenuHideIcon: NiEyeInactive,
              columnMenuClearIcon: NiCross,
              columnMenuManageColumnsIcon: NiCols,
              filterPanelDeleteIcon: NiCross,
              filterPanelRemoveAllIcon: NiBinEmpty,
              baseSelect: (props: any) => {
                const propsCasted = props as SelectProps;
                return (
                  <FormControl size="small" variant="outlined">
                    <InputLabel>{props.label}</InputLabel>
                    <Select
                      {...propsCasted}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                    />
                  </FormControl>
                );
              },
              quickFilterIcon: () => {
                return <NiSearch size={"medium"} />;
              },
              quickFilterClearIcon: () => {
                return <NiCross size={"medium"} />;
              },
              baseButton: (props) => {
                return <Button {...props} variant="pastel" color="grey"></Button>;
              },
              moreActionsIcon: () => {
                return <NiEllipsisVertical size={"medium"} />;
              },
              toolbar: TableToolbar,
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) => {
              setRowSelectionModel(newModel);
            }}
            hideFooterSelectedRowCount
            showToolbar
          />
        </Grid>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle id="alert-dialog-title" className="pt-6 px-6">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent className="px-6">
          <DialogContentText id="alert-dialog-description" className="text-text-secondary">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-6 pt-2">
          <Button onClick={handleCloseDeleteDialog} color="grey" variant="surface" className="surface-standard">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus disabled={loading || !canDelete}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
