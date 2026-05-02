export interface Env {
  // If you have D1 configured later, it would go here. e.g. DB: D1Database;
}

interface Staff {
  id: number;
  FullName: string;
  Email: string;
  EmpCode: string;
  PIN: string;
  Status: string;
  CreatedBy: string;
  CreationDateTime: string;
  ModifiedBy: string | null;
  ModificationDateTime: string | null;
}

// Mock database for ps_staffregistration
let staffData: Staff[] = [
  {
    id: 1,
    FullName: "John Doe",
    Email: "john@example.com",
    EmpCode: "EMP001",
    PIN: "1234",
    Status: "Active",
    CreatedBy: "Admin",
    CreationDateTime: new Date().toISOString(),
    ModifiedBy: null,
    ModificationDateTime: null
  }
];
let nextId = 2;

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Add CORS headers for local development if needed
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- STAFF REGISTRATION API ---
    if (url.pathname === "/api/staff") {
      
      // GET /api/staff (Listing)
      if (request.method === "GET") {
        const search = url.searchParams.get("search")?.toLowerCase() || "";
        const status = url.searchParams.get("status") || "";

        let filtered = staffData;
        if (search) {
          filtered = filtered.filter(s => 
            s.FullName.toLowerCase().includes(search) || 
            s.Email.toLowerCase().includes(search) ||
            s.EmpCode.toLowerCase().includes(search)
          );
        }
        if (status) {
          filtered = filtered.filter(s => s.Status === status);
        }

        return Response.json({
          status: "SUCCESS",
          data: filtered
        }, { headers: corsHeaders });
      }

      // POST /api/staff (Create)
      if (request.method === "POST") {
        try {
          const body = await request.json() as any;
          const newStaff: Staff = {
            id: nextId++,
            FullName: body.FullName,
            Email: body.Email,
            EmpCode: body.EmpCode,
            PIN: body.PIN,
            Status: body.Status || "Active",
            CreatedBy: body.CreatedBy || "Admin",
            CreationDateTime: new Date().toISOString(),
            ModifiedBy: null,
            ModificationDateTime: null
          };
          staffData.push(newStaff);

          return Response.json({
            status: "SUCCESS",
            message: "Staff created successfully",
            data: newStaff
          }, { headers: corsHeaders });
        } catch (e) {
          return Response.json({ status: "ERROR", message: "Invalid request body" }, { status: 400, headers: corsHeaders });
        }
      }
    }

    // Match /api/staff/:id
    const staffIdMatch = url.pathname.match(/^\/api\/staff\/(\d+)$/);
    if (staffIdMatch) {
      const staffId = parseInt(staffIdMatch[1], 10);
      const staffIndex = staffData.findIndex(s => s.id === staffId);

      if (staffIndex === -1) {
        return Response.json({ status: "ERROR", message: "Staff not found" }, { status: 404, headers: corsHeaders });
      }

      // GET /api/staff/:id (Get single staff for Edit)
      if (request.method === "GET") {
        return Response.json({
          status: "SUCCESS",
          data: staffData[staffIndex]
        }, { headers: corsHeaders });
      }

      // PUT /api/staff/:id (Update)
      if (request.method === "PUT") {
        try {
          const body = await request.json() as any;
          staffData[staffIndex] = {
            ...staffData[staffIndex],
            FullName: body.FullName !== undefined ? body.FullName : staffData[staffIndex].FullName,
            Email: body.Email !== undefined ? body.Email : staffData[staffIndex].Email,
            EmpCode: body.EmpCode !== undefined ? body.EmpCode : staffData[staffIndex].EmpCode,
            PIN: body.PIN !== undefined ? body.PIN : staffData[staffIndex].PIN,
            Status: body.Status !== undefined ? body.Status : staffData[staffIndex].Status,
            ModifiedBy: body.ModifiedBy || "Admin",
            ModificationDateTime: new Date().toISOString()
          };

          return Response.json({
            status: "SUCCESS",
            message: "Staff updated successfully",
            data: staffData[staffIndex]
          }, { headers: corsHeaders });
        } catch (e) {
          return Response.json({ status: "ERROR", message: "Invalid request body" }, { status: 400, headers: corsHeaders });
        }
      }

      // DELETE /api/staff/:id (Delete)
      if (request.method === "DELETE") {
        staffData.splice(staffIndex, 1);
        return Response.json({
          status: "SUCCESS",
          message: "Staff deleted successfully"
        }, { headers: corsHeaders });
      }
    }

    // Default API path
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare API",
      }, { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
