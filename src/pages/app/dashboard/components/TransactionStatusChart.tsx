import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface TransactionStatusChartProps {
    data: ChartData[];
}

export default function TransactionStatusChart({ data }: TransactionStatusChartProps) {
    const totalPercentage = data.reduce((sum, item) => sum + item.value, 0);
    const isEmpty = data.length === 0 || data.every(item => item.value === 0);

    // Default fields to show when empty to maintain layout consistency
    const displayData = !isEmpty ? data : [
        { label: 'Cash', value: 0, color: '#1976d2' },
        { label: 'Card', value: 0, color: '#90caf9' }
    ];

    return (
        <Card className="h-full shadow-sm rounded-xl border-none">
            <CardContent className="p-5">
                <Typography variant="h6" className="font-bold mb-6">Payment Method Status</Typography>
                <Box className="flex items-center justify-center gap-12 md:gap-24">
                    <Box className="relative">
                        <PieChart
                            series={[
                                {
                                    data: !isEmpty ? data : [{ label: 'Empty', value: 1, color: '#f5f5f5' }],
                                    innerRadius: 50,
                                    outerRadius: 80,
                                    paddingAngle: !isEmpty ? 2 : 0,
                                    cornerRadius: 4,
                                    cx: 90,
                                },
                            ]}
                            width={200}
                            height={200}
                            slotProps={{
                                legend: { position: 'none' as any },
                            }}
                        />
                        <Box className="absolute top-[75px] left-[55px] text-center w-[70px]">
                            <Typography variant="body2" className="text-gray-500 font-bold leading-tight">Total</Typography>
                            <Typography variant="h6" className="font-bold leading-none">{Math.round(totalPercentage)}%</Typography>
                        </Box>
                    </Box>
                    <Stack spacing={1} className="flex-1 ml-4 min-w-[120px]">
                        {displayData.map((item) => (
                            <Box key={item.label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <Typography variant="body2" className="flex-1 truncate">{item.label}</Typography>
                                <Typography variant="body2" className="font-bold">{item.value}%</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
