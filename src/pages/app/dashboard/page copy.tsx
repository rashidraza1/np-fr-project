import { useState, useCallback, useEffect, useMemo } from "react";
import { Grid, Typography, Button, Box, Card, CardContent, Dialog, DialogTitle, DialogContent, IconButton, Divider } from "@mui/material";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { arabicFontBase64 } from "@/utils/arabic-font";
import NiPrinter from "@/icons/nexture/ni-printer";
import DashboardFilters from "./components/DashboardFilters";
import StatsCard from "./components/StatsCard";
import RecentTransactions, { Transaction } from "./components/RecentTransactions";
import TransactionStatusChart from "./components/TransactionStatusChart";
import CollectionsChart from "./components/CollectionsChart";
import NiDocumentFull from "@/icons/nexture/ni-document-full";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import NiCross from "@/icons/nexture/ni-cross";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function DashboardPage() {
  const [filters, setFilters] = useState<any>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hourlyGraphData, setHourlyGraphData] = useState<any[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!filters.fromDate) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=report&action=PaymentListing&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            FromDate: filters.fromDate.format("YYYY-MM-DD"),
            ToDate: filters.toDate.format("YYYY-MM-DD"),
            BranchID: filters.branchId === "All" ? "" : filters.branchId,
            KioskID: filters.kioskId === "All" ? "" : filters.kioskId,
            // Dashboard specific defaults or missing fields
            MobileNumber: "",
            PaymentType: "",
            CompanyName: "",
            TableID: ""
          }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data && data.data.RecordListing) {
        const listing = Array.isArray(data.data.RecordListing) ? data.data.RecordListing : [data.data.RecordListing];
        const processedTransactions = listing.map((transaction: any) => ({
          ...transaction,
          salesOrders: Array.isArray(transaction.salesOrders) ? transaction.salesOrders : (transaction.salesOrders ? [transaction.salesOrders] : []),
          payments: Array.isArray(transaction.payments) ? transaction.payments : (transaction.payments ? [transaction.payments] : []),
        }));
        setTransactions(processedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard transactions:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchHourlyGraph = useCallback(async () => {
    if (!filters.fromDate) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=report&action=HourlyPaymentGraph&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            FromDate: filters.fromDate.format("YYYY-MM-DD"),
            ToDate: filters.toDate.format("YYYY-MM-DD"),
            BranchID: filters.branchId === "All" ? "" : filters.branchId,
            KioskID: filters.kioskId === "All" ? "" : filters.kioskId,
            MobileNumber: "",
            PaymentType: "",
            CompanyName: "",
            TableID: ""
          }),
        }
      );
      const res = await response.json();
      if (res.status === "SUCCESS" && Array.isArray(res.data)) {
        setHourlyGraphData(res.data);
      } else {
        setHourlyGraphData([]);
      }
    } catch (error) {
      console.error("Error fetching hourly graph:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
    fetchHourlyGraph();
  }, [fetchTransactions, fetchHourlyGraph]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const stats = useMemo(() => {
    let cash = 0;
    let card = 0;
    transactions.forEach(t => {
      const amt = Number(t.TotalAmountDue) || 0;
      if (t.PaymentType == 1) {
        cash += amt;
      } else if (t.PaymentType == 2) {
        card += amt;
      } else {
        // For "Both" (3) or others, if we don't have detailed split, we might need to look at t.payments
        // But the user request implies summarizing based on PaymentType
        if (t.payments && t.payments.length > 0) {
          t.payments.forEach(p => {
            const pAmt = Number(p.AmountPaid) || 0;
            if (p.PaymentType == 1) cash += pAmt;
            else if (p.PaymentType == 2) card += pAmt;
          });
        }
      }
    });
    const total = cash + card;
    return { cash, card, total };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (stats.total === 0) return [
      { label: 'Cash', value: 0, color: '#1976d2' },
      { label: 'Card', value: 0, color: '#90caf9' }
    ];
    return [
      { label: 'Cash', value: Math.round((stats.cash / stats.total) * 100), color: '#1976d2' },
      { label: 'Card', value: Math.round((stats.card / stats.total) * 100), color: '#90caf9' },
    ];
  }, [stats]);

  const hourlyChartProps = useMemo(() => {
    if (hourlyGraphData.length === 0) return { cashData: [], cardData: [], totalData: [], labels: [] };

    // API returns comma separated strings for numbers like "2,825.00"
    const parseCurrency = (val: any) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseFloat(val.replace(/,/g, ''));
      return 0;
    };

    return {
      cashData: hourlyGraphData.map(d => parseCurrency(d.cash)),
      cardData: hourlyGraphData.map(d => parseCurrency(d.card)),
      totalData: hourlyGraphData.map(d => parseCurrency(d.total)),
      labels: hourlyGraphData.map(d => d.label.split(' - ')[0].replace(':00', '')) // e.g. "08:00 AM - 09:00 AM" -> "08 AM"
    };
  }, [hourlyGraphData]);

  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = transactions.map((row, index) => ({
      "S.No.": index + 1,
      "Transaction date": row.TransactionDate,
      "Transaction No.": row.TransactionReferenceNumber,
      "Payment Type": row.PaymentTypeText,
      "Company name": row.CompanyName,
      "Mobile Number": row.MobileNumber,
      "Branch": row.BranchEnglish,
      "Kiosk": row.KioskEnglish,
      "Amount": `AED ${row.TotalAmountDue}`,
    }));

    // Add Grand Total row
    const totalAmount = transactions.reduce((sum, row) => sum + (Number(row.TotalAmountDue) || 0), 0).toFixed(2);
    dataToExport.push({
      "S.No.": "",
      "Transaction date": "",
      "Transaction No.": "",
      "Payment Type": "",
      "Company name": "",
      "Mobile Number": "",
      "Branch": "Grand Total:",
      "Kiosk": "",
      "Amount": `AED ${totalAmount}`,
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recent_Transactions");

    XLSX.writeFile(workbook, "Recent_Transactions.xlsx", { bookType: 'xlsx', type: 'binary' });
    toast.success("Excel file downloaded successfully");
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
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

    const tableColumn = ["S.No.", "Transaction date", "Transaction No.", "Payment Type", "Company name", "Mobile Number", "Branch", "Kiosk", "Amount"];
    const tableRows = transactions.map((row, index) => [
      index + 1,
      row.TransactionDate ?? "",
      row.TransactionReferenceNumber ?? "",
      row.PaymentTypeText ?? "",
      row.CompanyName ?? "",
      row.MobileNumber ?? "",
      row.BranchEnglish ?? "",
      row.KioskEnglish ?? "",
      `AED ${row.TotalAmountDue}`
    ]);

    const totalAmount = transactions.reduce((sum, row) => sum + (Number(row.TotalAmountDue) || 0), 0).toFixed(2);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      foot: [["", "", "", "", "", "", "Grand Total:", "", `AED ${totalAmount}`]],
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
        if (data.column.index === 8 || data.column.index === 0) { // Amount and S.No.
          data.cell.styles.halign = 'right';
        } else {
          data.cell.styles.halign = 'left';
        }
        if (data.section === 'foot' && data.column.index === 6) { // Grand Total text
          data.cell.styles.halign = 'right';
        }
      }
    });

    if (isFontLoaded) {
      doc.setFont("ArabicFont");
    }

    doc.text("Recent Transactions", 14, 15);
    doc.save("Recent_Transactions.pdf");
    toast.success("PDF file downloaded successfully");
  };


  return (
    <Box className="p-2">
      <ToastContainer />
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-black mb-0">
          Dashboard
        </Typography>
        {transactions.length > 0 && (
          <Box className="flex gap-2">
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
          </Box>
        )}
      </Box>

      <DashboardFilters onFiltersChange={handleFiltersChange} />

      <Grid container spacing={3}>
        {/* Income Section */}
        <Grid size={12}>
          <Card className="shadow-sm rounded-xl border-none bg-white">
            <CardContent className="p-5">
              <Typography variant="h6" className="font-bold mb-4">Income</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <StatsCard
                    title="Cash"
                    value={`AED ${stats.cash.toLocaleString()} `}
                    trend="neutral"
                    subLabel="Current data"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <StatsCard
                    title="Card"
                    value={`AED ${stats.card.toLocaleString()} `}
                    trend="neutral"
                    subLabel="Current data"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <StatsCard
                    title="Total"
                    value={`AED ${stats.total.toLocaleString()} `}
                    trend="neutral"
                    subLabel="Current data"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border-none bg-white">
                    <CardContent className="flex flex-col h-full justify-between p-5">
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" className="font-bold mb-3">Cash vs Card</Typography>
                        <Box className="flex flex-col gap-2">
                          <Box className="flex items-center justify-between">
                            <Typography variant="h6" className="font-bold text-black">Cash</Typography>
                            <Typography variant="h4" className="font-bold text-primary">{stats.total > 0 ? Math.round((stats.cash / stats.total) * 100) : 0}%</Typography>
                          </Box>
                          <Box className="flex items-center justify-between">
                            <Typography variant="h6" className="font-bold text-black">Card</Typography>
                            <Typography variant="h4" className="font-bold text-[#d32f2f]">{stats.total > 0 ? Math.round((stats.card / stats.total) * 100) : 0}%</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Status */}
        <Grid size={12}>
          <TransactionStatusChart data={chartData} />
        </Grid>

        {/* Collections & Transactions Chart */}
        <Grid size={12}>
          <CollectionsChart
            cashData={hourlyChartProps.cashData}
            cardData={hourlyChartProps.cardData}
            totalData={hourlyChartProps.totalData}
            labels={hourlyChartProps.labels}
          />
        </Grid>
        {/* Recent Transactions */}
        <Grid size={12}>
          <RecentTransactions
            transactions={transactions}
            loading={loading}
            onViewDetails={handleOpenDetails}
          />
        </Grid>
      </Grid>

      {/* Transaction Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center px-6 py-4">
          <Typography variant="h5" className="font-bold">Order Details</Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <NiCross size="medium" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent className="surface-standard px-0 pb-0">
          {selectedTransaction && (
            <Box className="flex flex-col gap-0">
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
              <Box className="px-6 py-4 bg-white">
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
                        <th className="px-4 py-3 border-b border-divider"></th>
                        <th className="px-4 py-3 border-b border-divider"></th>
                        <th className="px-4 py-3 border-b border-divider text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {selectedTransaction.payments?.map((txn, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 border-b border-divider/50">{idx + 1}</td>
                          <td className="px-4 py-3 border-b border-divider/50 text-text-secondary">{txn.PaymentTypeText}</td>
                          <td className="px-4 py-3 border-b border-divider/50"></td>
                          <td className="px-4 py-3 border-b border-divider/50"></td>
                          <td className="px-4 py-3 border-b border-divider/50 text-right font-semibold">AED {txn.AmountPaid}</td>
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
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
