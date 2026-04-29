import { useState, useEffect, useCallback } from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface MasterRecord {
    TableID: string;
    TitleEnglish: string;
}

interface DashboardFiltersProps {
    onFiltersChange: (filters: any) => void;
}

export default function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [period, setPeriod] = useState("Today");
    const [branchId, setBranchId] = useState("All");
    const [kioskId, setKioskId] = useState("All");

    const [branches, setBranches] = useState<MasterRecord[]>([]);
    const [kiosks, setKiosks] = useState<MasterRecord[]>([]);

    const fetchMasterList = useCallback(async (masterType: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralMasterList&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        MasterType: masterType,
                        IsActive: "1"
                    }),
                }
            );
            const data = await response.json();
            if (data.status === "SUCCESS" && data.data && data.data.RecordListing) {
                const records = Array.isArray(data.data.RecordListing) ? data.data.RecordListing : [data.data.RecordListing];
                if (masterType === 1) setBranches(records);
                if (masterType === 4) setKiosks(records);
            }
        } catch (error) {
            console.error(`Error fetching master list ${masterType}: `, error);
        }
    }, []);

    useEffect(() => {
        fetchMasterList(1); // Branches
        fetchMasterList(4); // Kiosks
    }, [fetchMasterList]);

    useEffect(() => {
        onFiltersChange({ fromDate, toDate, period, branchId, kioskId });
    }, [fromDate, toDate, period, branchId, kioskId, onFiltersChange]);

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        const today = dayjs();
        if (newPeriod === "Today") {
            setFromDate(today);
            setToDate(today);
        } else if (newPeriod === "Yesterday") {
            const yesterday = today.subtract(1, "day");
            setFromDate(yesterday);
            setToDate(yesterday);
        } else if (newPeriod === "Last 7 Days") {
            setFromDate(today.subtract(7, "days"));
            setToDate(today);
        } else if (newPeriod === "Last 30 Days") {
            setFromDate(today.subtract(30, "days"));
            setToDate(today);
        } else if (newPeriod === "Last Year") {
            setFromDate(today.subtract(1, "year"));
            setToDate(today);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} className="mb-6 bg-white p-4 rounded-xl shadow-sm items-center border border-gray-100">
                <Grid size={{ xs: 12, md: 2.4 }}>
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
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
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
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Period</InputLabel>
                        <Select
                            label="Period"
                            value={period}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                        >
                            <MenuItem value="Yesterday">Yesterday</MenuItem>
                            <MenuItem value="Today">Today</MenuItem>
                            <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                            <MenuItem value="Last Year">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Branch</InputLabel>
                        <Select
                            label="Branch"
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {branches.map((b) => (
                                <MenuItem key={b.TableID} value={b.TableID}>
                                    {b.TitleEnglish}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Kiosk</InputLabel>
                        <Select
                            label="Kiosk"
                            value={kioskId}
                            onChange={(e) => setKioskId(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {kiosks.map((k) => (
                                <MenuItem key={k.TableID} value={k.TableID}>
                                    {k.TitleEnglish}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
}
