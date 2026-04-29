import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Button, Divider, FormControl, FormLabel, Input, Paper, Typography } from "@mui/material";

import Logo from "@/components/logo/logo";

export default function Page() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const queryParams = new URLSearchParams({
        class: "general",
        action: "ForgotRSIGeneralSystemUserPassword",
        WebServiceUserName: "WebserviceUser",
        Password: "oqkq12345234",
      });

      const response = await fetch(`${baseUrl}/webservice/?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
        }),
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setMessage({ type: "success", text: data.message || "New password has been sent to your email address" });
        setTimeout(() => {
          navigate("/admin/sign-in");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Email not found" });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-[32rem] max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex justify-center">
              <Logo classNameMobile="hidden" />
            </Box>

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  Reset Password
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  Get an email about how to reset your password securely.
                </Typography>
              </Box>

              <Box className="flex flex-col gap-5">
                <Box component={"form"} onSubmit={handleSubmit} className="flex flex-col">
                  {message && (
                    <Box
                      className={`mb-4 p-3 rounded-md text-sm ${message.type === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                    >
                      {message.text}
                    </Box>
                  )}
                  <FormControl className="outlined" variant="standard" size="small">
                    <FormLabel component="label">Email</FormLabel>
                    <Input
                      placeholder=""
                      value={email}
                      type="email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>

                  <Box className="flex flex-col gap-2">
                    <Button type="submit" variant="contained" className="mb-4" disabled={loading}>
                      {loading ? "Sending..." : "Continue"}
                    </Button>
                  </Box>

                  {/* <Typography variant="body2" className="text-text-secondary">
                    By clicking Continue, Sign in with Google, or Sign in with GitHub, you agree to the{" "}
                    <Link target="_blank" to="/auth/terms-and-conditions" className="link-primary link-underline-hover">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link target="_blank" to="/auth/privacy-policy" className="link-primary link-underline-hover">
                      Privacy Policy
                    </Link>
                    .
                  </Typography> */}
                </Box>
              </Box>
              <Divider className="text-text-secondary my-0 text-sm"></Divider>
              <Box className="flex flex-col">
                <Typography variant="h6" component="h6">
                  Sign in
                </Typography>
                <Typography variant="body1" className="text-text-secondary">
                  If you already have an account, please{" "}
                  <Link to="/admin/sign-in" className="link-primary link-underline-hover">
                    sign in
                  </Link>
                  .
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
