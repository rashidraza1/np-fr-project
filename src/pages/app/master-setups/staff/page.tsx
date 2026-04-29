import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
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
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiMinusSquare from "@/icons/nexture/ni-minus-square";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import NiPlus from "@/icons/nexture/ni-plus";
import NiSearch from "@/icons/nexture/ni-search";
import NiDuplicate from "@/icons/nexture/ni-duplicate";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  fullName: string;
  email: string;
  empCode: string;
  pin: string;
  status: string;
}

export default function Page() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const navigate = useNavigate();

  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [visibleRows, setVisibleRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      // Using VITE_API_URL from .env which points to c:\xampp\htdocs\np-api\
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_api.php?search=${encodeURIComponent(filterSearch)}&status=${filterStatus}`);
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data) {
        setVisibleRows(data.data.map((item: any) => ({
          id: item.id || item.TableID,
          fullName: item.FullName,
          email: item.Email,
          empCode: item.EmpCode,
          pin: item.PIN,
          lastLoginDateTime: item.last_login_date || '',
          status: item.Status === "1" || item.Status === 1 ? "Active" : "Inactive",
        })));
        setIsTableVisible(true);
      } else {
        setVisibleRows([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setVisibleRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterSearch, filterStatus]);

  const handleSearch = () => {
    fetchStaff();
  };

  const handleExportExcel = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = visibleRows.map(row => ({
      "Full Name": row.fullName,
      "Email": row.email,
      "Staff ID": row.empCode,
      "Status": row.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");

    XLSX.writeFile(workbook, "Staff_List.xlsx", { bookType: 'xlsx', type: 'binary' });
    toast.success("Excel file downloaded successfully");
  };

  const handleExportPDF = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["Full Name", "Email", "Staff ID", "Status"];
    const tableRows = visibleRows.map(row => [
      row.fullName,
      row.email,
      row.empCode,
      row.status,

    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.text("Staff List", 14, 15);
    doc.save("Staff_List.pdf");
    toast.success("PDF file downloaded successfully");
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setStaffToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_api.php?id=${staffToDelete}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.status === "SUCCESS") {
        toast.success("Staff deleted successfully");
        fetchStaff();
      } else {
        toast.error(data.message || "Failed to delete staff");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const columns: GridColDef<Row>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false, hideable: true },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "empCode",
      headerName: "Login ID",
      width: 150,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: "pin",
    //   headerName: "Login Pin",
    //   width: 150,
    //   renderCell: (params: GridRenderCellParams<any, string>) => (
    //     <Box className="flex h-full items-center">
    //       <Typography variant="body2" className="text-text-primary">
    //         ******
    //       </Typography>
    //     </Box>
    //   ),
    // },

    {
      field: "lastLoginDateTime",
      headerName: "Last Login date and Time",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      align: "left",
      headerAlign: "left",
      width: 120,
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
              Active
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
              Inactive
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
      align: "right",
      headerAlign: "right",
      getActions: (params) => {
        const actions = [];
        actions.push(
          <GridActionsCellItem
            key={1}
            icon={<NiPenSquare size="medium" />}
            label="Edit"
            showInMenu
            onClick={() => navigate(`/master-setups/staff/edit/${params.id}`, { state: params.row })}
          />
        );
        // actions.push(
        //   <GridActionsCellItem
        //     key={0}
        //     icon={<NiCrossSquare size="medium" />}
        //     label="Delete"
        //     showInMenu
        //     onClick={() => confirmDelete(params.id as string)}
        //   />
        // );
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

    return (
      <Toolbar className="min-h-auto border-none">
        <Box className="flex w-full flex-row items-center justify-end gap-2">
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
                  Staff Registration
                </Typography>
                <Breadcrumbs>
                  <Link color="inherit" to="/dashboard">
                    Home
                  </Link>
                  <Link color="inherit" to="/pages">
                    Master Setups
                  </Link>
                  <Typography variant="body2">Staff</Typography>
                </Breadcrumbs>
              </Grid>

              <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
                <Tooltip title="Add Item">
                  <Button
                    component={Link}
                    to="/master-setups/staff/create"
                    className="surface-standard"
                    size="medium"
                    color="grey"
                    variant="surface"
                    startIcon={<NiPlus size={"medium"} />}
                  >
                    Add New Staff
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid container spacing={5} className="w-full" size={12}>
              <Grid size={12}>
                <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
                  <Typography variant="h6" className="text-text-primary px-2">Staff Search</Typography>
                  <Box className="flex w-full flex-row items-center gap-2">
                    <FormControl variant="outlined" size="medium" className="mb-0 w-80">
                      <InputLabel>Search Name/Email</InputLabel>
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

                    <FormControl variant="outlined" size="medium" className="mb-0 w-80">
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="1">Active</MenuItem>
                        <MenuItem value="0">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      size="medium"
                      color="primary"
                      variant="contained"
                      className="w-36 h-[48px]"
                      startIcon={<NiSearch />}
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </Box>
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
            loading={loading}
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
            checkboxSelection={false}
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
              columnSortedDescendingIcon: () => <NiArrowDown size={"small"} />,
              columnSortedAscendingIcon: () => <NiArrowUp size={"small"} />,
              columnFilteredIcon: () => <NiFilterPlus size={"small"} />,
              columnReorderIcon: () => <NiChevronLeftRightSmall size={"small"} />,
              columnMenuIcon: () => <NiEllipsisVertical size={"small"} />,
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
              quickFilterIcon: () => <NiSearch size={"medium"} />,
              quickFilterClearIcon: () => <NiCross size={"medium"} />,
              baseButton: (props) => <Button {...props} variant="pastel" color="grey" />,
              moreActionsIcon: () => <NiEllipsisVertical size={"medium"} />,
              toolbar: TableToolbar,
            }}
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
            Are you sure you want to delete this staff member? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-6 pt-2">
          <Button onClick={handleCloseDeleteDialog} color="grey" variant="surface" className="surface-standard">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
