import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { AdminService } from './AdminService';
import path from 'path';
import fs from 'fs';

export class ReportService {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async generateLibraryReport(res: Response): Promise<void> {
    try {
      const doc = new PDFDocument({ 
        margin: 40, 
        size: 'A4',
        bufferPages: true
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=library-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      doc.pipe(res);

      // Fetch data
      const stats = await this.adminService.getDashboardStats();
      const reportData = await this.adminService.generateReport();

      // Header with gradient background
      doc.rect(0, 0, 595, 120).fill('#EF4444');
      doc.fontSize(24).fillColor('#FFFFFF').text('የየካ ክፍለ ከተማ ቤተ መጻሕፍት', 40, 30, { align: 'center', width: 515, features: ['rtla'] });
      doc.fontSize(20).fillColor('#FFFFFF').text('Yeka Sub City Library', 40, 60, { align: 'center', width: 515 });
      doc.fontSize(12).fillColor('#FEE2E2').text('Monthly Activity Report', 40, 88, { align: 'center', width: 515 });
    
      doc.y = 140;
      doc.fontSize(10).fillColor('#6B7280').text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' });
      doc.moveDown(2);

      // Summary Section with modern cards
      doc.fontSize(16).fillColor('#1F2937').text('Key Statistics / ቁልፍ ስታትስቲክስ', { underline: false });
      doc.moveDown(0.5);

      const summaryData = [
        { label: 'Total Books', amharic: 'ጠቅላላ መጻሕፍት', value: stats.books.total, color: '#3B82F6' },
        { label: 'Total Members', amharic: 'ጠቅላላ አባላት', value: stats.users.total, color: '#10B981' },
        { label: 'Books Borrowed', amharic: 'የተበደሩ መጻሕፍት', value: stats.bookings.approved, color: '#F59E0B' },
        { label: 'Overdue Books', amharic: 'ዘግይተው የቀሩ', value: stats.bookings.overdue, color: '#EF4444' },
      ];

      let startY = doc.y;
      summaryData.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 40 + (col * 270);
        const y = startY + (row * 85);
        
        // Card background
        doc.rect(x, y, 250, 75).fill('#FFFFFF').stroke('#E5E7EB');
        
        // Color bar
        doc.rect(x, y, 5, 75).fill(item.color);
        
        // Text
        doc.fontSize(11).fillColor('#6B7280').text(item.label, x + 15, y + 12);
        doc.fontSize(9).fillColor('#9CA3AF').text(item.amharic, x + 15, y + 28);
        doc.fontSize(24).fillColor('#1F2937').text(item.value.toString(), x + 15, y + 45);
      });

      doc.y = startY + 190;

      // New Books Section
      if (reportData.newBooks && reportData.newBooks.length > 0) {
        doc.addPage();
        
        // Section header
        doc.rect(40, 40, 515, 35).fill('#3B82F6');
        doc.fontSize(16).fillColor('#FFFFFF').text('New Books This Month / በዚህ ወር አዲስ መጻሕፍት', 50, 50);
        doc.fontSize(11).fillColor('#DBEAFE').text(`${reportData.newBooks.length} books added`, 420, 53);
      
        doc.y = 95;

        reportData.newBooks.slice(0, 15).forEach((book: any, index: number) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 40;
          }
          
          // Book card
          doc.rect(40, doc.y, 515, 50).fill('#F9FAFB').stroke('#E5E7EB');
          doc.fontSize(11).fillColor('#1F2937').text(`${index + 1}. ${book.title}`, 50, doc.y + 10, { width: 495 });
          doc.fontSize(9).fillColor('#6B7280').text(`Author: ${book.author}`, 50, doc.y + 25);
          doc.fontSize(8).fillColor('#9CA3AF').text(`Category: ${book.category} | ISBN: ${book.isbn || 'N/A'}`, 50, doc.y + 38);
          
          doc.y += 55;
        });
      }

      // New Members Section
      if (reportData.newMembers && reportData.newMembers.length > 0) {
        doc.addPage();
        
        // Section header
        doc.rect(40, 40, 515, 35).fill('#10B981');
        doc.fontSize(16).fillColor('#FFFFFF').text('New Members This Month / በዚህ ወር አዲስ አባላት', 50, 50);
        doc.fontSize(11).fillColor('#D1FAE5').text(`${reportData.newMembers.length} members joined`, 410, 53);
      
        doc.y = 95;

        reportData.newMembers.slice(0, 20).forEach((member: any, index: number) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 40;
          }
          
          // Member row
          const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
          doc.rect(40, doc.y, 515, 35).fill(bgColor).stroke('#E5E7EB');
          doc.fontSize(10).fillColor('#1F2937').text(`${index + 1}. ${member.name}`, 50, doc.y + 8);
          doc.fontSize(8).fillColor('#6B7280').text(`${member.email}`, 50, doc.y + 22);
          doc.fontSize(8).fillColor('#9CA3AF').text(`Joined: ${new Date(member.createdAt).toLocaleDateString()}`, 400, doc.y + 22);
          
          doc.y += 35;
        });
      }

      // Popular Books Section
      if (reportData.popularBooks && reportData.popularBooks.length > 0) {
        doc.addPage();
        
        // Section header
        doc.rect(40, 40, 515, 35).fill('#F59E0B');
        doc.fontSize(16).fillColor('#FFFFFF').text('Most Popular Books / በጣም ተወዳጅ መጻሕፍት', 50, 50);
      
        doc.y = 95;

        reportData.popularBooks.forEach((book: any, index: number) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 40;
          }
          
          // Book card with ranking
          const rankColors = ['#EF4444', '#F59E0B', '#10B981'];
          const rankColor = index < 3 ? rankColors[index] : '#6B7280';
          
          doc.rect(40, doc.y, 515, 55).fill('#FFFBEB').stroke('#FDE68A');
          
          // Rank badge
          doc.circle(60, doc.y + 27, 15).fill(rankColor);
          doc.fontSize(12).fillColor('#FFFFFF').text((index + 1).toString(), 55, doc.y + 20);
          
          doc.fontSize(11).fillColor('#1F2937').text(book.title, 85, doc.y + 10, { width: 460 });
          doc.fontSize(9).fillColor('#6B7280').text(`by ${book.author}`, 85, doc.y + 25);
          doc.fontSize(8).fillColor('#92400E').text(`Borrowed: ${book.borrowCount || 0} times | Rating: ${book.rating?.average?.toFixed(1) || 'N/A'}`, 85, doc.y + 38);
          
          doc.y += 60;
        });
      }

      // Category Statistics
      doc.addPage();
      
      // Section header
      doc.rect(40, 40, 515, 35).fill('#8B5CF6');
      doc.fontSize(16).fillColor('#FFFFFF').text('Books by Category / መጻሕፍት በምድብ', 50, 50);
    
      doc.y = 95;

      if (stats.categories && stats.categories.length > 0) {
        stats.categories.forEach((cat: any, index: number) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 40;
          }
          
          const percentage = ((cat.totalBooks / stats.books.total) * 100).toFixed(1);
          
          // Category row
          doc.rect(40, doc.y, 515, 45).fill('#FAFAFA').stroke('#E5E7EB');
          doc.fontSize(11).fillColor('#1F2937').text(cat.category, 50, doc.y + 8);
          doc.fontSize(9).fillColor('#6B7280').text(`${cat.totalBooks} books (${percentage}%)`, 50, doc.y + 24);
          
          // Progress bar
          const barWidth = 350;
          const fillWidth = (cat.totalBooks / stats.books.total) * barWidth;
          doc.rect(180, doc.y + 25, barWidth, 12).fill('#E5E7EB');
          doc.rect(180, doc.y + 25, fillWidth, 12).fill('#8B5CF6');
          
          doc.y += 50;
        });
      }

      // Add page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        // Footer
        doc.rect(0, doc.page.height - 50, 595, 50).fill('#F3F4F6');
        doc.fontSize(8).fillColor('#6B7280').text(
          'የየካ ክፍለ ከተማ ቤተ መጻሕፍት - Yeka Sub City Library - Confidential Report',
          40,
          doc.page.height - 35,
          { align: 'center', width: 515 }
        );
        doc.fontSize(8).fillColor('#9CA3AF').text(
          `Page ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - 20,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to generate PDF report' });
      }
    }
  }
}
