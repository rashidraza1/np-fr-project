import { SyntheticEvent, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reshapeArabic } from "@/utils/arabic-reshaper";
import { arabicFontBase64 } from "@/utils/arabic-font";

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
    CircularProgress,
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
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiMinusSquare from "@/icons/nexture/ni-minus-square";
import NiPenSquare from "@/icons/nexture/ni-pen-square";

import NiSearch from "@/icons/nexture/ni-search";
import NiDuplicate from "@/icons/nexture/ni-duplicate";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";
import { useLayoutContext } from "@/components/layout/layout-context";


type Row = {
    id: string;
    kioskName: string;
    titleArabic: string;
    status: string;
    recycleNote: string;
    denomination: number;
}

export default function Page() {
    const { canEdit, canDelete } = usePermission("Kiosk");
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
    const [editPopupOpen, setEditPopupOpen] = useState(false);
    const [selectedKiosk, setSelectedKiosk] = useState<Row | null>(null);
    const [recycleRoutes, setRecycleRoutes] = useState<{ route: number, NoteValue: string }[]>([
        { route: 2, NoteValue: "" },
        { route: 3, NoteValue: "" },
        { route: 4, NoteValue: "" },
        { route: 5, NoteValue: "" }
    ]);
    const [availableDenominations, setAvailableDenominations] = useState<number[]>([]);
    const [editPopupLoading, setEditPopupLoading] = useState(false);
    const [viewPopupOpen, setViewPopupOpen] = useState(false);
    const [inventoryData, setInventoryData] = useState<any[]>([]);

    const handleOpenViewPopup = async (row: Row) => {
        setSelectedKiosk(row);
        setViewPopupOpen(true);
        setEditPopupLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/note_route_api.php?KioskID=${row.id}`);
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                setInventoryData(data.inventory || {});
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setEditPopupLoading(false);
        }
    };

    const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
        return {
            top: params.isFirstVisible ? 0 : 5,
            bottom: 5,
        };
    }, []);

    const fetchKiosks = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}api/kiosk_api.php`);
            if (filterSearch) url.searchParams.append("search", filterSearch);

            const response = await fetch(url.toString(), { method: "GET" });
            const data = await response.json();
            if (data.success && data.data) {
                const mappedRows = data.data.map((item: any) => ({
                    id: item.id,
                    kioskName: item.name,
                    titleArabic: item.TitleArabic || "",
                    status: item.IsActive == 1 ? "Active" : "Inactive",
                    //recycleNote: item.RecycleNote || "0",
                    //denomination: parseFloat(item.Denomination || "0"),
                }));
                setVisibleRows(mappedRows);
                setIsTableVisible(true);
            } else {
                setVisibleRows([]);
            }
        } catch (error) {
            console.error("Error fetching kiosks:", error);
            setVisibleRows([]);
        } finally {
            setLoading(false);
        }
    }, [filterSearch]);

    const handleSearch = () => {
        fetchKiosks();
    };

    const handleExportExcel = () => {
        if (visibleRows.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const dataToExport = visibleRows.map(row => ({
            "Name": row.kioskName,
            "Name (Arabic)": row.titleArabic,
            "Status": row.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kiosks");

        XLSX.writeFile(workbook, "Kiosks_List.xlsx", { bookType: 'xlsx', type: 'binary' });
        toast.success("Excel file downloaded successfully");
    };

    const handleExportPDF = () => {
        if (visibleRows.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const doc = new jsPDF();
        const tableColumn = ["Name", "Name (Arabic)", "Status"];
        const tableRows = visibleRows.map(row => [
            row.kioskName,
            row.titleArabic,
            row.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.text("Kiosks List", 14, 15);
        doc.save("Kiosks_List.pdf");
        toast.success("PDF file downloaded successfully");
    };


    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [kioskToDelete, setKioskToDelete] = useState<string | null>(null);

    const { fetchMenuPermissions, getFeaturePermissions } = useLayoutContext();

    const handleOpenEditPopup = async (row: Row) => {
        setSelectedKiosk(row);
        setEditPopupOpen(true);
        setEditPopupLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/note_route_api.php?KioskID=${row.id}`);
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                setAvailableDenominations(data.denominations || [5, 10, 20, 50, 100, 200, 500, 1000]);

                // Initialize defaults
                const newRoutes = [
                    { route: 2, NoteValue: "" },
                    { route: 3, NoteValue: "" },
                    { route: 4, NoteValue: "" },
                    { route: 5, NoteValue: "" }
                ];

                // Merge fetched data
                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach((d: any) => {
                        const idx = newRoutes.findIndex(r => r.route === parseInt(d.route));
                        if (idx !== -1) {
                            newRoutes[idx].NoteValue = d.NoteValue.toString();
                        }
                    });
                }
                setRecycleRoutes(newRoutes);
            }
        } catch (error) {
            console.error("Error fetching note routes:", error);
            toast.error("Failed to load recycle notes configuration");
        } finally {
            setEditPopupLoading(false);
        }
    };

    const handleUpdateKiosk = async () => {
        if (!selectedKiosk) return;

        // Validation for duplicate values
        const selectedValues = recycleRoutes.map(r => r.NoteValue).filter(v => v !== "");
        const uniqueValues = new Set(selectedValues);
        if (selectedValues.length !== uniqueValues.size) {
            toast.error("Duplicate values are not allowed. Please select unique note values for each recycle route.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}api/note_route_api.php?ID=${selectedKiosk.id}`,
                {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        KioskID: selectedKiosk.id,
                        routes: recycleRoutes.map(r => ({ route: r.route, NoteValue: r.NoteValue === "" ? null : parseInt(r.NoteValue) }))
                    }),
                }
            );
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                toast.success(data.message || "Recycle notes updated successfully");
                // Note: We don't need to re-fetch the main kiosk list since we aren't showing the individual routes there
                setEditPopupOpen(false);
            } else {
                toast.error(data.message || "Failed to update recycle notes");
            }
        } catch (error) {
            console.error("Error updating kiosk:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setKioskToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setKioskToDelete(null);
    };

    const handleDelete = async () => {
        if (!kioskToDelete) return;

        const freshPermissions = await fetchMenuPermissions();
        const modulePermissions: any = getFeaturePermissions("Kiosks", freshPermissions);
        const canDeleteFresh = modulePermissions?.DeletePermission === 1;

        if (!canDeleteFresh) {
            toast.error("You do not have permission to delete kiosks.");
            setDeleteDialogOpen(false);
            return;
        }

        setLoading(true);
        try {
            const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
            const userId = localStorage.getItem(`${storagePrefix}:userId`) || 1;

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=DeleteRSIGeneralMaster&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        MasterType: 4,
                        UserID: userId,
                        TableID: kioskToDelete,
                    }),
                }
            );
            const data = await response.json();
            if (data.status === "SUCCESS") {
                toast.success("Kiosk deleted successfully");
                fetchKiosks();
                await fetchMenuPermissions();
            } else {
                toast.error(data.message || "Failed to delete kiosk");
                await fetchMenuPermissions();
            }
        } catch (error) {
            console.error("Error deleting kiosk:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            handleCloseDeleteDialog();
        }
    };

    const columns: GridColDef<Row>[] = [
        { field: "id", headerName: "ID", width: 90, filterable: false },
        {
            field: "kioskName",
            headerName: "Title",
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
        // {
        //     field: "titleArabic",
        //     headerName: "Title Name (Arabic)",
        //     flex: 1,
        //     minWidth: 150,
        //     renderCell: (params: GridRenderCellParams<any, string>) => (
        //         <Box className="flex h-full items-center">
        //             <Typography variant="body2" className="text-text-primary">
        //                 {params.value}
        //             </Typography>
        //         </Box>
        //     ),
        // },
        {
            field: "status",
            headerName: "Status",
            align: "left",
            headerAlign: "left",
            width: 120,
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
            field: "recycleNote",
            headerName: "Recycler Info",
            width: 150,
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Box className="flex h-full items-center justify-between w-full pr-2">
                    <Typography variant="body2" className="text-text-primary">
                        {params.value}
                    </Typography>
                    <IconButton size="small" onClick={() => handleOpenEditPopup(params.row)}>
                        <NiPenSquare size="small" />
                    </IconButton>
                </Box>
            ),
        },
        {
            field: "denomination",
            headerName: "Denomination",
            width: 150,
            renderCell: (params: GridRenderCellParams<any, number>) => (
                <Box className="flex h-full items-center justify-between w-full pr-2">
                    <Typography variant="body2" className="text-text-primary">
                        {params.value}
                    </Typography>
                    <IconButton size="small" onClick={() => handleOpenViewPopup(params.row)}>
                        <NiEyeOpen size="small" />
                    </IconButton>
                </Box>
            ),
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
                if (canEdit) {
                    actions.push(
                        <GridActionsCellItem
                            key={1}
                            icon={<NiPenSquare size="medium" />}
                            label="Edit"
                            showInMenu
                            onClick={() => navigate(`/master-setups/kiosks/edit/${params.id}`, { state: params.row })}
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
                                    Payment machines
                                </Typography>
                                <Breadcrumbs>
                                    <Link color="inherit" to="/dashboard">
                                        Home
                                    </Link>
                                    <Link color="inherit" to="/pages">
                                        Master Setups
                                    </Link>
                                    <Typography variant="body2">Payment machines</Typography>
                                </Breadcrumbs>
                            </Grid>

                            {/* {canAdd && (
                                <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
                                    <Tooltip title="Add Item">
                                        <Button
                                            component={Link}
                                            to="/master-setups/kiosks/create"
                                            className="surface-standard"
                                            size="medium"
                                            color="grey"
                                            variant="surface"
                                            startIcon={<NiPlus size={"medium"} />}
                                        >
                                            Add New Record
                                        </Button>
                                    </Tooltip>
                                </Grid>
                            )} */}
                        </Grid>

                        <Grid container spacing={5} className="w-full" size={12}>
                            <Grid size={12}>
                                <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
                                    <Typography variant="h6" className="text-text-primary px-2">Payment machines Search</Typography>
                                    <Box className="flex w-full flex-row items-center gap-2">
                                        <FormControl variant="outlined" size="medium" className="mb-0 w-80">
                                            <InputLabel>Search</InputLabel>
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
                                                <MenuItem value="Active">Active</MenuItem>
                                                <MenuItem value="Inactive">Inactive</MenuItem>
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
                                        {visibleRows.length > 0 && (
                                            <Box className="flex flex-row items-center gap-2">
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
                        onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel) => {
                            setRowSelectionModel(rowSelectionModel);
                        }}
                        hideFooterSelectedRowCount
                        showToolbar
                    />
                </Grid>
            )}


            <Dialog
                open={editPopupOpen}
                onClose={() => setEditPopupOpen(false)}
                PaperProps={{ className: "rounded-xl w-full max-w-md" }}
            >
                <DialogTitle className="flex justify-between items-center">
                    <Typography variant="h6">Recycler Info - {selectedKiosk?.kioskName}</Typography>
                    <IconButton onClick={() => setEditPopupOpen(false)} size="small">
                        <NiCross size="medium" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {editPopupLoading ? (
                        <Box className="flex justify-center items-center py-10"><CircularProgress /></Box>
                    ) : (
                        <Box className="pt-4 flex flex-col gap-4">
                            {[1, 2, 3, 4].map((recycleIndex) => {
                                const routeNumber = recycleIndex + 1; // route 2,3,4,5
                                const routeData = recycleRoutes.find(r => r.route === routeNumber);
                                return (
                                    <FormControl variant="outlined" fullWidth key={`recycle-${recycleIndex}`}>
                                        <InputLabel>Cassette {recycleIndex}</InputLabel>
                                        <Select
                                            label={`Cassette ${recycleIndex}`}
                                            value={routeData?.NoteValue || ""}
                                            onChange={(e) => {
                                                const newRoutes = [...recycleRoutes];
                                                const rIdx = newRoutes.findIndex(r => r.route === routeNumber);
                                                if (rIdx !== -1) {
                                                    newRoutes[rIdx].NoteValue = e.target.value as string;
                                                    setRecycleRoutes(newRoutes);
                                                }
                                            }}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {availableDenominations.map(denom => (
                                                <MenuItem key={denom} value={denom.toString()}>{denom} AED</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                );
                            })}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions className="p-6">
                    <Button
                        onClick={() => setEditPopupOpen(false)}
                        color="grey"
                        variant="surface"
                        startIcon={<NiCross size="small" />}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateKiosk} color="primary" variant="contained" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        Are you sure you want to delete this kiosk? This action cannot be undone.
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

            <Dialog
                open={viewPopupOpen}
                onClose={() => setViewPopupOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ className: "rounded-2xl" }}
            >
                <DialogTitle className="flex justify-between items-center pt-0 pb-0 mt-0 mb-0 ">
                    <Typography variant="h6" className="pb-0 mt-0 mb-0">Denomination - {selectedKiosk?.kioskName}</Typography>
                    <IconButton onClick={() => setViewPopupOpen(false)} size="small">
                        <NiCross size="medium" />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="bg-gray-50 pt-0">
                    {editPopupLoading ? (
                        <Box className="flex justify-center items-center py-20"><CircularProgress /></Box>
                    ) : (
                        <Box className="flex flex-col gap-3">

                            {(() => {
                                const coinData = inventoryData[1] || { cashBox: 0, coinCount: 0, recycleCount: 0, totalNote: 0, amount: 0, coinCountAmount: 0 };
                                return (
                                    <Box className="flex items-center justify-between p-1 bg-white border border-red-100 rounded-xl shadow-sm mt-2">
                                        <Box className="flex items-center gap-4 w-1/4">
                                            <Box className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                                                {/* <Typography variant="h6" className="text-gray-400 font-bold">1</Typography> */}

                                                <img
                                                    src={"/images/dhiram/1.png"}
                                                    alt={"1 AED"}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.parentElement!.innerHTML = `<h6 class="text-gray-400 font-bold"> AED</h6>`;
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <Box className="flex flex-1 justify-center text-center">
                                            <Box>
                                                <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Available Coin</Typography>
                                                <Typography variant="h6" className="font-bold text-gray-800">{coinData.coinCount}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="w-1/4 text-right">
                                            <Typography variant="caption" className="text-teal-600 font-semibold block uppercase tracking-tight">Total Value</Typography>
                                            <Typography variant="h5" className="font-black text-slate-900">Đ {coinData.coinCountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                                        </Box>
                                    </Box>
                                );
                            })()}
                            {[5, 10, 20, 50, 100, 200, 500, 1000].map((val) => {
                                const denomData = inventoryData[val] || { cashBox: 0, recycleCount: 0, totalNote: 0, amount: 0 };
                                const recycleCount = denomData.recycleCount;
                                const cashBox = denomData.cashBox;
                                const totalNote = denomData.totalNote;
                                const amount = denomData.amount;

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
                                            <Box>
                                                <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Cash Box</Typography>
                                                <Typography variant="h6" className="font-bold text-gray-800">{cashBox}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Recycle Count</Typography>
                                                <Typography variant="h6" className="font-bold text-gray-800">{recycleCount}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Total Note</Typography>
                                                <Typography variant="h6" className="font-bold text-gray-800">{totalNote}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="w-1/4 text-right">
                                            <Typography variant="caption" className="text-teal-600 font-semibold block uppercase tracking-tight">Amount</Typography>
                                            <Typography variant="h5" className="font-black text-slate-900">Đ {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                                        </Box>
                                    </Box>
                                );
                            })}

                            {/* Coin Section */}
                            {/* {(() => {
                                const coinData = inventoryData[1] || { cashBox: 0, recycleCount: 0, totalNote: 0, amount: 0 };
                                return (
                                    <Box className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-xl shadow-sm mt-2">
                                        <Box className="flex items-center gap-4 w-1/4">
                                            <Box className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src="/images/dhiram/1.png"
                                                    alt="1 AED Coin"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </Box>
                                        </Box>
                                        <Box className="flex flex-1 justify-center text-center">
                                            <Box>
                                                <Typography variant="caption" className="text-orange-600 font-semibold block uppercase tracking-tight">Available Coin</Typography>
                                                <Typography variant="h6" className="font-bold text-gray-800">{coinData.cashBox}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="w-1/4 text-right">
                                            <Typography variant="caption" className="text-teal-600 font-semibold block uppercase tracking-tight">Total Value</Typography>
                                            <Typography variant="h5" className="font-black text-slate-900">Đ {coinData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                                        </Box>
                                    </Box>
                                );
                            })()} */}
                        </Box>
                    )}
                </DialogContent>
                <Box className="bg-black text-white p-6 flex justify-between items-center pt-1 pb-1">
                    <Typography variant="h5" className="font-bold">Grand Total</Typography>
                    <Box className="flex flex-1 justify-around text-center px-10">
                        <Box>
                            <Typography variant="caption" className="text-gray-400 block">Total Cash Box</Typography>
                            <Typography variant="body1" className="font-bold">
                                {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + curr.cashBox, 0)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-400 block">Total Recycle</Typography>
                            <Typography variant="body1" className="font-bold">
                                {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + curr.recycleCount, 0)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-400 block">Total Notes</Typography>
                            <Typography variant="body1" className="font-bold">
                                {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + curr.totalNote, 0)}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="h4" className="font-black text-green-500">
                        Đ {Object.values(inventoryData).reduce((acc: any, curr: any) => acc + curr.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                </Box>
                {/* <DialogActions className="p-4 rounded-b-2xl border-t">
                    <Button 
                        onClick={() => setViewPopupOpen(false)} 
                        color="grey" 
                        variant="surface" 
                        startIcon={<NiCross size="small" />}
                    >
                        Close
                    </Button>
                </DialogActions> */}
            </Dialog>

        </Grid>
    );
}
