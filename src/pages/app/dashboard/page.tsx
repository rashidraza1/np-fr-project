import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type RangeKey = "today" | "7_days" | "14_days" | "30_days" | "6_months" | "1_year";
type TransactionFilter = "cash" | "card" | "both";

type SummaryData = {
  total: number;
  cash: number;
  card: number;
  txns: number;
  cashHigh: number;
  cashLow: number;
  cardHigh: number;
  cardLow: number;
};

type HourlyItem = {
  hour: string;
  cash: number;
  card: number;
  total: number;
  transactions: number;
};

type TransactionRow = {
  id: number;
  date: string;
  time: string;
  mobile: string;
  orderNo: string;
  company: string;
  transactionType: "Cash" | "Credit Card" | "Split";
  cash: number;
  card: number;
  total: number;
};

type CassetteItem = {
  name: string;
  denom: string;
  denominationValue: number;
  notes: number;
  capacity: number;
  amount: number;
  color?: string;
};

type BoxStorage = {
  notes?: number;
  coins?: number;
  capacity: number;
  amount: number;
};

type DashboardData = {
  success?: boolean;
  lastSync: string;
  summary: SummaryData;
  salesFlow: HourlyItem[];
  peakHours: HourlyItem[];
  transactions: TransactionRow[];
  amountInHand: {
    totalAmount: number;
    cassettes: CassetteItem[];
    cashBox: BoxStorage;
    coinBox: BoxStorage;
  };
};

const API_URL = `${import.meta.env.VITE_API_URL}api/kiosk_dashboard_api.php`;

const filters: Array<{ label: string; value: RangeKey }> = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7_days" },
  { label: "14 Days", value: "14_days" },
  { label: "30 Days", value: "30_days" },
  { label: "6 Months", value: "6_months" },
  { label: "1 Year", value: "1_year" },
];

const transactionTypeOptions: Array<{ label: string; value: TransactionFilter }> = [
  { label: "Cash", value: "cash" },
  { label: "Credit Card", value: "card" },
  { label: "Both", value: "both" },
];

const cassetteColors = ["#22c55e", "#38bdf8", "#f59e0b", "#a78bfa"];

const fallbackData: DashboardData = {
  success: true,
  lastSync: "17:42",
  summary: {
    total: 18640,
    cash: 11270,
    card: 7370,
    txns: 42,
    cashHigh: 950,
    cashLow: 15,
    cardHigh: 1200,
    cardLow: 25,
  },
  salesFlow: [
    { hour: "08:00", cash: 340, card: 180, total: 520, transactions: 3 },
    { hour: "09:00", cash: 780, card: 460, total: 1240, transactions: 5 },
    { hour: "10:00", cash: 1260, card: 930, total: 2190, transactions: 7 },
    { hour: "11:00", cash: 1090, card: 720, total: 1810, transactions: 6 },
    { hour: "12:00", cash: 1480, card: 980, total: 2460, transactions: 8 },
    { hour: "13:00", cash: 1820, card: 1220, total: 3040, transactions: 10 },
    { hour: "14:00", cash: 880, card: 540, total: 1420, transactions: 4 },
    { hour: "15:00", cash: 710, card: 420, total: 1130, transactions: 3 },
    { hour: "16:00", cash: 1360, card: 870, total: 2230, transactions: 7 },
    { hour: "17:00", cash: 1540, card: 1060, total: 2600, transactions: 9 },
  ],
  peakHours: [
    { hour: "08:00", cash: 340, card: 180, total: 520, transactions: 3 },
    { hour: "09:00", cash: 780, card: 460, total: 1240, transactions: 5 },
    { hour: "10:00", cash: 1260, card: 930, total: 2190, transactions: 7 },
    { hour: "11:00", cash: 1090, card: 720, total: 1810, transactions: 6 },
    { hour: "12:00", cash: 1480, card: 980, total: 2460, transactions: 8 },
    { hour: "13:00", cash: 1820, card: 1220, total: 3040, transactions: 10 },
    { hour: "14:00", cash: 880, card: 540, total: 1420, transactions: 4 },
    { hour: "15:00", cash: 710, card: 420, total: 1130, transactions: 3 },
    { hour: "16:00", cash: 1360, card: 870, total: 2230, transactions: 7 },
    { hour: "17:00", cash: 1540, card: 1060, total: 2600, transactions: 9 },
  ],
  transactions: [
    { id: 1, date: "24-04-2026", time: "17:42:21", mobile: "+971501112233", orderNo: "SO-10042", company: "National Paints", transactionType: "Cash", cash: 350, card: 0, total: 350 },
    { id: 2, date: "24-04-2026", time: "17:31:08", mobile: "+971552223344", orderNo: "SO-10041", company: "RSI Concepts", transactionType: "Credit Card", cash: 0, card: 780, total: 780 },
    { id: 3, date: "24-04-2026", time: "17:17:52", mobile: "+971563334455", orderNo: "SO-10040", company: "Al Noor Trading", transactionType: "Split", cash: 420, card: 300, total: 720 },
  ],
  amountInHand: {
    totalAmount: 79050,
    cassettes: [
      { name: "Cassette 1", denom: "AED 5", denominationValue: 5, notes: 62, capacity: 70, amount: 310, color: "#22c55e" },
      { name: "Cassette 2", denom: "AED 10", denominationValue: 10, notes: 48, capacity: 70, amount: 480, color: "#38bdf8" },
      { name: "Cassette 3", denom: "AED 50", denominationValue: 50, notes: 69, capacity: 70, amount: 3450, color: "#f59e0b" },
      { name: "Cassette 4", denom: "AED 100", denominationValue: 100, notes: 31, capacity: 70, amount: 3100, color: "#a78bfa" },
    ],
    cashBox: { notes: 1375, capacity: 2000, amount: 68750 },
    coinBox: { coins: 1180, capacity: 2000, amount: 2960 },
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const percent = (value: number, total: number) => {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(value || 0) / Number(total)) * 100)));
};

const getStatus = (level: number) => {
  if (level >= 90) return { label: "Almost Full", color: "#ef4444" };
  if (level >= 75) return { label: "Filling Fast", color: "#f97316" };
  return { label: "Healthy", color: "#22c55e" };
};

const formatDate = (dateValue: string) => {
  if (!dateValue) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) return dateValue;
  const normalized = String(dateValue).split("T")[0].split(" ")[0];
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return dateValue;
  return `${day}-${month}-${year}`;
};

const normalizeCassette = (item: CassetteItem, index: number): CassetteItem => {
  const denominationValue = Number(item.denominationValue || String(item.denom || "").replace(/[^0-9.]/g, "") || 0);
  const notes = Number(item.notes || 0);
  const capacity = Number(item.capacity || 70);
  return {
    ...item,
    name: item.name || `Cassette ${index + 1}`,
    denom: item.denom || `AED ${denominationValue}`,
    denominationValue,
    notes,
    capacity,
    amount: Number(item.amount ?? denominationValue * notes),
    color: item.color || cassetteColors[index % cassetteColors.length],
  };
};

const Panel = ({ title, subtitle, action, children, sx }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; sx?: object }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "28px",
      border: "1px solid rgba(148,163,184,0.26)",
      background: "rgba(255,255,255,0.92)",
      boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
      overflow: "hidden",
      ...sx,
    }}
  >
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
          alignItems: "center",
          columnGap: 2,
          rowGap: 1.5,
          width: "100%",
          mb: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 950, color: "#0f172a", letterSpacing: "-0.03em" }}>{title}</Typography>
          {subtitle && <Typography sx={{ mt: 0.4, color: "#64748b", fontSize: 13 }}>{subtitle}</Typography>}
        </Box>
        {action && (
          <Box
            sx={{
              justifySelf: { xs: "stretch", md: "end" },
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              alignItems: "center",
              width: { xs: "100%", md: "auto" },
            }}
          >
            {action}
          </Box>
        )}
      </Box>
      {children}
    </CardContent>
  </Card>
);

const FilterSelect = ({ value, onChange }: { value: RangeKey; onChange: (value: RangeKey) => void }) => (
  <FormControl size="small" sx={{ minWidth: 180 }}>
    <InputLabel>Time Period</InputLabel>
    <Select label="Time Period" value={value} onChange={(e) => onChange(e.target.value as RangeKey)} sx={{ borderRadius: 3 }}>
      {filters.map((item) => (
        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

const TransactionTypeSelect = ({ value, onChange }: { value: TransactionFilter; onChange: (value: TransactionFilter) => void }) => (
  <FormControl size="small" sx={{ minWidth: 180 }}>
    <InputLabel>Transaction Type</InputLabel>
    <Select label="Transaction Type" value={value} onChange={(e) => onChange(e.target.value as TransactionFilter)} sx={{ borderRadius: 3 }}>
      {transactionTypeOptions.map((item) => (
        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

const KpiCard = ({ title, value, subtitle, color1, color2 }: { title: string; value: string; subtitle: string; color1: string; color2: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.3,
      height: 132,
      borderRadius: "24px",
      position: "relative",
      overflow: "hidden",
      color: "white",
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      boxShadow: `0 18px 42px ${color1}33`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Box sx={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.16)", right: -52, top: -58 }} />
    <Box sx={{ position: "relative", zIndex: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 900, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase" }}>{title}</Typography>
      <Typography sx={{ mt: 1, fontSize: { xs: 28, md: 34 }, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1 }}>{value}</Typography>
    </Box>
    <Typography sx={{ position: "relative", zIndex: 1, fontSize: 12, opacity: 0.82 }}>{subtitle}</Typography>
  </Paper>
);

const SmallInfoCard = ({ label, value, tone = "blue" }: { label: string; value: string; tone?: "green" | "blue" | "orange" | "purple" }) => {
  const map = {
    green: { bg: "#ecfdf5", border: "#bbf7d0", text: "#166534" },
    blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    orange: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
    purple: { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
  };
  const color = map[tone];
  return (
    <Box sx={{ p: 1.8, borderRadius: 3.5, background: color.bg, border: `1px solid ${color.border}`, height: "100%" }}>
      <Typography sx={{ fontSize: 12, color: color.text, fontWeight: 900 }}>{label}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: 24, color: "#0f172a", fontWeight: 950 }}>{value}</Typography>
    </Box>
  );
};

const SalesSummarySection = ({ summary, salesFlow, range, onRangeChange }: { summary: SummaryData; salesFlow: HourlyItem[]; range: RangeKey; onRangeChange: (value: RangeKey) => void }) => (
  <Panel
    title="Sales Summary"
    subtitle="Cash, coins and credit card revenue overview with transaction extremes."
    action={<FilterSelect value={range} onChange={onRangeChange} />}
  >
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
      <KpiCard title="Total Sales" value={money(summary.total)} subtitle={`${summary.txns.toLocaleString()} successful transactions`} color1="#2563eb" color2="#0f172a" />
      <KpiCard title="Cash Sales" value={money(summary.cash)} subtitle={`${percent(summary.cash, summary.total)}% of total sales`} color1="#16a34a" color2="#052e16" />
      <KpiCard title="Credit Card" value={money(summary.card)} subtitle={`${percent(summary.card, summary.total)}% of total sales`} color1="#0891b2" color2="#0f172a" />
      <KpiCard title="# of Transactions" value={summary.txns.toLocaleString()} subtitle="Successful kiosk payments" color1="#7c3aed" color2="#111827" />
    </Box>

    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
      <SmallInfoCard label="Highest Cash Sale" value={money(summary.cashHigh)} tone="green" />
      <SmallInfoCard label="Lowest Cash Sale" value={money(summary.cashLow)} tone="orange" />
      <SmallInfoCard label="Highest Card Transaction" value={money(summary.cardHigh)} tone="blue" />
      <SmallInfoCard label="Lowest Card Transaction" value={money(summary.cardLow)} tone="purple" />
    </Box>

    <Paper elevation={0} sx={{ mt: 2.2, p: 2.2, borderRadius: "24px", height: { xs: 360, md: 430 }, background: "linear-gradient(180deg,#0f172a,#111827)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 950 }}>Sales Flow by Hour</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.58)", fontSize: 12 }}>Cash, credit card and total revenue trend</Typography>
        </Box>
        <Chip label="Full Width Trend" size="small" sx={{ color: "white", background: "rgba(255,255,255,0.12)" }} />
      </Stack>
      <ResponsiveContainer width="100%" height="84%">
        <AreaChart data={salesFlow} margin={{ top: 15, right: 18, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="cashArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.55} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="cardArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="hour" stroke="rgba(255,255,255,0.58)" />
          <YAxis stroke="rgba(255,255,255,0.58)" />
          <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#020617", color: "white", borderRadius: 12, border: "1px solid rgba(255,255,255,0.16)" }} />
          <Legend />
          <Area type="monotone" dataKey="cash" name="Cash" stroke="#22c55e" strokeWidth={3} fill="url(#cashArea)" />
          <Area type="monotone" dataKey="card" name="Credit Card" stroke="#38bdf8" strokeWidth={3} fill="url(#cardArea)" />
          <Line type="monotone" dataKey="total" name="Total" stroke="#facc15" strokeWidth={4} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  </Panel>
);

const TransactionsSection = ({ rows, range, onRangeChange, transactionType, onTransactionTypeChange }: { rows: TransactionRow[]; range: RangeKey; onRangeChange: (value: RangeKey) => void; transactionType: TransactionFilter; onTransactionTypeChange: (value: TransactionFilter) => void }) => {
  const totals = useMemo(() => rows.reduce((acc, row) => {
    acc.cash += Number(row.cash || 0);
    acc.card += Number(row.card || 0);
    acc.total += Number(row.total || 0);
    return acc;
  }, { cash: 0, card: 0, total: 0 }), [rows]);

  return (
    <Panel
      title="Sales Transactions"
      subtitle="Scrollable transaction ledger with latest sale on top and grand totals."
      action={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
          <TransactionTypeSelect value={transactionType} onChange={onTransactionTypeChange} />
          <FilterSelect value={range} onChange={onRangeChange} />
        </Stack>
      }
    >
      <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 460, borderRadius: "22px", border: "1px solid rgba(148,163,184,0.28)", overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["S.No", "Date", "Time", "Mobile Number", "Sales Order #", "Company Name", "Transaction Type", "Cash Amount", "Credit Card Amount", "Total"].map((head, index) => (
                <TableCell key={head} align={index >= 7 ? "right" : "left"} sx={{ fontWeight: 950, color: "#0f172a", background: "linear-gradient(180deg,#f8fafc,#eef2ff)", whiteSpace: "nowrap" }}>{head}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: "#64748b" }}>No transactions found for the selected filters.</TableCell>
              </TableRow>
            ) : rows.map((row, index) => {
              const type = row.transactionType || (row.cash > 0 && row.card > 0 ? "Split" : row.cash > 0 ? "Cash" : "Credit Card");
              const color = type === "Cash" ? "success" : type === "Credit Card" ? "primary" : "warning";
              return (
                <TableRow hover key={row.id || index}>
                  <TableCell sx={{ fontWeight: 800 }}>{index + 1}</TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.mobile}</TableCell>
                  <TableCell><Chip label={row.orderNo || "-"} size="small" sx={{ fontWeight: 850, background: "#eef2ff", color: "#3730a3" }} /></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13 }}>{row.company || "-"}</Typography></TableCell>
                  <TableCell><Chip label={type} size="small" color={color} variant="outlined" /></TableCell>
                  <TableCell align="right" sx={{ color: "#15803d", fontWeight: row.cash ? 850 : 500 }}>{money(row.cash)}</TableCell>
                  <TableCell align="right" sx={{ color: "#0369a1", fontWeight: row.card ? 850 : 500 }}>{money(row.card)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 950 }}>{money(row.total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter sx={{ position: "sticky", bottom: 0, zIndex: 2 }}>
            <TableRow>
              <TableCell colSpan={7} sx={{ color: "white", fontWeight: 950, background: "linear-gradient(90deg,#0f172a,#1e3a8a)" }}>Grand Total</TableCell>
              <TableCell align="right" sx={{ color: "white", fontWeight: 950, background: "#0f172a" }}>{money(totals.cash)}</TableCell>
              <TableCell align="right" sx={{ color: "white", fontWeight: 950, background: "#0f172a" }}>{money(totals.card)}</TableCell>
              <TableCell align="right" sx={{ color: "white", fontWeight: 950, background: "#0f172a" }}>{money(totals.total)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Panel>
  );
};

const PeakOffPeakSection = ({ data, range, onRangeChange }: { data: HourlyItem[]; range: RangeKey; onRangeChange: (value: RangeKey) => void }) => {
  const max = data.reduce((best, item) => (Number(item.total || 0) > Number(best.total || 0) ? item : best), data[0] || { hour: "-", total: 0, transactions: 0, cash: 0, card: 0 });
  const positive = data.filter((item) => Number(item.transactions || 0) > 0 || Number(item.total || 0) > 0);
  const min = positive.reduce((best, item) => (Number(item.total || 0) < Number(best.total || 0) ? item : best), positive[0] || max);

  return (
    <Panel
      title="Peak & Off-Peak Hours"
      subtitle="Hourly transaction count and sales amount to identify busy and slow periods."
      action={<FilterSelect value={range} onChange={onRangeChange} />}
    >
      <Paper elevation={0} sx={{ p: 2, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.25)", height: 430, background: "linear-gradient(180deg,#ffffff,#f8fafc)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 950, color: "#0f172a" }}>Hourly Sales Activity</Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>Transactions and sales amount by hour</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={`Peak ${max.hour}`} color="success" size="small" />
            <Chip label={`Off-Peak ${min.hour}`} variant="outlined" size="small" />
          </Stack>
        </Stack>
        <ResponsiveContainer width="100%" height="86%">
          <ComposedChart data={data} margin={{ top: 15, right: 20, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(v, name) => name === "total" ? money(Number(v)) : v} />
            <Legend />
            <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={34} />
            <Line yAxisId="right" type="monotone" dataKey="total" name="Sales Amount" stroke="#f97316" strokeWidth={4} dot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>
    </Panel>
  );
};

const AmountStorageCard = ({ title, subtitle, used, capacity, amount, accent, type = "notes" }: { title: string; subtitle: string; used: number; capacity: number; amount: number; accent: string; type?: string }) => {
  const level = percent(used, capacity);
  const remaining = Math.max(0, capacity - used);
  const remainingPercent = Math.max(0, 100 - level);
  const status = getStatus(level);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: "28px",
        minHeight: 430,
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid rgba(148,163,184,0.26)",
        boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
      }}
    >
      <Box sx={{ height: 9, background: accent }} />
      <Box sx={{ position: "absolute", width: 230, height: 230, borderRadius: "50%", background: `${accent}14`, right: -88, top: 70 }} />
      <Box sx={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `${accent}0F`, left: -72, bottom: -66 }} />

      <Box sx={{ p: 2.2, pb: 2.2, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            position: "absolute",
            top: 18,
            right: 18,
            px: 1.6,
            py: 0.95,
            minWidth: 112,
            borderRadius: "18px",
            textAlign: "center",
            color: "white",
            background: `linear-gradient(135deg, ${accent}, #0f172a)`,
            boxShadow: `0 12px 26px ${accent}55`,
            border: "1px solid rgba(255,255,255,0.32)",
            zIndex: 3,
          }}
        >
          <Typography sx={{ fontSize: 9.5, fontWeight: 950, opacity: 0.78, letterSpacing: 0.8 }}>CAPACITY</Typography>
          <Typography sx={{ mt: 0.15, fontSize: 18, lineHeight: 1, fontWeight: 950 }}>{capacity}</Typography>
          <Typography sx={{ mt: 0.2, fontSize: 10, lineHeight: 1, opacity: 0.82, fontWeight: 800 }}>{type}</Typography>
        </Box>

        <Box sx={{ minWidth: 0, pr: 14 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 950, color: "#0f172a", letterSpacing: "-0.04em" }}>{title}</Typography>
          <Typography sx={{ fontSize: 12, color: "#475569", mt: 0.35, fontWeight: 700 }}>{subtitle}</Typography>
        </Box>

        <Box sx={{ mt: 2.2, textAlign: "center" }}>
          <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 }}>Amount Inside</Typography>
          <Typography sx={{ mt: 0.55, fontSize: 40, lineHeight: 1, fontWeight: 950, color: "#0f172a", letterSpacing: "-0.06em" }}>{money(amount)}</Typography>
          <Typography sx={{ mt: 0.9, fontSize: 12, color: "#64748b" }}>{used} {type} currently stored</Typography>
        </Box>

        <Box sx={{ mt: 1.7, height: 158, position: "relative", display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: 158, height: 158, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: level, fill: status.color }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={18} background={{ fill: "#e2e8f0" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
              <Box>
                <Typography sx={{ fontSize: 36, lineHeight: 1, fontWeight: 950, color: "#0f172a" }}>{level}%</Typography>
                <Typography sx={{ fontSize: 10.5, color: "#64748b", fontWeight: 800 }}>Full</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 1.4, height: 12, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
          <Box sx={{ width: `${level}%`, height: "100%", borderRadius: 99, background: status.color }} />
        </Box>

        <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.1 }}>
          <Box sx={{ p: 1.25, borderRadius: "18px", minHeight: 76, color: "white", background: `linear-gradient(135deg, ${accent}, #0f172a)`, boxShadow: `0 10px 24px ${accent}33`, border: "1px solid rgba(255,255,255,0.18)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 10, fontWeight: 950, opacity: 0.82, letterSpacing: 0.8 }}>STORED</Typography>
              <Box sx={{ px: 0.9, py: 0.25, borderRadius: 99, background: "rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 950 }}>{level}%</Box>
            </Stack>
            <Typography sx={{ mt: 0.75, fontSize: 20, lineHeight: 1, fontWeight: 950 }}>{used} {type}</Typography>
          </Box>
          <Box sx={{ p: 1.25, borderRadius: "18px", minHeight: 76, color: "#0f172a", background: "linear-gradient(135deg, #f8fafc, #e2e8f0)", boxShadow: "0 10px 24px rgba(15,23,42,0.06)", border: "1px solid #cbd5e1" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 10, color: "#475569", fontWeight: 950, letterSpacing: 0.8 }}>SPACE LEFT</Typography>
              <Box sx={{ px: 0.9, py: 0.25, borderRadius: 99, color: "white", background: accent, fontSize: 11, fontWeight: 950 }}>{remainingPercent}%</Box>
            </Stack>
            <Typography sx={{ mt: 0.75, fontSize: 20, lineHeight: 1, fontWeight: 950, color: "#0f172a" }}>{remaining} {type}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ px: 1.55, py: 0.95, minWidth: 118, borderRadius: "18px", textAlign: "center", color: "white", background: `linear-gradient(135deg, ${status.color}, #0f172a)`, boxShadow: `0 12px 26px ${status.color}44`, border: "1px solid rgba(255,255,255,0.32)" }}>
            <Typography sx={{ fontSize: 9.2, fontWeight: 950, opacity: 0.78, letterSpacing: 0.8 }}>STATUS</Typography>
            <Typography sx={{ mt: 0.15, fontSize: 15, lineHeight: 1, fontWeight: 950 }}>{status.label}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const CassetteStorageCard = ({ item }: { item: CassetteItem }) => {
  const level = percent(item.notes, item.capacity);
  const remaining = Math.max(0, item.capacity - item.notes);
  const remainingPercent = Math.max(0, 100 - level);
  const status = getStatus(level);
  const itemColor = item.color || "#22c55e";

  return (
    <Paper elevation={0} sx={{ p: 0, borderRadius: "26px", minHeight: 302, position: "relative", overflow: "hidden", background: "#ffffff", border: "1px solid rgba(148,163,184,0.26)", boxShadow: "0 18px 45px rgba(15,23,42,0.08)" }}>
      <Box sx={{ height: 8, background: itemColor }} />
      <Box sx={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `${itemColor}14`, right: -62, top: 26 }} />
      <Box sx={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: `${itemColor}0F`, left: -58, bottom: -56 }} />

      <Box sx={{ p: 1.6, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: 294 }}>
        <Box sx={{ position: "absolute", top: 12, right: 12, px: 1.15, py: 0.75, minWidth: 78, borderRadius: "14px", textAlign: "center", color: "white", background: `linear-gradient(135deg, ${itemColor}, #0f172a)`, boxShadow: `0 12px 26px ${itemColor}55`, border: "1px solid rgba(255,255,255,0.32)", zIndex: 3 }}>
          <Typography sx={{ fontSize: 8.4, fontWeight: 950, opacity: 0.78, letterSpacing: 0.7 }}>DENOMINATION</Typography>
          <Typography sx={{ mt: 0.15, fontSize: 16, lineHeight: 1, fontWeight: 950 }}>{item.denom}</Typography>
        </Box>

        <Box sx={{ minWidth: 0, pr: 10 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 950, color: "#0f172a", letterSpacing: "-0.03em" }}>{item.name}</Typography>
          <Typography sx={{ fontSize: 11.5, color: "#475569", mt: 0.2, fontWeight: 700 }}>Note cassette</Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.05} sx={{ mt: 1.35 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.7 }}>Amount Inside</Typography>
            <Typography sx={{ mt: 0.45, fontSize: 25, lineHeight: 1, fontWeight: 950, color: "#0f172a", letterSpacing: "-0.05em" }}>{money(item.amount)}</Typography>
            <Typography sx={{ mt: 0.65, fontSize: 11, color: "#64748b" }}>{item.notes} notes × {item.denom}</Typography>
          </Box>
          <Box sx={{ width: 92, height: 92, position: "relative", flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: level, fill: status.color }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={16} background={{ fill: "#e2e8f0" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
              <Box>
                <Typography sx={{ fontSize: 22, lineHeight: 1, fontWeight: 950, color: "#0f172a" }}>{level}%</Typography>
                <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 800 }}>Full</Typography>
              </Box>
            </Box>
          </Box>
        </Stack>

        <Box sx={{ mt: 1.35, height: 10, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
          <Box sx={{ width: `${level}%`, height: "100%", borderRadius: 99, background: status.color }} />
        </Box>

        <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
          <Box sx={{ p: 1.05, borderRadius: "15px", minHeight: 62, color: "white", background: `linear-gradient(135deg, ${itemColor}, #0f172a)`, boxShadow: `0 10px 24px ${itemColor}33`, border: "1px solid rgba(255,255,255,0.18)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 9, fontWeight: 950, opacity: 0.82, letterSpacing: 0.7 }}>STORED</Typography>
              <Box sx={{ px: 0.9, py: 0.25, borderRadius: 99, color: "#0f172a", background: "#ffffff", fontSize: 11, fontWeight: 950 }}>{level}%</Box>
            </Stack>
            <Typography sx={{ mt: 0.55, fontSize: 17, lineHeight: 1, fontWeight: 950 }}>{item.notes} notes</Typography>
          </Box>
          <Box sx={{ p: 1.05, borderRadius: "15px", minHeight: 62, color: "#0f172a", background: "linear-gradient(135deg, #f8fafc, #e2e8f0)", boxShadow: "0 10px 24px rgba(15,23,42,0.06)", border: "1px solid #cbd5e1" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 9, color: "#475569", fontWeight: 950, letterSpacing: 0.7 }}>SPACE LEFT</Typography>
              <Box sx={{ px: 0.9, py: 0.25, borderRadius: 99, color: "white", background: itemColor, fontSize: 11, fontWeight: 950 }}>{remainingPercent}%</Box>
            </Stack>
            <Typography sx={{ mt: 0.55, fontSize: 17, lineHeight: 1, fontWeight: 950, color: "#0f172a" }}>{remaining} notes</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 1.35, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ px: 1.35, py: 0.85, minWidth: 104, borderRadius: "15px", textAlign: "center", color: "white", background: `linear-gradient(135deg, ${status.color}, #0f172a)`, boxShadow: `0 12px 26px ${status.color}44`, border: "1px solid rgba(255,255,255,0.32)" }}>
            <Typography sx={{ fontSize: 8.8, fontWeight: 950, opacity: 0.78, letterSpacing: 0.8 }}>STATUS</Typography>
            <Typography sx={{ mt: 0.15, fontSize: 14, lineHeight: 1, fontWeight: 950 }}>{status.label}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const AmountInHandSection = ({ amountInHand }: { amountInHand: DashboardData["amountInHand"] }) => {
  const cassettes = (amountInHand.cassettes || []).slice(0, 4).map(normalizeCassette);
  const totalCassetteAmount = cassettes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalAmountInHand = Number(amountInHand.totalAmount || totalCassetteAmount + Number(amountInHand.cashBox.amount || 0) + Number(amountInHand.coinBox.amount || 0));
  const cashNotes = Number(amountInHand.cashBox.notes || 0);
  const coinCount = Number(amountInHand.coinBox.coins || 0);

  return (
    <Panel
      title="Amount in Hand"
      subtitle="Current cash, notes and coins available inside the kiosk machine."
      action={
        <Paper elevation={0} sx={{ px: 2.4, py: 1.45, minWidth: 250, borderRadius: "22px", color: "white", background: "linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #0f766e 100%)", boxShadow: "0 16px 38px rgba(37,99,235,0.28)", border: "1px solid rgba(255,255,255,0.18)", position: "relative", overflow: "hidden" }}>
          <Box sx={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.14)", right: -44, top: -54 }} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 950, opacity: 0.78, letterSpacing: 0.9, textTransform: "uppercase" }}>Total Amount in Hand</Typography>
            <Typography sx={{ mt: 0.45, fontSize: 28, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.05em" }}>{money(totalAmountInHand)}</Typography>
          </Box>
        </Paper>
      }
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        {cassettes.map((item, index) => <CassetteStorageCard key={`${item.name}-${index}`} item={item} />)}
      </Box>

      <Box sx={{ mt: 2.2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.2 }}>
        <AmountStorageCard title="Cash Box" subtitle="Main note cash box capacity" used={cashNotes} capacity={Number(amountInHand.cashBox.capacity || 2000)} amount={Number(amountInHand.cashBox.amount || 0)} accent="#164e63" type="notes" />
        <AmountStorageCard title="Coin Box" subtitle="Main coin collection box capacity" used={coinCount} capacity={Number(amountInHand.coinBox.capacity || 2000)} amount={Number(amountInHand.coinBox.amount || 0)} accent="#7c2d12" type="coins" />
      </Box>
    </Panel>
  );
};

export default function KioskPaymentDashboard() {
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const [summaryRange, setSummaryRange] = useState<RangeKey>("today");
  const [transactionsRange, setTransactionsRange] = useState<RangeKey>("today");
  const [peakRange, setPeakRange] = useState<RangeKey>("today");
  const [transactionType, setTransactionType] = useState<TransactionFilter>("both");
  const [data, setData] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({
      summary_range: summaryRange,
      transactions_range: transactionsRange,
      peak_range: peakRange,
      transaction_type: transactionType,
    });

    setLoading(true);
    setError(null);

    fetch(`${API_URL}?${params.toString()}`, { credentials: "same-origin" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          throw new Error(payload.message || "Dashboard API request failed");
        }
        return payload as DashboardData;
      })
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((err: Error) => {
        if (alive) {
          setError(err.message || "Unable to load dashboard data. Showing sample layout data.");
          setData(fallbackData);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [summaryRange, transactionsRange, peakRange, transactionType]);

  const exportToPng = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      backgroundColor: "#eef2ff",
      useCORS: true,
      logging: false,
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `kiosk-payment-dashboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  const exportToPdf = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      backgroundColor: "#eef2ff",
      useCORS: true,
      logging: false,
    });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(image, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`kiosk-payment-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 }, background: "radial-gradient(circle at top left, #dbeafe 0, transparent 34%), radial-gradient(circle at top right, #ccfbf1 0, transparent 30%), linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)" }}>
      <Box ref={dashboardRef}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: { xs: 2.6, md: 3.5 }, borderRadius: "32px", overflow: "hidden", position: "relative", color: "white", background: "linear-gradient(135deg,#020617 0%,#172554 46%,#0f766e 100%)", boxShadow: "0 30px 80px rgba(15,23,42,0.28)" }}>
            <Box sx={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", right: -150, top: -180, background: "rgba(56,189,248,0.22)" }} />
            <Box sx={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", left: "36%", bottom: -140, background: "rgba(34,197,94,0.18)" }} />
            <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }} spacing={3} sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                  <Chip label="KIOSK LIVE" sx={{ background: "#86efac", color: "#022c22", fontWeight: 950 }} />
                  <Chip label="Cash · Coins · Credit Card" sx={{ color: "white", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)" }} />
                </Stack>
                <Typography sx={{ fontSize: { xs: 34, md: 50 }, fontWeight: 950, letterSpacing: "-0.06em", lineHeight: 0.95 }}>Kiosk Payment Dashboard</Typography>
                <Typography sx={{ mt: 1.4, maxWidth: 760, color: "rgba(255,255,255,0.72)", fontSize: 15 }}>Premium control dashboard for kiosk sales, cash acceptance, credit card payments, live transactions and currency device capacity.</Typography>
              </Box>

              <Stack spacing={1.2} sx={{ alignSelf: { xs: "flex-start", lg: "flex-start" }, ml: { lg: "auto" }, minWidth: { xs: "100%", sm: 260 } }}>
                <Paper elevation={0} sx={{ px: 2.2, py: 1.4, borderRadius: "18px", color: "white", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(14px)" }}>
                  <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.62)", fontWeight: 800 }}>Last Sync</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 950 }}>{data.lastSync || "-"}</Typography>
                </Paper>
                <Stack direction="row" spacing={1}>
                  <Button onClick={exportToPdf} variant="contained" fullWidth sx={{ py: 1, borderRadius: "14px", textTransform: "none", fontWeight: 950, color: "#0f172a", background: "linear-gradient(135deg,#ffffff,#dbeafe)", boxShadow: "0 12px 28px rgba(15,23,42,0.20)", "&:hover": { background: "linear-gradient(135deg,#ffffff,#bfdbfe)" } }}>Export PDF</Button>
                  <Button onClick={exportToPng} variant="contained" fullWidth sx={{ py: 1, borderRadius: "14px", textTransform: "none", fontWeight: 950, color: "white", background: "linear-gradient(135deg,#22c55e,#0f766e)", boxShadow: "0 12px 28px rgba(15,118,110,0.28)", "&:hover": { background: "linear-gradient(135deg,#16a34a,#115e59)" } }}>Export PNG</Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="warning" sx={{ borderRadius: 3 }}>{error}</Alert>}
          {loading && (
            <Paper elevation={0} sx={{ p: 1.4, borderRadius: 3, display: "flex", alignItems: "center", gap: 1.2, color: "#475569" }}>
              <CircularProgress size={18} /> Loading latest dashboard data...
            </Paper>
          )}

          <SalesSummarySection summary={data.summary} salesFlow={data.salesFlow} range={summaryRange} onRangeChange={setSummaryRange} />
          <TransactionsSection rows={data.transactions} range={transactionsRange} onRangeChange={setTransactionsRange} transactionType={transactionType} onTransactionTypeChange={setTransactionType} />
          <PeakOffPeakSection data={data.peakHours} range={peakRange} onRangeChange={setPeakRange} />
          <AmountInHandSection amountInHand={data.amountInHand} />
        </Stack>
      </Box>
    </Box>
  );
}
