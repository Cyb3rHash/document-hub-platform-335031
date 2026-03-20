import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShieldHalved, faKey, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader } from "@/components/ui";

// PUBLIC_INTERFACE
export default function AdminPage() {
  /** Admin page scaffold (UI only). */
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Admin"
        subtitle="Manage users, roles, and platform policies for your workspace."
        actions={
          <>
            <Button variant="secondary">Invite user</Button>
            <Button variant="secondary">Audit logs</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardBody className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Users</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">24</p>
              <p className="mt-2 text-sm text-gray-600">3 admins, 21 members</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
            </span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Policies</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Enabled</p>
              <p className="mt-2 text-sm text-gray-600">RLS-ready configuration</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gray-900 text-white ring-1 ring-gray-200">
              <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
            </span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">API keys</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">2</p>
              <p className="mt-2 text-sm text-gray-600">Rotation recommended</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <FontAwesomeIcon icon={faKey} className="h-5 w-5" />
            </span>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="User directory"
          subtitle="Assign roles and review access posture."
          right={<Button variant="secondary">Manage roles</Button>}
        />
        <div className="overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 bg-white">
              <tr>
                {["User", "Role", "Status", "Last active"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-gray-100 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { user: "alex@company.com", role: "admin", status: "active", last: "2h ago" },
                { user: "sam@company.com", role: "member", status: "active", last: "1d ago" },
                { user: "jordan@company.com", role: "member", status: "invited", last: "—" },
              ].map((row) => (
                <tr key={row.user} className="hover:bg-gray-50/70">
                  <td className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
                    {row.user}
                  </td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.role}</td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.status}</td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardBody>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Note</p>
                <p className="mt-1">
                  This is a UI scaffold. Connect to your backend/Supabase role model to enforce admin-only access.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
