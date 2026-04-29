import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    Box,
    Button,
    FilledInput,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Select,
    SelectProps,
    Typography,
    Breadcrumbs,
    Grid,
    Checkbox,
} from "@mui/material";
import { GridColDef, GridRowSpacingParams } from "@mui/x-data-grid";
import {
    GridRenderCellParams,
    GridRowSelectionModel,
    QuickFilter,
    QuickFilterClear,
    QuickFilterControl,
    Toolbar,
} from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";

import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiSearch from "@/icons/nexture/ni-search";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import { cn } from "@/lib/utils";
import { useLayoutContext } from "@/components/layout/layout-context";

interface GridRow {
    id: number | string;
    isHeader?: boolean;
    module: string;
    feature?: string;
    displayFeature?: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    sno?: number;
    [key: string]: any;
}

dayjs.extend(duration);
dayjs.extend(relativeTime);

function PermissionCheckbox(props: {
    value: boolean;
    id: number | string;
    onChange: (id: number | string, checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <Checkbox
            checked={props.value}
            onChange={(e) => props.onChange(props.id, e.target.checked)}
            size="small"
            disabled={props.disabled}
        />
    );
}

function GroupPermissionCheckbox(props: {
    module: string;
    field: string;
    rows: GridRow[];
    onChange: (module: string, field: string, checked: boolean) => void;
}) {
    const moduleRows = props.rows.filter((r) => r.module === props.module && !r.isHeader);
    const allChecked = moduleRows.every((r) => !!r[props.field]);
    const someChecked = moduleRows.some((r) => !!r[props.field]);
    const isIndeterminate = someChecked && !allChecked;

    return (
        <Button
            className="surface-standard"
            size="small"
            color="grey"
            variant="surface"
            onClick={() => props.onChange(props.module, props.field, !allChecked)}
            startIcon={
                <Checkbox
                    checked={allChecked}
                    indeterminate={isIndeterminate}
                    size="small"
                    className="p-0"
                    disableRipple
                />
            }
        >
            Select All
        </Button>
    );
}

function GlobalPermissionCheckbox(props: {
    field: string;
    rows: GridRow[];
    onChange: (field: string, checked: boolean) => void;
    label: string;
}) {
    const dataRows = props.rows.filter((r) => !r.isHeader);
    const allChecked = dataRows.every((r) => !!r[props.field]);
    const someChecked = dataRows.some((r) => !!r[props.field]);
    const isIndeterminate = someChecked && !allChecked;

    return (
        <Box className="flex flex-col items-center justify-center gap-0 cursor-pointer w-full h-full py-1" onClick={() => props.onChange(props.field, !allChecked)}>
            <Checkbox
                checked={allChecked}
                indeterminate={isIndeterminate}
                onChange={(e) => {
                    e.stopPropagation();
                    props.onChange(props.field, e.target.checked)
                }}
                size="small"
                className="p-0"
            />
            <Typography variant="caption" fontWeight="bold" className="leading-none mt-1">{props.label}</Typography>
        </Box>
    );
}

export default function SystemUserPermissionsPage() {
    const { fetchMenuPermissions } = useLayoutContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [userName, setUserName] = useState<string>(location.state?.userName || "User");

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: "include",
        ids: new Set(),
    });

    useEffect(() => {
        const fetchUserName = async () => {
            const baseUrl = import.meta.env.VITE_BASE_URL;

            if (!id) return;
            if (location.state?.userName) return;

            try {
                const response = await fetch(`${baseUrl}/webservice/?class=general&action=RSIGeneralSystemUsers&WebServiceUserName=WebserviceUser&Password=oqkq12345234`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        TableID: id,
                    }),
                });

                const data = await response.json();

                if (data.status === "SUCCESS" && data.data) {
                    let userData = data.data;
                    if (data.data.RecordListing) {
                        userData = Array.isArray(data.data.RecordListing) ? data.data.RecordListing[0] : data.data.RecordListing;
                    } else if (Array.isArray(data.data)) {
                        userData = data.data[0];
                    }
                    if (userData) {
                        setUserName(userData.FullNameEnglish || userData.FullNameArabic || "User");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        fetchUserName();
    }, [id, location.state]);

    const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
        return {
            top: params.isFirstVisible ? 0 : 5,
            bottom: 5,
        };
    }, []);

    // Initialize rows with headers
    const [rows, setRows] = useState<GridRow[]>([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            const baseUrl = import.meta.env.VITE_BASE_URL;

            if (!id) return;

            try {
                const queryParams = new URLSearchParams({
                    class: "general",
                    action: "RSIModulesWithFeaturesByUser",
                    WebServiceUserName: "WebserviceUser",
                    Password: "oqkq12345234",
                });

                const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ UserID: id }), // Send UserID instead of RoleID
                });

                const data = await response.json();

                if (data.status === "SUCCESS" && data.data?.RecordListing) {
                    const grouped: GridRow[] = [];
                    let globalIndex = 1;

                    data.data.RecordListing.forEach((mod: any) => {
                        // Add Module Header
                        grouped.push({
                            id: `header_${mod.ModuleID}`,
                            module: mod.ModuleTitleEnglish,
                            isHeader: true,
                            feature: "",
                            view: false,
                            create: false,
                            edit: false,
                            delete: false,
                        });

                        // Add Features
                        mod.Features?.forEach((feat: any) => {
                            grouped.push({
                                id: feat.FeatureID,
                                module: mod.ModuleTitleEnglish,
                                isHeader: false,
                                feature: feat.FeatureTitleEnglish,
                                displayFeature: feat.FeatureTitleEnglish,
                                view: feat.ReadPermission === 1,
                                create: feat.AddPermission === 1,
                                edit: feat.EditPermission === 1,
                                delete: feat.DeletePermission === 1,
                                sno: globalIndex++,
                            });
                        });
                    });
                    setRows(grouped);
                }
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            }
        };

        fetchPermissions();
    }, [id]);

    const handlePermissionChange = (field: string) => (id: number | string, checked: boolean) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: checked } : r))
        );
    };

    const handleGroupChange = (field: string) => (module: string, _field: string, checked: boolean) => {
        setRows((prev) =>
            prev.map((r) =>
                r.module === module && !r.isHeader ? { ...r, [field]: checked } : r
            )
        );
    };

    const handleGlobalChange = (field: string, checked: boolean) => {
        setRows((prev) =>
            prev.map((r) => (!r.isHeader ? { ...r, [field]: checked } : r))
        );
    };

    const handleMasterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setRows((prev) =>
            prev.map((r) => {
                if (r.isHeader) return r;
                return { ...r, view: checked, create: checked, edit: checked, delete: checked };
            })
        );
    };

    const dataRows = rows.filter((r) => !r.isHeader);
    const allMasterChecked = dataRows.length > 0 && dataRows.every((r) => r.view && r.create && r.edit && r.delete);
    const someMasterChecked = dataRows.some((r) => r.view || r.create || r.edit || r.delete);
    const isMasterIndeterminate = someMasterChecked && !allMasterChecked;

    const columns: GridColDef<GridRow>[] = [
        {
            field: "sno",
            headerName: "S.No",
            align: "center",
            headerAlign: "center",
            width: 70,
            editable: false,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (params.row.isHeader) return null;
                return (
                    <Box className="flex h-full items-center justify-center">
                        <Typography variant="body2" className="text-text-primary">
                            {params.value}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: "module",
            valueGetter: (_value, row) => row.isHeader ? row.module : `${row.module} ${row.displayFeature}`,
            headerName: "Module",

            align: "left",
            headerAlign: "left",
            flex: 1.5,
            minWidth: 250,
            editable: false,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (params.row.isHeader) {
                    return (
                        <Box className="flex h-full items-center">
                            <Typography variant="subtitle1" fontWeight="bold" className="text-primary">
                                {params.value}
                            </Typography>
                        </Box>
                    );
                }
                return (
                    <Box className="flex h-full items-center pl-4">
                        <Typography variant="subtitle2" className="text-text-primary" fontWeight="bold">
                            {params.row.displayFeature}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: "view",
            headerName: "View",
            align: "center",
            headerAlign: "center",
            width: 130,
            editable: false,
            renderHeader: () => (
                <GlobalPermissionCheckbox field="view" rows={rows} onChange={handleGlobalChange} label="View" />
            ),
            sortable: false,
            renderCell: (params: GridRenderCellParams<GridRow, boolean>) => {
                if (params.row.isHeader) {
                    return (
                        <Box className="flex h-full w-full items-center justify-center">
                            <GroupPermissionCheckbox module={params.row.module} field="view" rows={rows} onChange={handleGroupChange("view")} />
                        </Box>
                    );
                }
                return (
                    <Box className="flex h-full w-full items-center justify-center">
                        <PermissionCheckbox value={!!params.value} id={params.id} onChange={handlePermissionChange("view")} />
                    </Box>
                );
            },
        },
        {
            field: "create",
            headerName: "Create",
            align: "center",
            headerAlign: "center",
            width: 130,
            editable: false,
            renderHeader: () => (
                <GlobalPermissionCheckbox field="create" rows={rows} onChange={handleGlobalChange} label="Create" />
            ),
            sortable: false,
            renderCell: (params: GridRenderCellParams<GridRow, boolean>) => {
                if (params.row.isHeader) {
                    return (
                        <Box className="flex h-full w-full items-center justify-center">
                            <GroupPermissionCheckbox module={params.row.module} field="create" rows={rows} onChange={handleGroupChange("create")} />
                        </Box>
                    );
                }
                return (
                    <Box className="flex h-full w-full items-center justify-center">
                        <PermissionCheckbox value={!!params.value} id={params.id} onChange={handlePermissionChange("create")} />
                    </Box>
                );
            },
        },
        {
            field: "edit",
            headerName: "Edit",
            align: "center",
            headerAlign: "center",
            width: 130,
            editable: false,
            renderHeader: () => (
                <GlobalPermissionCheckbox field="edit" rows={rows} onChange={handleGlobalChange} label="Edit" />
            ),
            sortable: false,
            renderCell: (params: GridRenderCellParams<GridRow, boolean>) => {
                if (params.row.isHeader) {
                    return (
                        <Box className="flex h-full w-full items-center justify-center">
                            <GroupPermissionCheckbox module={params.row.module} field="edit" rows={rows} onChange={handleGroupChange("edit")} />
                        </Box>
                    );
                }
                return (
                    <Box className="flex h-full w-full items-center justify-center">
                        <PermissionCheckbox value={!!params.value} id={params.id} onChange={handlePermissionChange("edit")} />
                    </Box>
                );
            },
        },
        {
            field: "delete",
            headerName: "Delete",
            align: "center",
            headerAlign: "center",
            width: 130,
            editable: false,
            renderHeader: () => (
                <GlobalPermissionCheckbox field="delete" rows={rows} onChange={handleGlobalChange} label="Delete" />
            ),
            sortable: false,
            renderCell: (params: GridRenderCellParams<GridRow, boolean>) => {
                if (params.row.isHeader) {
                    return (
                        <Box className="flex h-full w-full items-center justify-center">
                            <GroupPermissionCheckbox module={params.row.module} field="delete" rows={rows} onChange={handleGroupChange("delete")} />
                        </Box>
                    );
                }
                return (
                    <Box className="flex h-full w-full items-center justify-center">
                        <PermissionCheckbox value={!!params.value} id={params.id} onChange={handlePermissionChange("delete")} />
                    </Box>
                );
            },
        },
    ];

    function CustomToolbar() {
        return (
            <Toolbar className="min-h-auto border-none">
                <Grid container spacing={2} className="mb-4 w-full items-center">
                    <Grid size="grow">
                        <FormControl variant="filled" size="medium" className="surface mb-0 w-full pt-0.25">
                            <InputLabel>Search</InputLabel>
                            <QuickFilter
                                render={() => (
                                    <QuickFilterControl
                                        render={({ ref, ...controlProps }, state) => (
                                            <FilledInput
                                                {...controlProps}
                                                inputRef={ref}
                                                endAdornment={
                                                    <>
                                                        <InputAdornment position="end" className={cn(state.value === "" && "hidden")}>
                                                            <QuickFilterClear edge="end">
                                                                <NiCross size="medium" className="text-text-disabled" />
                                                            </QuickFilterClear>
                                                        </InputAdornment>
                                                        <InputAdornment position="end" className={cn(state.value !== "" && "hidden")}>
                                                            <IconButton edge="end">
                                                                {<NiSearch size="medium" className="text-text-disabled" />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    </>
                                                }
                                            />
                                        )}
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size="auto">
                        <Button
                            className="surface-standard"
                            size="medium"
                            color="grey"
                            variant="surface"
                            onClick={() => handleMasterChange({ target: { checked: !allMasterChecked } } as any)}
                            startIcon={
                                <Checkbox
                                    checked={allMasterChecked}
                                    indeterminate={isMasterIndeterminate}
                                    size="small"
                                    className="p-0"
                                    disableRipple
                                />
                            }
                        >
                            Select All
                        </Button>
                    </Grid>
                </Grid>
            </Toolbar>
        );
    }

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
        const userId = localStorage.getItem(`${storagePrefix}:userId`);
        const baseUrl = import.meta.env.VITE_BASE_URL;

        if (!id || !userId) return;

        setSaving(true);
        try {
            const dataRows = rows.filter(r => !r.isHeader);
            const permissionsPayload = dataRows.map(row => ({
                FeatureID: row.id,
                ReadPermission: row.view ? 1 : 0,
                AddPermission: row.create ? 1 : 0,
                EditPermission: row.edit ? 1 : 0,
                DeletePermission: row.delete ? 1 : 0,
            }));

            const queryParams = new URLSearchParams({
                class: "general",
                action: "UpdateRSIGeneralFeaturePermissions",
                WebServiceUserName: "WebserviceUser",
                Password: "oqkq12345234",
            });

            const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    UserID: id,
                    CreatedBy: userId,
                    Permissions: permissionsPayload
                }),
            });

            const data = await response.json();

            if (data.status === "SUCCESS") {
                toast.success("Permissions updated successfully!");
                await fetchMenuPermissions();
                setTimeout(() => {
                    navigate("/administration/system-users");
                }, 1000);
            } else {
                toast.error(data.message || "Failed to update permissions");
            }

        } catch (error) {
            console.error("Failed to save permissions:", error);
            toast.error("An error occurred while saving permissions.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Grid container spacing={5} className="w-full" size={12}>
            <style>
                {`
                .MuiLicenseInfo-root,
                .MuiDataGrid-main > div:last-child[style*="position: absolute;"],
                [class^="MuiLicenseInfo-"],
                [class*=" MuiLicenseInfo-"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                `}
            </style>
            <ToastContainer />
            <Grid container spacing={2.5} className="w-full" size={12}>
                <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="h1" component="h1" className="mb-0">
                        User Permissions ({userName})
                    </Typography>
                    <Breadcrumbs>
                        <Link color="inherit" to="/dashboard">
                            Home
                        </Link>
                        <Link color="inherit" to="/administration">
                            Administration
                        </Link>
                        <Link color="inherit" to="/administration/system-users">
                            System Users
                        </Link>
                        <Typography variant="body2">Permissions</Typography>
                    </Breadcrumbs>
                </Grid>
                <Grid size={{ xs: 12, md: "auto" }}>
                    <Button
                        className="surface-standard"
                        size="medium"
                        color="grey"
                        variant="surface"
                        onClick={() => navigate("/administration/system-users")}
                        startIcon={<NiArrowLeft />}
                    >
                        Go Back
                    </Button>
                </Grid>
            </Grid>

            <Grid size={12}>
                <DataGridPro
                    rows={rows}
                    columns={columns}
                    initialState={{
                        columns: { columnVisibilityModel: { id: false } },
                    }}
                    pagination={false}
                    hideFooter
                    getRowSpacing={getRowSpacing}
                    rowHeight={68}
                    columnHeaderHeight={40}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10]}
                    className="full-page border-none"
                    slots={{
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
                                    <Select {...propsCasted} IconComponent={NiChevronDownSmall} MenuProps={{ className: "outlined" }} />
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
                        toolbar: CustomToolbar,
                    }}
                    rowSelectionModel={rowSelectionModel}
                    onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel) => {
                        setRowSelectionModel(rowSelectionModel);
                    }}
                    isRowSelectable={(params) => !params.row.isHeader}
                    hideFooterSelectedRowCount
                    showToolbar
                />
            </Grid>

            <Grid size={12} className="flex justify-end gap-2 mt-4">
                <Button
                    className="surface-standard"
                    size="medium"
                    color="primary"
                    variant="contained"
                    startIcon={<NiFloppyDisk size={"medium"} />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </Grid>
        </Grid>
    );
}
