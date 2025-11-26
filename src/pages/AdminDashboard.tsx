// import React, { useEffect, useMemo, useState } from "react";
// import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
// import UsersAdmin from "../components/Admin/UsersAdmin";
// import UsersMatrix from "../components/Admin/UsersMatrix";
// import { useAuth } from "../App";

// const AdminDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [params, setParams] = useSearchParams();
//   const navigate = useNavigate();
//   const tabParam = params.get("tab");
//   const [tab, setTab] = useState<"domains" | "users">(tabParam === "users" ? "users" : "domains");

//   useEffect(() => {
//     const qp = new URLSearchParams(params);
//     qp.set("tab", tab);
//     setParams(qp, { replace: true });
//   }, [tab]);

//   if (!user) return <Navigate to="/login" replace />;
//   if (user.role !== "admin") return <Navigate to="/" replace />;

//   return (
//     <div className="p-6 space-y-4" style={{ fontFamily: "var(--font-sans)" }}>
//       <h1 className="text-2xl font-bold">Admin Console</h1>

//       <div className="flex gap-2 border-b border-[var(--color-border)]">
//         <button
//           className={[
//             "px-3 py-2 text-sm",
//             tab === "domains"
//               ? "border-b-2 border-[var(--color-primary)] text-[var(--color-foreground)]"
//               : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
//           ].join(" ")}
//           onClick={() => setTab("domains")}
//         >
//           Domains
//         </button>
//         <button
//           className={[
//             "px-3 py-2 text-sm",
//             tab === "users"
//               ? "border-b-2 border-[var(--color-primary)] text-[var(--color-foreground)]"
//               : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
//           ].join(" ")}
//           onClick={() => setTab("users")}
//         >
//           Users
//         </button>
//       </div>

//       {tab === "domains" ? <UsersMatrix /> : <UsersAdmin />}
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import UsersAdmin from "../components/Admin/UsersAdmin";
import UsersMatrix from "../components/Admin/UsersMatrix";
import { useAuth } from "../App";
import NewDomainDialog from "@/components/Documents/NewDomainDialog";

// Your HTTP client
import { api } from "@/api/http";



const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<"domains" | "users">(tabParam === "users" ? "users" : "domains");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const qp = new URLSearchParams(params);
    qp.set("tab", tab);
    setParams(qp, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const handleCreated = () => setRefreshKey((k) => k + 1);

  return (
    <div className="p-6 space-y-4" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Console</h1>
        {tab === "domains" && <NewDomainDialog onCreated={handleCreated} />}
      </div>

      <div className="flex gap-2 border-b border-[var(--color-border)]">
        <button
          className={[
            "px-3 py-2 text-sm",
            tab === "domains"
              ? "border-b-2 border-[var(--color-primary)] text-[var(--color-foreground)]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          ].join(" ")}
          onClick={() => setTab("domains")}
        >
          Domains
        </button>
        <button
          className={[
            "px-3 py-2 text-sm",
            tab === "users"
              ? "border-b-2 border-[var(--color-primary)] text-[var(--color-foreground)]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          ].join(" ")}
          onClick={() => setTab("users")}
        >
          Users
        </button>
      </div>

      {tab === "domains" ? <UsersMatrix key={refreshKey} /> : <UsersAdmin />}
    </div>
  );
};

export default AdminDashboard;
