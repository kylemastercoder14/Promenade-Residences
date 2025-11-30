"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IconPrinter, IconDownload, IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";

interface DashboardStats {
  accounts: {
    total: number;
    byRole: Record<string, number>;
  };
  residents: {
    total: number;
    byType: Record<string, number>;
    byGender?: Record<string, number>;
    byAgeGroup?: Record<string, number>;
  };
  vehicles: {
    total: number;
    byType: Record<string, number>;
  };
  monthlyDues: {
    total: number;
    paid: number;
    pending: number;
    revenue: number;
  };
  lots: {
    total: number;
    available: number;
    owned: number;
  };
  reservations: {
    total: number;
    byStatus: Record<string, number>;
    revenue: number;
  };
  feedback: {
    total: number;
    byStatus: Record<string, number>;
  };
}

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DashboardStats;
  periodRange?: { start: Date; end: Date };
}

export const ReportDialog = ({ open, onOpenChange, stats, periodRange }: ReportDialogProps) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState({
    summaryOverview: true,
    moreInformation: true,
    totalResidentsPerBlock: false,
    residentInformationRecords: false,
  });
  const [reportNumber] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<{ name: string | null; email: string | null } | null>(null);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user) {
        setCurrentUser({
          name: session.data.user.name || null,
          email: session.data.user.email || null,
        });
      }
    });
  }, []);

  const handleTableToggle = (key: keyof typeof selectedTables) => {
    setSelectedTables((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    // Generate report content
    const reportContent = generateReportContent();

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dashboard Report</title>
          <style>
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: black;
              margin: 0;
              padding: 20px;
            }
            .header {
              border-bottom: 2px solid black;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 4px 0;
            }
            .date-info {
              font-size: 14px;
              margin: 4px 0;
            }
            .info-row {
              margin: 8px 0;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .section {
              margin-bottom: 24px;
            }
            h2 {
              font-size: 18px;
              font-weight: bold;
              margin: 16px 0 8px 0;
            }
            h3 {
              font-size: 16px;
              font-weight: bold;
              margin: 12px 0 6px 0;
            }
          </style>
        </head>
        <body>
          ${reportContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleExportPDF = () => {
    // For now, just trigger print which can be saved as PDF
    handlePrint();
  };

  const generateReportContent = () => {
    const userCount = stats?.accounts?.byRole?.USER || 0;
    const adminCount = (stats?.accounts?.byRole?.ADMIN || 0) +
                      (stats?.accounts?.byRole?.SUPERADMIN || 0) +
                      (stats?.accounts?.byRole?.ACCOUNTING || 0);

    const preparedBy = currentUser?.name || "Admin";
    const contactInfo = currentUser?.email || "";
    const phoneNumber = "0923-123-5567"; // This could come from settings

    const dateRange = fromDate && toDate
      ? `${format(new Date(fromDate), "MM/dd/yyyy")} - ${format(new Date(toDate), "MM/dd/yyyy")}`
      : periodRange
      ? `${format(periodRange.start, "MM/dd/yyyy")} - ${format(periodRange.end, "MM/dd/yyyy")}`
      : format(new Date(), "MM/dd/yyyy");

    let content = `
      <div class="header">
        <h1>Dashboard Report</h1>
        <div class="date-info">Date: ${format(new Date(), "MM/dd/yyyy")}</div>
        ${reportNumber ? `<div class="info-row">Report no.: ${reportNumber}</div>` : ""}
        <div class="info-row">Prepared by: ${preparedBy}</div>
        <div class="info-row">Contact information: ${phoneNumber}, ${contactInfo}</div>
        <div class="info-row">Timeline: ${dateRange}</div>
      </div>
    `;

    if (selectedTables.summaryOverview) {
      content += `
        <div class="section">
          <h2>Summary Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Residents</td>
                <td>${stats?.residents?.total || 0}</td>
                <td>${stats?.residents?.byType?.RESIDENT || 0} Residents, ${stats?.residents?.byType?.TENANT || 0} Tenants</td>
              </tr>
              <tr>
                <td>Male</td>
                <td>${stats?.residents?.byGender?.MALE || 0}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Female</td>
                <td>${stats?.residents?.byGender?.FEMALE || 0}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Children (0-12)</td>
                <td>${stats?.residents?.byAgeGroup?.["0-12"] || 0}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Youth (13-29)</td>
                <td>${stats?.residents?.byAgeGroup?.["13-29"] || 0}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Adult (30-59)</td>
                <td>${stats?.residents?.byAgeGroup?.["30-59"] || 0}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Elderly (60-above)</td>
                <td>${stats?.residents?.byAgeGroup?.["60+"] || 0}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedTables.moreInformation) {
      content += `
        <div class="section">
          <h2>More Information</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Accounts</td>
                <td>${stats?.accounts?.total || 0}</td>
                <td>${userCount} Users, ${adminCount} Admins</td>
              </tr>
              <tr>
                <td>Registered Vehicles</td>
                <td>${stats?.vehicles?.total || 0}</td>
                <td>${stats?.vehicles?.byType?.SEDAN || 0} Sedan, ${stats?.vehicles?.byType?.SUV || 0} SUV</td>
              </tr>
              <tr>
                <td>Monthly Dues</td>
                <td>${stats?.monthlyDues?.paid || 0} / ${stats?.monthlyDues?.total || 0}</td>
                <td>${stats?.monthlyDues?.paid || 0} Paid, ${stats?.monthlyDues?.pending || 0} Pending</td>
              </tr>
              <tr>
                <td>Available Lots</td>
                <td>${stats?.lots?.available || 0}</td>
                <td>${stats?.lots?.available || 0} Vacant, ${stats?.lots?.owned || 0} Owned</td>
              </tr>
              <tr>
                <td>Amenity Reservations</td>
                <td>${stats?.reservations?.total || 0}</td>
                <td>${stats?.reservations?.byStatus?.APPROVED || 0} Approved, ${stats?.reservations?.byStatus?.PENDING || 0} Pending</td>
              </tr>
              <tr>
                <td>Total Revenue</td>
                <td>₱${((stats?.monthlyDues?.revenue || 0) + (stats?.reservations?.revenue || 0)).toLocaleString()}</td>
                <td>Dues: ₱${(stats?.monthlyDues?.revenue || 0).toLocaleString()}, Reservations: ₱${(stats?.reservations?.revenue || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Feedback</td>
                <td>${stats?.feedback?.total || 0}</td>
                <td>${stats?.feedback?.byStatus?.NEW || 0} New, ${stats?.feedback?.byStatus?.RESOLVED || 0} Resolved</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedTables.totalResidentsPerBlock) {
      content += `
        <div class="section">
          <h2>Total Residents per Block</h2>
          <p>This section would show residents grouped by block/lot.</p>
        </div>
      `;
    }

    if (selectedTables.residentInformationRecords) {
      content += `
        <div class="section">
          <h2>Resident Information Records</h2>
          <p>This section would show detailed resident records.</p>
        </div>
      `;
    }

    return content;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl! max-h-[90vh]! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#327248]">Create Report</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Left Panel - Report Options */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Report Options</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from-date">From:</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-date">To:</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Tables</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="summary-overview"
                        checked={selectedTables.summaryOverview}
                        onCheckedChange={() => handleTableToggle("summaryOverview")}
                      />
                      <label htmlFor="summary-overview" className="text-sm cursor-pointer">
                        Summary Overview
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="more-information"
                        checked={selectedTables.moreInformation}
                        onCheckedChange={() => handleTableToggle("moreInformation")}
                      />
                      <label htmlFor="more-information" className="text-sm cursor-pointer">
                        More Information
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="total-residents-per-block"
                        checked={selectedTables.totalResidentsPerBlock}
                        onCheckedChange={() => handleTableToggle("totalResidentsPerBlock")}
                      />
                      <label htmlFor="total-residents-per-block" className="text-sm cursor-pointer">
                        Total Residents per Block
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resident-information-records"
                        checked={selectedTables.residentInformationRecords}
                        onCheckedChange={() => handleTableToggle("residentInformationRecords")}
                      />
                      <label htmlFor="resident-information-records" className="text-sm cursor-pointer">
                        Resident Information Records
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Report Preview */}
          <div className="space-y-4 border-l pl-6">
            <h3 className="font-semibold">Report Preview</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="font-semibold">Dashboard Report</div>
              <div>Date: {format(new Date(), "MM/dd/yyyy")}</div>
              {reportNumber && <div>Report no.: {reportNumber}</div>}
              <div>Prepared by: {currentUser?.name || "Admin"}</div>
              <div>Contact information: 0923-123-5567, {currentUser?.email || ""}</div>
              <div>Timeline: {
                fromDate && toDate
                  ? `${format(new Date(fromDate), "MM/dd/yyyy")} - ${format(new Date(toDate), "MM/dd/yyyy")}`
                  : periodRange
                  ? `${format(periodRange.start, "MM/dd/yyyy")} - ${format(periodRange.end, "MM/dd/yyyy")}`
                  : format(new Date(), "MM/dd/yyyy")
              }</div>

              {selectedTables.summaryOverview && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">Summary Overview</div>
                  <div className="text-xs space-y-1">
                    <div>Total Residents: {stats?.residents?.total || 0}</div>
                    <div>Male: {stats?.residents?.byGender?.MALE || 0}</div>
                    <div>Female: {stats?.residents?.byGender?.FEMALE || 0}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <IconX className="h-4 w-4" />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExportPDF}>
            <IconDownload className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <IconPrinter className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

