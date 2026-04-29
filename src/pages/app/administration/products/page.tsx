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
import NiSearch from "@/icons/nexture/ni-search";
import NiDuplicate from "@/icons/nexture/ni-duplicate";
import NiPlus from "@/icons/nexture/ni-plus";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";

interface Row {
  id: number;
  titleEn: string;
  titleAr: string;
  status: string;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const { canAdd, canEdit, canDelete } = usePermission("Products");
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nx";
      const userId = localStorage.getItem(`${storagePrefix}:userId`) || "a87ff679a2f3e71d9181a67b7542122c";

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/webservice/?class=general&action=RSIGeneralProducts&WebServiceUserName=WebserviceUser&Password=oqkq12345234`,
        {
          method: "POST",
          body: JSON.stringify({
            SecretKey: "TWpBeU5pOHdNaTh3TWc9PQ==",
            Lang: "en",
            UserID: userId,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "SUCCESS" && data.data?.RecordListing) {
        const mappedRows = data.data.RecordListing.map((item: any) => ({
          id: Number(item.TableID),
          titleEn: item.Title,
          titleAr: item.TitleArabic || "", // Try to get Arabic title from API
          status: item.IsActive === "1" ? "Active" : "Inactive",
        }));

        let filtered = mappedRows;
        if (filterStatus) {
          filtered = filtered.filter((r: Row) => r.status === filterStatus);
        }
        if (filterSearch) {
          filtered = filtered.filter((r: Row) => r.titleEn.toLowerCase().includes(filterSearch.toLowerCase()));
        }

        setVisibleRows(filtered);
        setIsTableVisible(true);
      } else {
        setVisibleRows([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setVisibleRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterSearch, filterStatus]);

  // useEffect(() => {
  //   fetchProducts();
  // }, [fetchProducts]);

  const handleSearch = () => {
    fetchProducts();
  };

  const handleExportExcel = () => {
    if (visibleRows.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = visibleRows.map(row => ({
      "Product Title (English)": row.titleEn,
      "Product Title (Arabic)": row.titleAr,
      "Status": row.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, "Products_List.xlsx", { bookType: 'xlsx', type: 'binary' });
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

    const tableColumn = ["Product Title (English)", "Product Title (Arabic)", "Status"];
    const tableRows = visibleRows.map(row => [
      row.titleEn,
      reshapeArabic(row.titleAr),
      row.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
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

    doc.text("Products List", 14, 15);
    doc.save("Products_List.pdf");
    toast.success("PDF file downloaded successfully");
  };

  const columns: GridColDef<Row>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "titleEn",
      headerName: "Title (English)",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "titleAr",
      headerName: "Title (Arabic)",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Box className="flex h-full items-center">
          <Typography variant="body2" className="text-text-primary">
            {params.value || "-"}
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
      renderCell: (params: GridRenderCellParams<Row, string>) => {
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
      align: "right",
      headerAlign: "right",
      getActions: (params) => {
        const actions = [];
        if (canEdit) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<NiPenSquare size="medium" />}
              label="Edit"
              showInMenu
              onClick={() => navigate(`/administration/products/edit/${params.id}`)}
            />
          );
        }
        if (canDelete) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<NiCrossSquare size="medium" />}
              label="Delete"
              showInMenu
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
                  Products
                </Typography>
                <Breadcrumbs>
                  <Link color="inherit" to="/dashboard">
                    Home
                  </Link>
                  <Link color="inherit" to="/administration">
                    Administration
                  </Link>
                  <Typography variant="body2">Products</Typography>
                </Breadcrumbs>
              </Grid>

              {canAdd && (
                <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
                  <Tooltip title="Add Product">
                    <Button
                      component={Link}
                      to="/administration/products/create"
                      className="surface-standard"
                      size="medium"
                      color="grey"
                      variant="surface"
                      startIcon={<NiPlus size={"medium"} />}
                    >
                      Add New Product
                    </Button>
                  </Tooltip>
                </Grid>
              )}
            </Grid>

            <Grid container spacing={5} className="w-full" size={12}>
              <Grid size={12}>
                <Box className="bg-white flex w-full flex-col items-start gap-4 rounded-2xl p-4 shadow-sm">
                  <Typography variant="h6" className="text-text-primary px-2">Product Search</Typography>
                  <Box className="flex w-full flex-row items-center gap-2">
                    <FormControl variant="outlined" size="medium" className="mb-0 w-80">
                      <InputLabel>Product Search</InputLabel>
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
                    >
                      Search
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
            pageSizeOptions={[10, 25, 50]}
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
            onRowSelectionModelChange={(rowSelectionModel) => {
              setRowSelectionModel(rowSelectionModel);
            }}
            hideFooterSelectedRowCount
            showToolbar
          />
        </Grid>
      )}
    </Grid>
  );
}
