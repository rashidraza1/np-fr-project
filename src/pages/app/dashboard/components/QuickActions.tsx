import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import NiSearch from "@/icons/nexture/ni-search";
import NiPrinter from "@/icons/nexture/ni-printer";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiPlus from "@/icons/nexture/ni-plus";

export default function QuickActions() {
    return (
        <Card className="h-full bg-slate-700 text-white shadow-md rounded-xl border-none">
            <CardContent className="p-5">
                <Typography variant="h6" className="font-bold mb-4 text-white">Quick Actions</Typography>
                <Stack spacing={2}>
                    <Button
                        variant="text"
                        startIcon={<NiSearch />}
                        className="justify-start text-white hover:bg-slate-600"
                    >
                        Search Sales Order
                    </Button>
                    <Button
                        variant="text"
                        startIcon={<NiPrinter />}
                        className="justify-start text-white hover:bg-slate-600"
                    >
                        Reprint Receipt
                    </Button>
                    <Button
                        variant="text"
                        startIcon={<NiCheckSquare />}
                        className="justify-start text-white hover:bg-slate-600"
                    >
                        Check Settlement
                    </Button>
                    <Button
                        variant="text"
                        startIcon={<NiPlus />}
                        className="justify-start text-white hover:bg-slate-600"
                    >
                        Create Support Ticket
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
