import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Box } from "@mui/material";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";

export interface SalesOrder {
    SalesOrderNumber: string;
    CompanyName: string;
    AmountDue: string | number;
}

export interface Payment {
    PaymentTypeText: string;
    PaymentType: number;
    AmountPaid: string | number;
}

export interface Transaction {
    TransactionDate: string;
    TransactionReferenceNumber: string;
    PaymentTypeText: string;
    CompanyName: string;
    MobileNumber: string;
    TotalAmountDue: number | string;
    BranchEnglish?: string;
    KioskEnglish?: string;
    PaymentType: number | string;
    salesOrders?: SalesOrder[];
    payments?: Payment[];
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    loading?: boolean;
    onViewDetails: (transaction: Transaction) => void;
}

export default function RecentTransactions({ transactions, loading, onViewDetails }: RecentTransactionsProps) {
    return (
        <Card className="h-full shadow-sm rounded-xl border-none">
            <CardContent className="p-5">
                <Box className="flex justify-between">
                    <Typography variant="h6" className="font-bold mb-6">Recent Transactions</Typography>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead className="surface-secondary">
                            <TableRow>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">S.No.</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Transaction date</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Transaction No.</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Payment Type</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Company name</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Mobile Number</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider text-right">Amount</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Branch</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider">Kiosk</TableCell>
                                <TableCell className="font-bold text-[10px] uppercase tracking-wider text-center">Order Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" className="py-10">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" className="py-10 text-text-secondary">
                                        No recent transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.slice(0, 10).map((row, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="text-text-secondary whitespace-nowrap">{row.TransactionDate}</TableCell>
                                        <TableCell>{row.TransactionReferenceNumber}</TableCell>
                                        <TableCell>{row.PaymentTypeText}</TableCell>
                                        <TableCell className="font-medium">{row.CompanyName}</TableCell>
                                        <TableCell>{row.MobileNumber}</TableCell>
                                        <TableCell className="font-bold text-right whitespace-nowrap">
                                            AED {Number(row.TotalAmountDue).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{row.BranchEnglish || "-"}</TableCell>
                                        <TableCell>{row.KioskEnglish || "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <IconButton size="small" color="primary" onClick={() => onViewDetails(row)}>
                                                <NiEyeOpen size="medium" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
