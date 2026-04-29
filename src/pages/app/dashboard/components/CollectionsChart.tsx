import { Card, CardContent, Typography, Box } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

interface CollectionsChartProps {
    cashData?: number[];
    cardData?: number[];
    totalData?: number[];
    labels?: string[];
}

export default function CollectionsChart({
    cashData = [],
    cardData = [],
    totalData = [],
    labels = []
}: CollectionsChartProps) {
    // If no data, show empty state or defaults
    const displayCash = (cashData && cashData.length > 0) ? cashData : [0, 0, 0, 0, 0, 0, 0];
    const displayCard = (cardData && cardData.length > 0) ? cardData : [0, 0, 0, 0, 0, 0, 0];
    const displayTotal = (totalData && totalData.length > 0) ? totalData : [0, 0, 0, 0, 0, 0, 0];
    const displayLabels = (labels && labels.length > 0) ? labels : ['12am', '4am', '8am', '12pm', '4pm', '8pm', '12am'];

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border-none bg-white">
            <CardContent className="p-5">
                <Box className="flex justify-between items-center mb-6">
                    <Typography variant="h6" className="font-bold">Collections & Transactions</Typography>

                </Box>

                <Box className="w-full h-[400px]">
                    <BarChart
                        series={[
                            { data: displayCash, label: 'Cash', id: 'cashId', color: '#1976d2' },
                            { data: displayCard, label: 'Card', id: 'cardId', color: '#d32f2f' },
                            { data: displayTotal, label: 'Total', id: 'totalId', color: '#4caf50' },
                        ]}
                        xAxis={[{
                            data: displayLabels,
                            scaleType: 'band',
                            tickLabelStyle: {
                                fontSize: 10,
                                textAnchor: 'middle',
                            }
                        }]}
                        height={380}
                        margin={{ bottom: 30, left: 60, right: 20, top: 10 }}
                        sx={{
                            [`.${axisClasses.left} .${axisClasses.label}`]: {
                                transform: 'translate(-20px, 0)',
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
