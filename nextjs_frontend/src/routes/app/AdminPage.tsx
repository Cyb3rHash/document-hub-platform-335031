import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShieldHalved, faKey, faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader } from "@/components/ui";
import { useCachedQuery } from "@/hooks/cache";
import { documentHubApi } from "@/api/documentHubApi";
import type { AdminStatsResponse, AdminUsersResponse } from "@/api/types";

// PUBLIC_INTERFACE
export default function AdminPage() {
  /** Admin page connected to backend admin endpoints (stats + users). */
  const stats = useCachedQuery<AdminStatsResponse>("admin:stats", async () => documentHubApi.adminStats(), {
    staleTimeMs: 10_000,
  });

  const users = useCachedQuery<AdminUsersResponse>("admin:users", async () => documentHubApi.adminUsers(), {
    staleTimeMs: 10_000,
  });

  const derived = useMemo(() => {
    const userCount = stats.data?.users ?? users.data?.items?.length ?? null;
    const admins = stats.data?.admins ?? null;
    const documents = stats.data?.documents ?? null;
    return { userCount, admins, documents };
  }, [stats.data, users.data]);

  const errorMessage = (e: unknown) =>
    typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Request failed.";

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Admin"
        subtitle="Manage users, roles, and platform policies for your workspace."
        actions={
          <>
            <Button variant="secondary" onClick={() => void stats.refetch()}>
              <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" disabled>
              Invite user
            </Button>
            <Button variant="secondary" disabled>
              Audit logs
            </Button>
          </>
        }
      />

      {(stats.error || users.error) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">Admin API not available</p>
              <p className="mt-1">
                {stats.error ? errorMessage(stats.error) : null}
                {stats.error && users.error ? " · " : null}
                {users.error ? errorMessage(users.error) : null}
              </p>
              <p className="mt-2 text-amber-800">
                If you are not an admin, the backend should return 401/403. If the endpoint path differs, update the
                candidates in <span className="font-mono">src/api/documentHubApi.ts</span> (single place).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardBody className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Users</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                {derived.userCount ?? (users.loading ? "…" : "—")}
              </p>
              <p className="mt-2 text-sm text-gray-600">{derived.admins != null ? `${derived.admins} admins` : "—"}</p>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documents</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                {derived.documents ?? (stats.loading ? "…" : "—")}
              </p>
              <p className="mt-2 text-sm text-gray-600">Across all owners</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <FontAwesomeIcon icon={faKey} className="h-5 w-5" />
            </span>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="User directory" subtitle="Assign roles and review access posture." right={<Button variant="secondary" disabled>Manage roles</Button>} />
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
              {(users.data?.items ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70">
                  <td className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
                    {row.email ?? row.full_name ?? row.id}
                  </td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.role ?? "—"}</td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.status ?? "—"}</td>
                  <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.last_active ?? "—"}</td>
                </tr>
              ))}

              {users.loading ? (
                <tr>
                  <td colSpan={4} className="border-b border-gray-100 px-6 py-6 text-sm text-gray-600">
                    Loading users…
                  </td>
                </tr>
              ) : null}

              {!users.loading && (users.data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="border-b border-gray-100 px-6 py-6 text-sm text-gray-600">
                    No users returned (or you do not have admin access).
                  </td>
                </tr>
              ) : null}
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
                  Admin endpoints must be enforced server-side. If you see 401/403, ensure your user is an admin per
                  backend policy.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
