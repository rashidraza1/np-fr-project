import { SyntheticEvent, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { arabicFontBase64 } from "@/utils/arabic-font";

import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Toolbar,
  Divider,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  PopoverVirtualElement,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowSpacingParams,
  GridPagination,
} from "@mui/x-data-grid";

import { DataGridPaginationFullPage } from "@/components/data-grid/data-grid-pagination";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiDocumentFull from "@/icons/nexture/ni-document-full";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiSearch from "@/icons/nexture/ni-search";
import NiPrinter from "@/icons/nexture/ni-printer";
import { usePermission } from "@/hooks/use-permission";
//import { cn } from "@/lib/utils";

// Interfaces for API response
interface SalesOrder {
  SalesOrderNumber: string;
  CompanyName: string;
  AmountDue: number;
}

interface Payment {
  PaymentTypeText: string;
  PaymentType: number;
  AmountPaid: number;
  SourceID?: string;
  ReceiptNumber?: string;
  TransactionDate?: string;
  CardInformation?: {
    cardNumber?: string;
    authCode?: string;
    ReceiptNo?: string;
    resultCodeDescription?: string;
    type?: string;
    cardType?: string;
    [key: string]: any;
  };
}

interface MasterRecord {
  TableID: string;
  TitleEnglish: string;
}

interface CashItem {
  SNo: number;
  Currency: string;
  Count: number;
  Amount: string | number;
}

interface CashSummary {
  TotalCount: number;
  TotalAmount: string;
}

interface TransactionRow {
  id: number;
  TableID: number;
  TransactionDate: string;
  TransactionReferenceNumber: string;
  MobileNumber: string;
  PaymentType: number;
  PaymentTypeText: string;
  CompanyName: string;
  BranchEnglish: string;
  KioskEnglish: string;
  TotalAmountDue: number;
  BalanceAmount?: number;
  TotalPaymentReceived?: number;
  salesOrders: SalesOrder[];
  payments: Payment[];
  cash_transactions?: CashItem[];
  cash_summary?: CashSummary;
  cash_payout?: CashItem[];
  cash_payout_summary?: CashSummary;
}

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const day = d.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${day}${getOrdinal(day)} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

export default function CompletedTransactionReportPage() {
  const canRead = true; // usePermission("Transaction List");

  const [visibleRows, setVisibleRows] = useState<TransactionRow[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search form state
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [paymentType, setPaymentType] = useState("3"); // Default to 'Both' (3)
  const [companyName, setCompanyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);

  // Cash Sections state
  const [cashTransactions, setCashTransactions] = useState<Record<number, number>>({});
  const [cashPayouts, setCashPayouts] = useState<Record<number, number>>({});

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  useEffect(() => {
    // Master data fetching removed
  }, []);



  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: params.isLastVisible ? 0 : 5,
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=report&action=PaymentListing&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            FromDate: fromDate ? fromDate.format("YYYY-MM-DD") : "",
            ToDate: toDate ? toDate.format("YYYY-MM-DD") : "",
            MobileNumber: mobileNumber,
            PaymentType: paymentType === "3" ? "" : paymentType,
            CompanyName: companyName,
            BranchID: "",
            KioskID: "",
            TableID: "",
            Status: "2"
          }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data && data.data.RecordListing) {
        const listing = Array.isArray(data.data.RecordListing) ? data.data.RecordListing : [data.data.RecordListing];
        const mappedRows = listing.map((item: any) => ({
          ...item,
          id: item.TableID, // DataGrid requires an 'id' field
          TotalAmountDue: typeof item.TotalAmountDue === 'string'
            ? parseFloat(item.TotalAmountDue.replace(/,/g, ''))
            : (Number(item.TotalAmountDue) || 0),
          BalanceAmount: typeof item.BalanceAmount === 'string'
            ? parseFloat(item.BalanceAmount.replace(/,/g, ''))
            : (Number(item.BalanceAmount) || 0),
          TotalPaymentReceived: typeof item.TotalPaid === 'string'
            ? parseFloat(item.TotalPaid.replace(/,/g, ''))
            : (Number(item.TotalPaid) || 0)
        }));
        setVisibleRows(mappedRows);
        setIsTableVisible(true);
      } else {
        setVisibleRows([]);
        toast.info("No records found matching your search.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions. Please try again.");
      setVisibleRows([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, mobileNumber, paymentType, companyName]);

  const handleSearch = () => {
    fetchTransactions();
  };

  const handleViewDetails = (id: number) => {
    const transaction = visibleRows.find((row) => row.id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTransaction(null);
  };

  const handleExportExcel = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = visibleRows.map((row, index) => ({
      "S.No.": index + 1,
      "Transaction date": formatDateTime(row.TransactionDate),
      "Transaction No.": row.TransactionReferenceNumber,
      "Payment Type": row.PaymentTypeText,
      "Status": row.Status == 1 || row.Status == "1" ? "Partial" : row.Status == 2 || row.Status == "2" ? "Completed" : row.Status || "",
      "Company name": row.CompanyName,
      "Mobile Number": row.MobileNumber,
      "Total Amount Due": `AED ${row.TotalAmountDue}`,
      "Total payment received": `AED ${row.TotalPaymentReceived || 0}`,
      "Balance Amount": `AED ${row.BalanceAmount || 0}`,
    }));

    // Add Grand Total row
    const totalAmount = visibleRows.reduce((sum, row) => sum + row.TotalAmountDue, 0).toFixed(2);
    const totalReceived = visibleRows.reduce((sum, row) => sum + (row.TotalPaymentReceived || 0), 0).toFixed(2);
    const totalBalance = visibleRows.reduce((sum, row) => sum + (row.BalanceAmount || 0), 0).toFixed(2);
    dataToExport.push({
      "S.No.": "",
      "Transaction date": "",
      "Transaction No.": "",
      "Payment Type": "",
      "Status": "",
      "Company name": "",
      "Mobile Number": "Grand Total:",
      "Total Amount Due": `AED ${totalAmount}`,
      "Total payment received": `AED ${totalReceived}`,
      "Balance Amount": `AED ${totalBalance}`,
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "Transactions_List.xlsx", { bookType: 'xlsx', type: 'binary' });
    toast.success("Excel file downloaded successfully");
  };

  const handleExportPDF = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const doc = new jsPDF();
    let isFontLoaded = false;

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

    const tableColumn = ["S.No.", "Transaction date", "Transaction No.", "Payment Type", "Company name", "Mobile Number", "Total Amount Due", "Total payment received", "Balance Amount"];
    const tableRows = visibleRows.map((row, index) => [
      index + 1,
      formatDateTime(row.TransactionDate),
      row.TransactionReferenceNumber,
      row.PaymentTypeText,
      row.CompanyName,
      row.MobileNumber,
      `AED ${row.TotalAmountDue}`,
      `AED ${row.TotalPaymentReceived || 0}`,
      `AED ${row.BalanceAmount || 0}`
    ]);

    const totalAmount = visibleRows.reduce((sum, row) => sum + row.TotalAmountDue, 0).toFixed(2);
    const totalReceived = visibleRows.reduce((sum, row) => sum + (row.TotalPaymentReceived || 0), 0).toFixed(2);
    const totalBalance = visibleRows.reduce((sum, row) => sum + (row.BalanceAmount || 0), 0).toFixed(2);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      foot: [["", "", "", "", "", "Grand Total:", `AED ${totalAmount}`, `AED ${totalReceived}`, `AED ${totalBalance}`]],
      startY: 20,
      styles: {
        font: isFontLoaded ? "ArabicFont" : "helvetica",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        fontStyle: isFontLoaded ? 'normal' : 'bold',
        textColor: [0, 0, 0]
      },
      footStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'right'
      },
      didParseCell: (data) => {
        if (data.column.index === 6 || data.column.index === 7 || data.column.index === 8 || data.column.index === 0) { // Amount, Received, Balance and S.No.
          data.cell.styles.halign = 'right';
        } else {
          data.cell.styles.halign = 'left';
        }
        if (data.section === 'foot' && data.column.index === 5) { // Grand Total text
          data.cell.styles.halign = 'right';
        }
      }
    });

    if (isFontLoaded) {
      doc.setFont("ArabicFont");
    }

    doc.text("Transactions List", 14, 15);
    doc.save("Transactions_List.pdf");
    toast.success("PDF file downloaded successfully");
  };

  const CustomFooter = () => {
    const totalAmount = visibleRows.reduce((sum, row) => sum + (Number(row.TotalAmountDue) || 0), 0).toFixed(2);
    const totalReceived = visibleRows.reduce((sum, row) => sum + (Number(row.TotalPaymentReceived) || 0), 0).toFixed(2);
    const totalBalance = visibleRows.reduce((sum, row) => sum + (Number(row.BalanceAmount) || 0), 0).toFixed(2);
    return (
      <Box className="flex flex-row items-center justify-between py-2 px-4 surface-secondary border-t border-divider rounded-b-lg">
        <Box className="flex-grow">
          <GridPagination />
        </Box>
        <Box className="flex flex-col items-end">
          <Typography variant="h6" className="font-bold text-text-primary px-2 whitespace-nowrap">
            Grand Total: <span className="text-primary">AED {totalAmount}</span>
          </Typography>
          <Typography variant="body2" className="font-bold text-text-primary px-2 whitespace-nowrap">
            Total Received: <span className="text-success">AED {totalReceived}</span>
          </Typography>
          <Typography variant="body2" className="font-bold text-text-secondary px-2 whitespace-nowrap">
            Total Balance: <span className="text-error">AED {totalBalance}</span>
          </Typography>
        </Box>
      </Box>
    );
  };

  const columns: GridColDef<TransactionRow>[] = [
    {
      field: "serialNo",
      headerName: "S.No.",
      width: 100,
      headerAlign: "center",
      renderCell: (params) => {
        const index = params.api.getAllRowIds().indexOf(params.id);
        return index + 1;
      },
    },
    { field: "TransactionDate", headerName: "Transaction date", width: 220, headerAlign: "center", renderCell: (params) => formatDateTime(params.value) },
    { field: "TransactionReferenceNumber", headerName: "Transaction No.", width: 150, headerAlign: "center" },
    { field: "PaymentTypeText", headerName: "Payment Type", width: 150, headerAlign: "center" },
    {
      field: "Status",
      headerName: "Status",
      width: 120,
      headerAlign: "center",
      renderCell: (params) => {
        if (params.value === 1 || params.value === "1") return "Partial";
        if (params.value === 2 || params.value === "2") return "Completed";
        return params.value || "";
      }
    },
    { field: "CompanyName", headerName: "Company name", width: 180, headerAlign: "center" },
    { field: "MobileNumber", headerName: "Mobile Number", width: 150, headerAlign: "center" },
    {
      field: "TotalAmountDue",
      headerName: "Total Amount Due",
      width: 120,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => `AED ${params.value}`,
    },
    {
      field: "TotalPaymentReceived",
      headerName: "Total payment received",
      width: 160,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => `AED ${params.value || 0}`,
    },
    {
      field: "BalanceAmount",
      headerName: "Balance Amount",
      width: 120,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => `AED ${params.value || 0}`,
    },
    {
      field: "actions",
      headerName: "Order Details",
      type: "actions",
      width: 100,
      align: "left",
      headerAlign: "center",
      getActions: (params) => {
        const actions = [];
        if (canRead) {
          actions.push(
            <GridActionsCellItem
              key="view"
              icon={<NiEyeOpen size="medium" />}
              label="View Details"
              onClick={() => handleViewDetails(params.id as number)}
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={5}>
        <ToastContainer />
        {/* Header Section */}
        <Grid size={12}>
          <Toolbar className="min-h-auto border-none p-0!">
            <Grid container spacing={2.5} className="w-full" size={12}>
              <Grid size={{ xs: 12, md: "grow" }}>
                <Typography variant="h1" component="h1" className="mb-0">
                  Completed Transaction List
                </Typography>
                <Breadcrumbs>
                  <Link color="inherit" to="/dashboard">
                    Home
                  </Link>
                  <Link color="inherit" to="/reports">
                    Reports
                  </Link>
                  <Typography variant="body2">Completed Transaction List</Typography>
                </Breadcrumbs>
              </Grid>
            </Grid>
          </Toolbar>
        </Grid>

        {/* Search Form Section */}
        <Grid size={12}>
          <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
            <Typography variant="h6" className="text-text-primary px-2">Transaction Search</Typography>
            <Box className="flex w-full flex-col gap-3 px-2 pb-2">
              <Box className="flex w-full flex-row items-center gap-3">
                <Box className="w-48">
                  <DatePicker
                    label="From Date"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        variant: "outlined",
                      },
                      field: { clearable: true } as any,
                    }}
                  />
                </Box>
                <Box className="w-48">
                  <DatePicker
                    label="To Date"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        variant: "outlined",
                      },
                      field: { clearable: true } as any,
                    }}
                  />
                </Box>
                <TextField
                  className="flex-grow min-w-[200px]"
                  size="small"
                  label="Company name"
                  variant="outlined"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  InputProps={{
                    endAdornment: companyName && (
                      <IconButton size="small" onClick={() => setCompanyName("")}>
                        <NiCross size="small" />
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  className="w-48"
                  size="small"
                  label="Mobile Number"
                  variant="outlined"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  InputProps={{
                    endAdornment: mobileNumber && (
                      <IconButton size="small" onClick={() => setMobileNumber("")}>
                        <NiCross size="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              <Box className="flex flex-row items-center justify-end gap-3 w-full">
                <FormControl size="small" className="w-48">
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={paymentType}
                    label="Payment Type"
                    onChange={(e) => setPaymentType(e.target.value)}
                    endAdornment={
                      paymentType !== "3" && (
                        <IconButton
                          size="small"
                          onClick={() => setPaymentType("3")}
                          sx={{ mr: 2 }}
                        >
                          <NiCross size="small" />
                        </IconButton>
                      )
                    }
                  >
                    <MenuItem value="1">Cash Payment</MenuItem>
                    <MenuItem value="2">Card Payment</MenuItem>
                    <MenuItem value="3">Both</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  size="medium"
                  color="primary"
                  variant="contained"
                  className="w-36 h-[40px] shrink-0"
                  startIcon={<NiSearch />}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>

                {canRead && isTableVisible && visibleRows.length > 0 && (
                  <>
                    <Tooltip title="Export to Excel">
                      <Button
                        size="medium"
                        color="error"
                        variant="contained"
                        className="w-44 h-[40px]"
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
                        className="w-44 h-[40px]"
                        startIcon={<NiDocumentFull size={"medium"} />}
                        onClick={handleExportPDF}
                      >
                        Export PDF
                      </Button>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* DataGrid Section */}
        {isTableVisible && (
          <Grid size={12}>
            <DataGrid
              rows={visibleRows}
              columns={columns}
              autoHeight
              loading={loading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              getRowSpacing={getRowSpacing}
              rowHeight={68}
              columnHeaderHeight={32}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              className="full-page border-none"
              pagination
              slotProps={{
                panel: { className: "mt-1!" },
                main: { className: "overflow-visible" },
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
                quickFilterIcon: () => <NiSearch size={"medium"} />,
                quickFilterClearIcon: () => <NiCross size={"medium"} />,
                baseButton: (props) => <Button {...props} variant="pastel" color="grey" />,
                moreActionsIcon: () => <NiEllipsisVertical size={"medium"} />,
                toolbar: TableToolbar,
                footer: CustomFooter,
              }}
              hideFooterSelectedRowCount
              showToolbar
            />
          </Grid>
        )}

        {/* View Detail Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle className="flex justify-between items-center">
            Order Details
            <IconButton onClick={handleCloseModal} size="small">
              <NiCross size="medium" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent className="surface-standard px-0 pb-0">
            {selectedTransaction && (
              <Box className="flex flex-col gap-0">
                {/* 0) General Information Section */}
                <Box className="px-6 py-4 bg-slate-50 border-b border-divider">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Typography variant="caption" className="text-text-secondary block">Transaction Date</Typography>
                      <Typography variant="body2" className="font-medium text-text-primary">{selectedTransaction.TransactionDate}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Typography variant="caption" className="text-text-secondary block">Transaction No.</Typography>
                      <Typography variant="body2" className="font-medium text-text-primary">{selectedTransaction.TransactionReferenceNumber}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Typography variant="caption" className="text-text-secondary block">Status</Typography>
                      <Typography variant="body2" className="font-medium text-text-primary">
                        {selectedTransaction.Status == 1 || selectedTransaction.Status == "1" ? "Partial" : selectedTransaction.Status == 2 || selectedTransaction.Status == "2" ? "Completed" : selectedTransaction.Status || ""}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Typography variant="caption" className="text-text-secondary block">Branch</Typography>
                      <Typography variant="body2" className="font-medium text-text-primary">{selectedTransaction.BranchEnglish}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Typography variant="caption" className="text-text-secondary block">Kiosk</Typography>
                      <Typography variant="body2" className="font-medium text-text-primary">{selectedTransaction.KioskEnglish}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                 {/* 1) Sales Order Section */}
                <Box className="px-6 py-4 bg-white border-b border-divider">
                  <Box className="flex items-center gap-2 mb-4">
                    <NiDocumentFull size="medium" className="text-primary" />
                    <Typography variant="h6" className="font-bold text-text-primary">
                      Sales Order Details
                    </Typography>
                  </Box>
                  <Box className="border border-divider rounded-xl overflow-hidden shadow-tiny">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="surface-secondary font-bold text-text-secondary uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-b border-divider">S.No</th>
                          <th className="px-4 py-3 border-b border-divider">Order #</th>
                          <th className="px-4 py-3 border-b border-divider">Company Name</th>
                          <th className="px-4 py-3 border-b border-divider">Mobile Number</th>
                          <th className="px-4 py-3 border-b border-divider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {selectedTransaction.salesOrders?.map((order, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 border-b border-divider/50">{idx + 1}</td>
                            <td className="px-4 py-3 border-b border-divider/50 font-medium">{order.SalesOrderNumber}</td>
                            <td className="px-4 py-3 border-b border-divider/50">{order.CompanyName}</td>
                            <td className="px-4 py-3 border-b border-divider/50">{selectedTransaction.MobileNumber}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-right font-semibold">AED {order.AmountDue}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="surface-secondary">
                        <tr className="font-bold">
                          <td colSpan={4} className="px-4 py-3 pr-8 text-right text-text-secondary"></td>
                          <td className="px-4 py-3 text-right text-primary text-base"><span className="text-text-secondary" style={{ marginRight: "15px" }}>Grand Total</span> AED {selectedTransaction.TotalAmountDue}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </Box>
                </Box>

                {/* 2) Payment Details Section */}
                <Box className="px-6 py-4 bg-white border-b border-divider">
                  <Box className="flex items-center gap-2 mb-4">
                    <NiPrinter size="medium" className="text-primary" />
                    <Typography variant="h6" className="font-bold text-text-primary">
                      Payment Details
                    </Typography>
                  </Box>
                  <Box className="border border-divider rounded-xl overflow-hidden shadow-tiny">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="surface-secondary font-bold text-text-secondary uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-b border-divider">S.No</th>
                          <th className="px-4 py-3 border-b border-divider">Type</th>
                          <th className="px-4 py-3 border-b border-divider">Transaction Date/Time</th>
                          <th className="px-4 py-3 border-b border-divider">Source ID</th>
                          <th className="px-4 py-3 border-b border-divider">Receipt No.</th>
                          <th className="px-4 py-3 border-b border-divider">Card Details</th>
                          <th className="px-4 py-3 border-b border-divider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {selectedTransaction.payments?.map((txn, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 border-b border-divider/50">{idx + 1}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">{txn.PaymentTypeText}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">{txn.TransactionDate ? formatDateTime(txn.TransactionDate) : '-'}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">{txn.SourceID || '-'}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">{txn.ReceiptNumber || '-'}</td>
                            <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">
                              {txn.PaymentType !== 1 && txn.CardInformation ? (
                                <Box className="text-[10px] leading-tight">
                                  {Object.entries(txn.CardInformation).map(([key, value]) => (
                                    <Box key={key} className="flex gap-1">
                                      <span className="font-bold">{key}:</span>
                                      <span>{String(value)}</span>
                                    </Box>
                                  ))}
                                </Box>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 border-b border-divider/50 text-right font-semibold">AED {txn.AmountPaid}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="surface-secondary">
                        <tr className="font-bold border-b border-divider/20">
                          <td colSpan={6} className="px-4 py-2 text-right text-text-secondary">Total Amount Due</td>
                          <td className="px-4 py-2 text-right text-text-primary">AED {selectedTransaction.TotalAmountDue}</td>
                        </tr>
                        <tr className="font-bold border-b border-divider/20">
                          <td colSpan={6} className="px-4 py-2 text-right text-text-secondary">Total payment received</td>
                          <td className="px-4 py-2 text-right text-success">AED {selectedTransaction.payments?.reduce((sum, p) => sum + (parseFloat(p.AmountPaid.toString().replace(/,/g, '')) || 0), 0).toFixed(2)}</td>
                        </tr>
                        <tr className="font-bold">
                          <td colSpan={6} className="px-4 py-2 text-right text-text-secondary">Balance Amount</td>
                          <td className="px-4 py-2 text-right text-error">AED {selectedTransaction.BalanceAmount || 0}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </Box>
                </Box>


                {/* 2) Cash Transaction Section */}
                {selectedTransaction.cash_transactions && selectedTransaction.cash_transactions.length > 0 && (
                  <Box className="px-6 py-4 bg-white border-b border-divider">
                    <Box className="flex items-center gap-2 mb-4">
                      <NiDocumentChart size="medium" className="text-primary" />
                      <Typography variant="h6" className="font-bold text-text-primary">
                        Cash Transaction
                      </Typography>
                    </Box>
                    <Box className="border border-divider rounded-xl overflow-hidden shadow-tiny">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="surface-secondary font-bold text-text-secondary uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3 border-b border-divider">S.No</th>
                            <th className="px-4 py-3 border-b border-divider">Currency</th>
                            <th className="px-4 py-3 border-b border-divider">Count</th>
                            <th className="px-4 py-3 border-b border-divider text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {selectedTransaction.cash_transactions.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 border-b border-divider/50">{item.SNo || idx + 1}</td>
                              <td className="px-4 py-3 border-b border-divider/50 font-medium">{item.Currency}</td>
                              <td className="px-4 py-3 border-b border-divider/50">
                                <Typography variant="body2" className="text-gray-800 font-medium">
                                  {item.Count}
                                </Typography>
                              </td>
                              <td className="px-4 py-3 border-b border-divider/50 text-right font-semibold">
                                {typeof item.Amount === 'number' ? `AED ${item.Amount.toFixed(2)}` : item.Amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="surface-secondary">
                          <tr className="font-bold">
                            <td colSpan={2} className="px-4 py-3 text-right text-text-secondary font-bold uppercase text-[10px]">Grand Total</td>
                            <td className="px-4 py-3 text-primary text-base">
                              {selectedTransaction.cash_summary?.TotalCount || 0}
                            </td>
                            <td className="px-4 py-3 text-right text-primary text-base">
                              {selectedTransaction.cash_summary?.TotalAmount || "AED 0.00"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </Box>
                  </Box>
                )}

                {/* 4) Cash Payout Section */}
                {selectedTransaction.cash_payout && selectedTransaction.cash_payout.length > 0 && (
                  <Box className="px-6 py-4 bg-white">
                    <Box className="flex items-center gap-2 mb-4">
                      <NiArrowInDown size="medium" className="text-primary" />
                      <Typography variant="h6" className="font-bold text-text-primary">
                        Cash Payout
                      </Typography>
                    </Box>
                    <Box className="border border-divider rounded-xl overflow-hidden shadow-tiny">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="surface-secondary font-bold text-text-secondary uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3 border-b border-divider">S.No</th>
                            <th className="px-4 py-3 border-b border-divider">Currency</th>
                            <th className="px-4 py-3 border-b border-divider">Count</th>
                            <th className="px-4 py-3 border-b border-divider text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {selectedTransaction.cash_payout.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 border-b border-divider/50">{item.SNo || idx + 1}</td>
                              <td className="px-4 py-3 border-b border-divider/50 font-medium">{item.Currency}</td>
                              <td className="px-4 py-3 border-b border-divider/50">
                                <Typography variant="body2" className="text-gray-800 font-medium">
                                  {item.Count}
                                </Typography>
                              </td>
                              <td className="px-4 py-3 border-b border-divider/50 text-right font-semibold">
                                {typeof item.Amount === 'number' ? `AED ${item.Amount.toFixed(2)}` : item.Amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="surface-secondary">
                          <tr className="font-bold">
                            <td colSpan={2} className="px-4 py-3 text-right text-text-secondary font-bold uppercase text-[10px]">Grand Total</td>
                            <td className="px-4 py-3 text-primary text-base">
                              {selectedTransaction.cash_payout_summary?.TotalCount || 0}
                            </td>
                            <td className="px-4 py-3 text-right text-primary text-base">
                              {selectedTransaction.cash_payout_summary?.TotalAmount || "AED 0.00"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </Box>
                  </Box>
                )}


              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Grid>
    </LocalizationProvider>
  );
}
