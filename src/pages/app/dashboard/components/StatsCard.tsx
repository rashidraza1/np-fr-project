import { Card, CardContent, Typography, Box } from "@mui/material";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";

interface StatsCardProps {
    title: string;
    value: string;
    subValue?: string;
    subLabel?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    footer?: React.ReactNode;
}

export default function StatsCard({
    title,
    value,
    subValue,
    subLabel,
    trend,
    trendValue,
    footer,
}: StatsCardProps) {
    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border-none">
            <CardContent className="flex flex-col h-full justify-between p-5">
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" className="font-bold mb-1">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" className="font-bold mb-1">
                        {value}
                    </Typography>
                    {subValue && (
                        <Typography variant="body2" color="text.secondary">
                            {subValue}
                        </Typography>
                    )}
                </Box>
                <Box className="mt-2">
                    {trend && trendValue && (
                        <Box className="flex items-center gap-1">
                            {trend === "up" && <NiArrowUp size="small" className="text-green-500" />}
                            {trend === "down" && <NiArrowDown size="small" className="text-red-500" />}
                            <Typography
                                variant="body2"
                                className={trend === "up" ? "text-green-500 font-bold" : trend === "down" ? "text-red-500 font-bold" : "text-gray-500"}
                            >
                                {trendValue}
                            </Typography>
                            {subLabel && <Typography variant="caption" color="text.secondary">{subLabel}</Typography>}
                        </Box>
                    )}
                    {footer}
                </Box>
            </CardContent>
        </Card>
    );
}
