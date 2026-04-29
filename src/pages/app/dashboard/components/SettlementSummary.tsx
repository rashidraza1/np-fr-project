import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import NiDownloadCloud from "@/icons/nexture/ni-download-cloud";

export default function SettlementSummary() {
    return (
        <Card className="shadow-sm rounded-xl border-none">
            <CardContent className="p-5">
                <Typography variant="h6" className="font-bold mb-6">Settlement Summary</Typography>

                <Box className="flex justify-between items-center mb-2">
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Settled Amount: <span className="text-black font-bold">AED 256,200</span></Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Pending Batches: <span className="text-black font-bold">4</span></Typography>
                    </Box>
                </Box>

                <Box className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <Typography variant="caption" color="text.secondary">Last Settlement: <span className="font-bold">22 Aug 2021, 09:45 AM</span></Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<NiDownloadCloud />}
                        className="normal-case shadow-none hover:shadow-md"
                        sx={{ backgroundColor: "var(--variant-containedBg)", color: "var(--variant-containedColor)" }}
                    >
                        Report Ticket
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
