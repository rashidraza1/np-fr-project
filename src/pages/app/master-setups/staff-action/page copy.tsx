import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jsPDF';
import autoTable from 'jspdf-autotable';

import {
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Toolbar,
  PopoverVirtualElement,
  SelectProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowSpacingParams,
} from "@mui/x-data-grid";

import { DataGridPaginationFullPage } from "@/components/data-grid/data-grid-pagination";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiCols from "@/icons/nexture/ni-cols";
import NiDocumentFull from "@/icons/nexture/ni-document-full";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiSearch from "@/icons/nexture/ni-search";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiCross from "@/icons/nexture/ni-cross";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { cn } from "@/lib/utils";

type Row = {
  id: number;
  sNo: number;
  kioskName: string;
  logType: string;
  staffName: string;
  dateTime: string;
}

const LOG_TYPE_MAP: Record<string, string> = {
  '1': 'Note Filling',
  '2': 'Coin Filling',
  '3': 'Coin Payout',
  '4': 'Empty Payout',
  '5': 'Cash Box Replacement'
};

export default function StaffActionPage() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [isTableVisible, setIsTableVisible] = useState(false);
  const [visibleRows, setVisibleRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // Popup state
  const [detailsPopupOpen, setDetailsPopupOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [inventoryData, setInventoryData] = useState<any>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [filterLogType, setFilterLogType] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_api.php`);
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setStaffList(data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}api/staff_action_api.php?`;
      if (filterLogType) url += `LogType=${filterLogType}&`;
      if (filterStaff) url += `StaffID=${filterStaff}&`;
      if (startDate) url += `StartDate=${startDate.format('YYYY-MM-DD')}&`;
      if (endDate) url += `EndDate=${endDate.format('YYYY-MM-DD')}&`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data) {
        setVisibleRows(data.data.map((item: any, index: number) => ({
          id: item.TableID,
          sNo: index + 1,
          kioskName: item.KioskName,
          logType: String(item.LogType),
          staffName: item.StaffName,
          dateTime: item.DateTime,
        })));
        setIsTableVisible(true);
      } else {
        setVisibleRows([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setVisibleRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterLogType, filterStaff, startDate, endDate]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSearch = () => {
    fetchLogs();
  };

  const handleReset = () => {
    setFilterLogType("");
    setFilterStaff("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleOpenDetails = async (row: Row) => {
    setSelectedRow(row);
    setDetailsPopupOpen(true);
    setLoadingDetails(true);
    setInventoryData({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/staff_action_details_api.php?StaffActionID=${row.id}`);
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setInventoryData(data.inventory);
      } else {
        toast.error(data.message || "Failed to fetch details");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("An error occurred while fetching details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  const columns: GridColDef<Row>[] = [
    { field: "sNo", headerName: "S.No", width: 70 },
    {
      field: "kioskName",
      headerName: "Kiosk Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "logType",
      headerName: "Log Type",
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const type = params.value;
        let color: "primary" | "secondary" | "success" | "error" | "warning" | "info" = "primary";
        if (type === '1' || type === '2') color = "info";
        if (type === '3') color = "success";
        if (type === '4') color = "warning";
        if (type === '5') color = "error";

        return (
          <Button size="tiny" color={color} variant="pastel" className="pointer-events-none self-center">
            {LOG_TYPE_MAP[type] || type}
          </Button>
        );
      },
    },
    {
      field: "staffName",
      headerName: "Staff Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "dateTime",
      headerName: "DateTime",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Details",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box className="flex h-full items-center justify-center">
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleOpenDetails(params.row)}>
              <NiEyeOpen size="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleExportExcel = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const dataToExport = visibleRows.map(row => ({
      "S.No": row.sNo,
      "Kiosk Name": row.kioskName,
      "Log Type": row.logType,
      "Staff Name": row.staffName,
      "DateTime": row.dateTime,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff_Actions");
    XLSX.writeFile(workbook, "Staff_Actions_Report.xlsx");
    toast.success("Excel exported successfully");
  };

  const handleExportPDF = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const doc = new jsPDF();
    const tableColumn = ["S.No", "Kiosk", "Log Type", "Staff", "DateTime"];
    const tableRows = visibleRows.map(row => [
      row.sNo,
      row.kioskName,
      row.logType,
      row.staffName,
      row.dateTime,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Staff Action Report", 14, 15);
    doc.save("Staff_Actions_Report.pdf");
    toast.success("PDF exported successfully");
  };

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
              <ListItemIcon><NiDocumentFull size="medium" /></ListItemIcon>
              <ListItemText>Export PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleExportExcel(); handleCloseExport(); }}>
              <ListItemIcon><NiDocumentChart size="medium" /></ListItemIcon>
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
                  Staff Action
                </Typography>
                <Breadcrumbs>
                  <Link color="inherit" to="/dashboard">
                    Home
                  </Link>
                  <Link color="inherit" to="/pages">
                    Master Setups
                  </Link>
                  <Typography variant="body2">Staff Action</Typography>
                </Breadcrumbs>
              </Grid>
            </Grid>

            <Grid container spacing={5} className="w-full" size={12}>
              <Grid size={12}>
                <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
                  <Typography variant="h6" className="text-text-primary px-2">Staff Action Search</Typography>
                  <Box className="flex w-full flex-row items-center gap-2">
                    <FormControl variant="outlined" size="medium" className="mb-0 w-60">
                      <InputLabel>Log Type</InputLabel>
                      <Select
                        label="Log Type"
                        value={filterLogType}
                        onChange={(e) => setFilterLogType(e.target.value)}
                        IconComponent={NiChevronDownSmall}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="1">Note Filling</MenuItem>
                        <MenuItem value="2">Coin Filling</MenuItem>
                        <MenuItem value="3">Coin Payout</MenuItem>
                        <MenuItem value="4">Empty Payout</MenuItem>
                        <MenuItem value="5">Cash Box Replacement</MenuItem>
                      </Select>
                    </FormControl>

                    <Autocomplete
                      options={staffList}
                      getOptionLabel={(option) => `${option.FullName} (${option.EmpCode})`}
                      value={staffList.find(s => s.id === filterStaff) || null}
                      onChange={(_, newValue) => setFilterStaff(newValue ? newValue.id : "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Staff"
                          variant="outlined"
                          size="medium"
                          className="mb-0 w-60"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />

                    <Box className="flex flex-row items-center gap-1">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          slotProps={{
                            textField: {
                              size: 'medium',
                              sx: { width: 150 }
                            }
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          slotProps={{
                            textField: {
                              size: 'medium',
                              sx: { width: 150 }
                            }
                          }}
                        />
                      </LocalizationProvider>
                      <IconButton onClick={() => { setStartDate(null); setEndDate(null); }} size="small">
                        <NiCross size="medium" className="text-text-disabled" />
                      </IconButton>
                    </Box>

                    <Button
                      size="medium"
                      color="primary"
                      variant="contained"
                      className="w-32 h-[48px]"
                      startIcon={<NiSearch />}
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search"}
                    </Button>

                    {/* <Button
                      size="medium"
                      color="grey"
                      variant="pastel"
                      className="w-32 h-[48px]"
                      startIcon={<NiCross />}
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Reset
                    </Button> */}

                    {visibleRows.length > 0 && (
                      <Box className="flex flex-row items-center gap-2 ml-auto">
                        <Tooltip title="Export to Excel">
                          <Button
                            size="medium"
                            color="error"
                            variant="contained"
                            className="w-25 h-[48px]"
                            startIcon={<NiDocumentChart size={"medium"} />}
                            onClick={handleExportExcel}
                          >
                            Excel
                          </Button>
                        </Tooltip>
                        <Tooltip title="Export to PDF">
                          <Button
                            size="medium"
                            color="warning"
                            variant="contained"
                            className="w-25 h-[48px]"
                            startIcon={<NiDocumentFull size={"medium"} />}
                            onClick={handleExportPDF}
                          >
                            PDF
                          </Button>
                        </Tooltip>
                      </Box>
                    )}
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
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
            hideFooterSelectedRowCount
            showToolbar
          />
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsPopupOpen}
        onClose={() => setDetailsPopupOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-2xl" }}
      >
        <DialogTitle className="flex justify-between items-center pt-2 pb-2">
          <Box className="flex items-center gap-3">
            <Typography variant="h6" className="font-bold">Staff Action Details - {selectedRow?.kioskName}</Typography>
            <Typography variant="caption" className="text-gray-300">|</Typography>
            <Typography variant="caption" className="text-gray-500 font-semibold uppercase">{selectedRow?.staffName}</Typography>
            <Typography variant="caption" className="text-gray-300">|</Typography>
            <Typography variant="caption" className="text-primary font-bold uppercase">
              {LOG_TYPE_MAP[selectedRow?.logType || '']}
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsPopupOpen(false)} size="small">
            <NiCross size="medium" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="bg-gray-50 pt-0">
          {loadingDetails ? (
            <Box className="flex justify-center items-center py-20"><CircularProgress /></Box>
          ) : (
            <Box className="flex flex-col gap-3 pt-3">

              {/* Coin Section (Denomination 1) */}
              {inventoryData[1] && (
                <Box className="flex items-center justify-between p-1 bg-white border border-red-100 rounded-xl shadow-sm">
                  <Box className="flex items-center gap-4 w-1/4">
                    <Box className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={"/images/dhiram/1.png"}
                        alt={"1 AED"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<h6 class="text-gray-400 font-bold">1 AED</h6>`;
                        }}
                      />
                    </Box>
                  </Box>
                  <Box className="flex flex-1 justify-center text-center">
                    <Box>
                      <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">
                        {selectedRow?.logType === '2' ? 'Coins Added' : selectedRow?.logType === '3' ? 'Coins Emptied' : 'Available Coin'}
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800">{inventoryData[1].cashBox}</Typography>
                    </Box>
                  </Box>
                  <Box className="w-1/4 text-right">
                    <Typography variant="caption" className="text-teal-600 font-semibold block uppercase tracking-tight">Total Value</Typography>
                    <Typography variant="h5" className="font-black text-slate-900">Đ {inventoryData[1].amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                </Box>
              )}

              {/* Notes Section */}
              {[5, 10, 20, 50, 100, 200, 500, 1000].map((val) => {
                const denomData = inventoryData[val];
                if (!denomData) return null;

                return (
                  <Box key={val} className="flex items-center justify-between p-1 bg-white border border-red-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <Box className="flex items-center gap-4 w-1/4">
                      <Box className="w-28 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={`/images/dhiram/${val}.png`}
                          alt={`${val} AED`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `<h6 class="text-gray-400 font-bold">${val} AED</h6>`;
                          }}
                        />
                      </Box>
                    </Box>
                    <Box className="flex flex-1 justify-around text-center px-4">
                      {/* Cashbox logic based on logtype */}
                      {selectedRow?.logType === '4' && (
                        <Box>
                          <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Cash Box</Typography>
                          <Typography variant="h6" className="font-bold text-gray-800">{denomData.cashBox}</Typography>
                        </Box>
                      )}
                      {selectedRow?.logType === '5' && (
                        <Box>
                          <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Cashbox Replacement</Typography>
                          <Typography variant="h6" className="font-bold text-gray-800">{denomData.cashBox}</Typography>
                        </Box>
                      )}

                      {selectedRow?.logType !== '5' && selectedRow?.logType !== '4' && (
                        <Box>
                          <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Recycle Count</Typography>
                          <Typography variant="h6" className="font-bold text-gray-800">{denomData.recycleCount}</Typography>
                        </Box>
                      )}
                      {selectedRow?.logType !== '4' && selectedRow?.logType !== '5' && selectedRow?.logType !== '1' && (
                        <Box>
                          <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Total Items</Typography>
                          <Typography variant="h6" className="font-bold text-gray-800">{denomData.totalNote}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box className="w-1/4 text-right">
                      <Typography variant="caption" className="text-teal-600 font-semibold block uppercase tracking-tight">Amount</Typography>
                      <Typography variant="h5" className="font-black text-slate-900">Đ {denomData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                    </Box>
                  </Box>
                );
              })}

              {Object.keys(inventoryData).length === 0 && !loadingDetails && (
                <Box className="flex justify-center items-center py-10">
                  <Typography variant="body1" className="text-gray-500 italic">No inventory records found for this action.</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        {!loadingDetails && Object.keys(inventoryData).length > 0 && String(selectedRow?.logType) !== '2' && String(selectedRow?.logType) !== '3' && (
          <Box className="bg-black text-white p-6 flex justify-between items-center pt-2 pb-2">
            <Typography variant="h5" className="font-bold">Grand Total</Typography>
            <Box className="flex flex-1 justify-around text-center px-10">
              {selectedRow?.logType === '4' && (
                <Box>
                  <Typography variant="caption" className="text-gray-400 block">Total Cashbox</Typography>
                  <Typography variant="body1" className="font-bold">
                    {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + (curr.cashBox || 0), 0)}
                  </Typography>
                </Box>
              )}
              {selectedRow?.logType === '5' && (
                <Box>
                  <Typography variant="caption" className="text-gray-400 block">Total Cashbox Replacement</Typography>
                  <Typography variant="body1" className="font-bold">
                    {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + (curr.cashBox || 0), 0)}
                  </Typography>
                </Box>
              )}
              {selectedRow?.logType !== '5' && selectedRow?.logType !== '4' && (
                <Box>
                  <Typography variant="caption" className="text-gray-400 block">Total Recycle</Typography>
                  <Typography variant="body1" className="font-bold">
                    {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + (curr.recycleCount || 0), 0)}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" className="text-gray-400 block">Total Items</Typography>
                <Typography variant="body1" className="font-bold">
                  {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + (curr.totalNote || 0), 0)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" className="font-black text-green-500">
              Đ {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + (curr.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        )}

      </Dialog>
    </Grid>
  );
}
