import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dashboardService } from '../../../services/dashboardService';
import { noto_sans_ethiopic_regular_normal_base64 } from '../../../assets/NotoSansEthiopic';

const GenerateReport: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.generateReport();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  console.log('GenerateReport data:', reportData);

  const generatePdf = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    doc.addFileToVFS('NotoSansEthiopic-Regular.ttf', noto_sans_ethiopic_regular_normal_base64);
    doc.addFont('NotoSansEthiopic-Regular.ttf', 'NotoSansEthiopic', 'normal');
    doc.setFont('NotoSansEthiopic');

    // New Books
    const newBooksColumns = ["ID", "Title", "Author"];
    const newBooksRows: any = [];
    reportData.newBooks.forEach((book: any) => {
      newBooksRows.push([
        String(book.id ?? ''),
        String(book.title ?? ''),
        String(book.author ?? '')
      ]);
    });

    // New Members
    const newMembersColumns = ["ID", "Name", "Email"];
    const newMembersRows: any = [];
    reportData.newMembers.forEach((member: any) => {
      newMembersRows.push([
        String(member.id ?? ''),
        String(member.name ?? ''),
        String(member.email ?? '')
      ]);
    });

    // Popular Books
    const popularBooksColumns = ["ID", "Title", "Author"];
    const popularBooksRows: any = [];
    reportData.popularBooks.forEach((book: any) => {
      popularBooksRows.push([
        String(book.id ?? ''),
        String(book.title ?? ''),
        String(book.author ?? '')
      ]);
    });

    doc.text("Digital Library Report", 14, 15);

    autoTable(doc, {
      head: [newBooksColumns],
      body: newBooksRows,
      startY: 25,
      styles: { font: 'NotoSansEthiopic', fontStyle: 'normal' },
      didDrawPage: (data) => {
        doc.text("New Books", 14, 20);
      }
    });

    autoTable(doc, {
      head: [newMembersColumns],
      body: newMembersRows,
      styles: { font: 'NotoSansEthiopic', fontStyle: 'normal' },
      didDrawPage: (data) => {
        doc.text("New Members", 14, data.cursor?.y ? data.cursor.y - 5 : 0);
      }
    });

    autoTable(doc, {
      head: [popularBooksColumns],
      body: popularBooksRows,
      styles: { font: 'NotoSansEthiopic', fontStyle: 'normal' },
      didDrawPage: (data) => {
        doc.text("Popular Books", 14, data.cursor?.y ? data.cursor.y - 5 : 0);
      }
    });

    doc.save("Digital_Library_Report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generate Report</h2>
        <button
          onClick={generatePdf}
          className="btn-primary"
          disabled={!reportData || loading}
        >
          Download PDF
        </button>
      </div>
      {loading ? (
        <p>Loading report...</p>
      ) : reportData ? (
        <div>
          <h3 className="text-xl font-bold mb-2">New Books</h3>
          <ul>
            {reportData.newBooks.map((book: any) => (
              <li key={book.id}>{book.title}</li>
            ))}
          </ul>
          <h3 className="text-xl font-bold mt-4 mb-2">New Members</h3>
          <ul>
            {reportData.newMembers.map((member: any) => (
              <li key={member.id}>{member.name}</li>
            ))}
          </ul>
          <h3 className="text-xl font-bold mt-4 mb-2">Popular Books</h3>
          <ul>
            {reportData.popularBooks.map((book: any) => (
              <li key={book.id}>{book.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default GenerateReport;
