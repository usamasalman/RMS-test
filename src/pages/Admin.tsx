import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, Key, LayoutDashboard, Settings, ShieldQuestion, UserCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/store/AuthContext";
import { useData } from "@/store/DataContext";
import { ALL_ROLES } from "@/types/roles";

const roleCapabilities: Record<string, string[]> = {
  Administrator: ["Full platform access", "Manage users and roles", "Create and delete records"],
  "CRO / Executive": ["Read all risk, control, and treatment data", "Approve escalations", "Review reports"],
  "Risk Owner": ["Manage assigned risks", "Create treatment plans", "Link controls to risks"],
  "Compliance Officer": ["Review control coverage", "Audit regulatory gaps", "Read reports"],
  "Internal Auditor": ["Read-only access", "Review evidence and history", "Cannot mutate records"],
  "Read-Only / Board Viewer": ["Summary access only", "Board-level reporting", "No mutation rights"],
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState("Access Overview");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileStatus, setProfileStatus] = useState<string>("");
  const { user, apiFetch, updateProfile } = useAuth();
  const { currentRole, users, orgUnits, risks, controls, assets, treatmentPlans } = useData();

  if (currentRole !== "Administrator") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <ShieldQuestion className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Your current role ({currentRole}) does not have privileges to view the Admin Center.
          Please contact an Administrator if you need access.
        </p>
      </div>
    );
  }

  const metrics = useMemo(
    () => [
      { label: "Users", value: users.length },
      { label: "Org Units", value: orgUnits.length },
      { label: "Risks", value: risks.length },
      { label: "Controls", value: controls.length },
      { label: "Assets", value: assets.length },
      { label: "Treatments", value: treatmentPlans.length },
    ],
    [users.length, orgUnits.length, risks.length, controls.length, assets.length, treatmentPlans.length],
  );

  const tabs = [
    { name: "Access Overview", icon: LayoutDashboard },
    { name: "Roles & Privileges", icon: Key },
    { name: "People", icon: Users },
    { name: "Security", icon: Settings },
  ];

  useEffect(() => {
    if (activeTab !== "People" || currentRole !== "Administrator") return;

    const loadUsers = async () => {
      const response = await apiFetch("/api/v1/admin/users");
      if (!response.ok) return;
      const data = await response.json();
      setAdminUsers(Array.isArray(data.users) ? data.users : []);
    };

    void loadUsers();
  }, [activeTab, apiFetch, currentRole]);

  useEffect(() => {
    setProfileName(user?.name || "");
  }, [user?.name]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">Admin Center</h2>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 shadow-sm">
          <UserCircle className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-900 mr-2">Active Role:</span>
          <span className="px-3 py-1 text-xs font-medium rounded-md bg-slate-900 text-white">
            {currentRole}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full lg:w-64 bg-white rounded-md border shadow-sm shrink-0 overflow-hidden">
          <div className="p-3">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === tab.name
                    ? "text-indigo-700 bg-indigo-50"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-white p-4 rounded-md border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-700">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="text-lg font-semibold text-slate-800">{activeTab}</h3>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                Export Access Snapshot
              </Button>
            </div>

            {activeTab === "Access Overview" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  {metrics.map((metric) => (
                    <Card key={metric.label} className="p-4 shadow-sm border-slate-200">
                      <p className="text-xs uppercase tracking-wider text-slate-500">{metric.label}</p>
                      <p className="text-3xl font-semibold text-slate-900 mt-2">{metric.value}</p>
                    </Card>
                  ))}
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#1e293b] text-white">
                        <TableRow className="hover:bg-[#1e293b]">
                          <TableHead className="text-slate-200 font-medium">Name</TableHead>
                          <TableHead className="text-slate-200 font-medium">Division</TableHead>
                          <TableHead className="text-slate-200 font-medium">Department</TableHead>
                          <TableHead className="text-slate-200 font-medium">Role</TableHead>
                          <TableHead className="text-slate-200 font-medium text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((person) => (
                          <TableRow key={person.id}>
                            <TableCell className="text-xs text-slate-800 font-medium">{person.name}</TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {orgUnits.find((unit) => unit.id === person.orgUnitId)?.division || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {orgUnits.find((unit) => unit.id === person.orgUnitId)?.department || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">{person.role}</TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Roles & Privileges" && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ALL_ROLES.map((role) => (
                  <Card key={role} className="p-4 border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-slate-900">{role}</h4>
                      {role === currentRole && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-slate-900 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {roleCapabilities[role].map((capability) => (
                        <li key={capability} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "People" && (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1e293b] text-white">
                      <TableRow className="hover:bg-[#1e293b]">
                        <TableHead className="text-slate-200 font-medium">Name</TableHead>
                        <TableHead className="text-slate-200 font-medium">Email</TableHead>
                        <TableHead className="text-slate-200 font-medium">Role</TableHead>
                        <TableHead className="text-slate-200 font-medium text-right">State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(adminUsers.length > 0 ? adminUsers : users).map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="text-xs text-slate-800 font-medium">{person.name}</TableCell>
                          <TableCell className="text-xs text-slate-600">{person.email || "N/A"}</TableCell>
                          <TableCell className="text-xs text-slate-600">{person.role}</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {activeTab === "Security" && (
              <div className="py-20 text-center text-slate-500">
                <div className="mx-auto w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                      {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-slate-800">Security Settings</h4>
                      <p className="text-sm text-slate-500">Live account settings backed by the auth API.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                      <span>Authentication</span>
                      <span className="font-medium text-emerald-700">JWT session active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-[#1e293b]"
                        onClick={async () => {
                          await updateProfile(profileName);
                          setProfileStatus("Profile updated via API.");
                        }}
                      >
                        Save Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setProfileName(user?.name || "")}
                      >
                        Reset
                      </Button>
                    </div>
                    {profileStatus && <p className="text-sm text-emerald-700">{profileStatus}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
