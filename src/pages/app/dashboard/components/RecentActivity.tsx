import { Card, CardContent, Typography, Stack, Box } from "@mui/material";

const activities = [
    { time: "20 mins ago", text: "Cash Collection Due for Batch #1245", color: "bg-yellow-500" },
    { time: "25 mins ago", text: "Payment Failed on Kiosk AD-OS", color: "bg-red-500" },
    { time: "30 mins ago", text: "Order Expired: SO-789451", color: "bg-yellow-500" },
    { time: "40 mins ago", text: "Refund Issued: SO-532670", color: "bg-green-500" },
];

export default function RecentActivity() {
    return (
        <Card className="h-full shadow-sm rounded-xl border-none">
            <CardContent className="p-5">
                <Typography variant="h6" className="font-bold mb-6">Live Alerts & Incidents</Typography>
                <Stack spacing={2.5}>
                    {activities.map((item, index) => (
                        <Box key={index} className="flex items-start gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                            <Box>
                                <Typography variant="body2" className="text-gray-700 font-medium">{item.text}</Typography>
                                <Typography variant="caption" color="text.disabled">{item.time}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Box className="flex justify-center mt-6 gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
