import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Toolbar,
  TextField,
  CircularProgress,
} from "@mui/material";
import NiSave from "@/icons/nexture/ni-check-square";
import NiMail from "@/icons/nexture/ni-document-full";


type ConfigOption = {
  value: string;
  label: string;
};

type ConfigField = {
  id: number;
  label: string;
  type: 'text' | 'textarea' | 'password' | 'dropdown' | 'number';
  value: string;
  options: ConfigOption[];
};

type ConfigSection = {
  [fieldKey: string]: ConfigField;
};

type ApiResponse = {
  status: string;
  data: {
    sections: { [sectionKey: string]: ConfigSection };
    logs: any[];
  };
};

export default function EmailConfigPage() {
  const [sections, setSections] = useState<{ [sectionKey: string]: ConfigSection }>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/email_config_api.php`);
      const data: ApiResponse = await response.json();
      if (data.status === "SUCCESS") {
        setSections(data.data.sections);
      } else {
        toast.error("Failed to load configurations");
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("An error occurred while fetching settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleInputChange = (sectionKey: string, fieldKey: string, value: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: {
          ...prev[sectionKey][fieldKey],
          value: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      Object.keys(sections).forEach(sectionKey => {
        payload[sectionKey] = {};
        Object.keys(sections[sectionKey]).forEach(fieldKey => {
          payload[sectionKey][fieldKey] = sections[sectionKey][fieldKey].value;
        });
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}api/email_config_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: payload })
      });

      const data = await response.json();
      if (data.status === "SUCCESS") {
        toast.success("Configurations saved successfully");
        fetchConfig(); // Refresh to ensure decryption/etc is updated
      } else {
        toast.error(data.message || "Failed to save configurations");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("An error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex h-[80vh] items-center justify-center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Grid container spacing={5} className="pb-10">
      <ToastContainer />
      <Grid size={12}>
        <Toolbar className="min-h-auto border-none p-0!">
          <Grid container spacing={2.5} className="w-full">
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Email Alerts
              </Typography>
              <Breadcrumbs>
                <Link color="inherit" to="/dashboard">Home</Link>
                <Link color="inherit" to="/pages">Master Setups</Link>
                <Typography variant="body2">Email Alerts</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>
        </Toolbar>
      </Grid>

      {Object.keys(sections).map((sectionKey) => (
        <Grid size={{ xs: 12, md: sectionKey === 'SMTP' ? 12 : 6 }} key={sectionKey}>
          <Box className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
            <Box className="flex items-center gap-3 mb-6">
              <Box className="p-2 bg-primary/10 rounded-lg text-primary">
                <NiMail size="medium" />
              </Box>
              <Typography variant="h6" className="font-bold text-slate-800">
                {sectionKey.replace(/_/g, ' ')}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {Object.keys(sections[sectionKey]).map((fieldKey) => {
                const field = sections[sectionKey][fieldKey];
                return (
                  <Grid size={field.type === 'textarea' ? 12 : (sectionKey === 'SMTP' ? { xs: 12, md: 6 } : 12)} key={fieldKey}>
                    {field.type === 'dropdown' ? (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          label={field.label}
                          value={field.value}
                          onChange={(e) => handleInputChange(sectionKey, fieldKey, e.target.value as string)}
                          className="bg-slate-50/50"
                        >
                          {field.options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        label={field.label}
                        type={field.type}
                        value={field.value}
                        multiline={field.type === 'textarea'}
                        rows={field.type === 'textarea' ? 4 : 1}
                        onChange={(e) => handleInputChange(sectionKey, fieldKey, e.target.value)}
                        variant="outlined"
                        className="bg-slate-50/50"
                        InputProps={{
                          className: "rounded-lg"
                        }}
                      />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>
      ))}
      <Grid size={12} className="flex justify-end mt-4">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<NiSave />}
          onClick={handleSave}
          disabled={saving}
          className="h-[48px] px-8"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </Grid>

      {/* <Grid size={12}>
        <Box className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <Box className="flex items-center gap-3 mb-6">
            <Box className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <NiHistory size="medium" />
            </Box>
            <Typography variant="h6" className="font-bold text-slate-800">
              Sent Email Logs
            </Typography>
          </Box>

          <TableContainer component={Paper} className="shadow-none border border-slate-100 rounded-xl overflow-hidden">
            <Table>
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell className="font-bold text-slate-600">To Email</TableCell>
                  <TableCell className="font-bold text-slate-600">Subject</TableCell>
                  <TableCell className="font-bold text-slate-600">Message</TableCell>
                  <TableCell className="font-bold text-slate-600">Status</TableCell>
                  <TableCell className="font-bold text-slate-600">Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length > 0 ? logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.to_email}</TableCell>
                    <TableCell className="font-medium">{log.subject}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[300px] truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.status} 
                        size="small" 
                        color={log.status === 'SENT' ? 'success' : 'error'} 
                        variant="soft" 
                        className="font-medium"
                      />
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" className="py-10 text-slate-400">
                      No logs available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Grid> */}
    </Grid>
  );
}
