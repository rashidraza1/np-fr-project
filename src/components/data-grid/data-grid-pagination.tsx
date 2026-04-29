import { TablePagination, TablePaginationProps } from "@mui/material";
import MuiPagination from "@mui/material/Pagination";
import { gridPageCountSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";

import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";

function Pagination({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <MuiPagination
      variant="text"
      size="small"
      className={className}
      count={pageCount as number}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as never, newPage - 1);
      }}
    />
  );
}

export default function DataGridPagination(props: any) {
  return (
    <TablePagination
      {...props}
      component="div"
      ActionsComponent={Pagination}
      slotProps={{
        displayedRows: { className: "hidden!" },
        spacer: { className: "flex-none" },
        toolbar: { className: "px-0 flex justify-end" },
        selectLabel: {
          className: "hidden!",
        },
        select: {
          IconComponent: () => {
            return (
              <NiChevronDownSmall size="medium" className="pointer-events-none absolute end-1"></NiChevronDownSmall>
            );
          },
          className: "hidden!",
        },
      }}
    />
  );
}

function PaginationFullPage({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <MuiPagination
      variant="text"
      size="medium"
      className={className}
      count={pageCount as number}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as never, newPage - 1);
      }}
    />
  );
}

export function DataGridPaginationFullPage(props: any) {
  const {
    page: rawPage = 0,
    rowsPerPage: rawRowsPerPage = 10,
    count: rawCount = 0,
    ...otherProps
  } = props;

  // Ensure values are valid numbers to prevent NaN in display
  const page = Number.isNaN(Number(rawPage)) ? 0 : Number(rawPage);
  const rowsPerPage = Number.isNaN(Number(rawRowsPerPage)) ? 10 : Number(rawRowsPerPage);
  const count = Number.isNaN(Number(rawCount)) ? 0 : Number(rawCount);

  return (
    <TablePagination
      {...otherProps}
      page={page}
      rowsPerPage={rowsPerPage}
      count={count}
      component="div"
      ActionsComponent={(actionProps) => {
        return (
          <PaginationFullPage
            {...actionProps}
            page={page} // Pass the sanitized page
            className="surface-standard"
          />
        );
      }}
      slotProps={{
        displayedRows: { className: "text-text-secondary" },
        spacer: { className: "flex-none" },
        toolbar: { className: "px-0 flex justify-end items-center gap-4" },
        select: {
          IconComponent: () => {
            return (
              <NiChevronDownSmall size="medium" className="pointer-events-none absolute end-1"></NiChevronDownSmall>
            );
          },
        },
      }}
    />
  );
}
