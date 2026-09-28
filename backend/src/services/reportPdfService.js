const { jsPDF } = require('jspdf');
require('jspdf-autotable');

/**
 * Builds a clean, professional PDF financial summary report for a student.
 */
const generateFinancialReportPdf = ({
  studentName,
  academicYear,
  reportTitle,
  period,
  currency = '$',
  summary = { totalIncome: 0, totalExpense: 0, balance: 0 },
  categoryBreakdown = [],
  budgetComparison = [],
  generatedAt = new Date().toLocaleString()
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Theme Colors
  const primaryColor = [245, 158, 11]; // Campus Coin Gold/Amber
  const darkNavy = [17, 24, 39];
  const slateGray = [100, 116, 139];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('CAMPUS COIN - FINANCIAL REPORT', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Spending, Student Style', 140, 15);

  // Report & Student Meta
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportTitle || 'Student Financial Summary', 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...slateGray);
  doc.text(`Student: ${studentName || 'Student'} (${academicYear || 'Undergraduate'})`, 14, 43);
  doc.text(`Period: ${period}`, 14, 49);
  doc.text(`Generated On: ${generatedAt}`, 14, 55);

  // KPI Metrics Boxes
  const startY = 62;
  const boxWidth = 58;
  const boxHeight = 22;

  // Box 1: Total Income
  doc.setFillColor(236, 253, 245); // light green
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL INCOME', 18, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${currency}${Number(summary.totalIncome).toFixed(2)}`, 18, startY + 16);

  // Box 2: Total Expense
  doc.setFillColor(254, 242, 242); // light red
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(76, startY, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text('TOTAL EXPENSE', 80, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${currency}${Number(summary.totalExpense).toFixed(2)}`, 80, startY + 16);

  // Box 3: Net Balance
  doc.setFillColor(239, 246, 255); // light blue
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(138, startY, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text('NET BALANCE', 142, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const balPrefix = summary.balance >= 0 ? '+' : '';
  doc.text(`${balPrefix}${currency}${Number(summary.balance).toFixed(2)}`, 142, startY + 16);

  let currentY = startY + boxHeight + 12;

  // Category Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkNavy);
  doc.text('Category-Wise Breakdown', 14, currentY);
  currentY += 4;

  const categoryRows = (categoryBreakdown || []).map((c) => [
    c.name,
    c.type.toUpperCase(),
    `${currency}${Number(c.total).toFixed(2)}`,
    `${Number(c.percentage || 0).toFixed(1)}%`
  ]);

  if (categoryRows.length === 0) {
    categoryRows.push(['No transactions recorded in this period', '-', `${currency}0.00`, '0%']);
  }

  doc.autoTable({
    startY: currentY,
    head: [['Category', 'Type', 'Amount', '% of Total']],
    body: categoryRows,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // Budget Comparison Table (if available)
  if (budgetComparison && budgetComparison.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkNavy);
    doc.text('Monthly Budget Performance', 14, currentY);
    currentY += 4;

    const budgetRows = budgetComparison.map((b) => [
      b.categoryName,
      `${currency}${Number(b.limitAmount).toFixed(2)}`,
      `${currency}${Number(b.actualSpent).toFixed(2)}`,
      `${currency}${Number(b.remaining).toFixed(2)}`,
      `${b.percentageConsumed}%`,
      b.status
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Category', 'Budget Limit', 'Spent', 'Remaining', 'Consumed', 'Status']],
      body: budgetRows,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
  }

  // Footer Disclaimer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...slateGray);
    doc.text(
      'Campus Coin Financial Intelligence System | Confidentially Generated for Student Record',
      14,
      288
    );
    doc.text(`Page ${i} of ${pageCount}`, 180, 288);
  }

  return doc.output('arraybuffer');
};

module.exports = {
  generateFinancialReportPdf
};
