import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFileLines,
  faLock,
  faArrowRight,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";

function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  trend: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardBody className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
          <p className="mt-2 text-sm text-gray-600">{trend}</p>
        </div>
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <FontAwesomeIcon icon={icon} className="h-5 w-5" />
        </span>
      </CardBody>
    </Card>
  );
}

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard overview page (UI-first; data hooks can be added later). */
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your library health, visibility, and engagement signals."
        actions={
          <>
            <Link href="/app/upload">
              <Button>
                <FontAwesomeIcon icon={faCloudArrowUp} className="h-4 w-4" />
                Upload document
              </Button>
            </Link>
            <Link href="/app/explore">
              <Button variant="secondary">
                Explore library <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Documents" value="128" icon={faFileLines} trend="12 added in the last 7 days" />
        <MetricCard label="Views (30d)" value="24.1k" icon={faChartLine} trend="Up 8% vs previous period" />
        <MetricCard label="Private assets" value="86%" icon={faLock} trend="Aligned with least-privilege defaults" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent documents"
            subtitle="Latest updates across your library."
            right={
              <Link href="/app/explore">
                <Button variant="ghost" className="px-3 py-2">
                  View all <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
          <div className="overflow-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {["Title", "Visibility", "Status", "Views"].map((h) => (
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
                  { title: "Quarterly Report", visibility: "Private", status: "Ready", views: "1,248" },
                  { title: "Product Brief", visibility: "Unlisted", status: "Ready", views: "842" },
                  { title: "Onboarding Guide", visibility: "Public", status: "Processing", views: "331" },
                  { title: "Security Review", visibility: "Private", status: "Ready", views: "98" },
                ].map((row) => (
                  <tr key={row.title} className="hover:bg-gray-50/70">
                    <td className="border-b border-gray-100 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                          <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{row.title}</p>
                          <p className="text-xs text-gray-500">Updated 2 days ago</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          row.visibility === "Public"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : row.visibility === "Unlisted"
                              ? "bg-blue-50 text-blue-700 ring-blue-100"
                              : "bg-gray-50 text-gray-700 ring-gray-200"
                        )}
                      >
                        {row.visibility}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">{row.status}</td>
                    <td className="border-b border-gray-100 px-6 py-4 text-sm tabular-nums text-gray-700">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Next actions" subtitle="Recommended based on your current state." />
          <CardBody className="grid gap-3">
            {[
              { title: "Finish processing", desc: "Review documents currently converting." },
              { title: "Tighten sharing", desc: "Audit public assets and confirm intent." },
              { title: "Add metadata", desc: "Improve discoverability with tags and owners." },
            ].map((row) => (
              <div key={row.title} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{row.title}</p>
                <p className="mt-1 text-sm text-gray-600">{row.desc}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
