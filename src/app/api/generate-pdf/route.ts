
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { htmlContent } = await request.json();
    
    if (!htmlContent) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
    });

    const page = await browser.newPage();
    
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
          <style>
            /* Your existing styles for PDF generation are good. Let's keep them clean. */
            body { font-family: 'Roboto', 'Arial', 'Helvetica', sans-serif; }
            .page-container {
              width: 210mm;
              min-height: 297mm;
              padding: 0.5in;
              background: #fff;
              font-size: 11pt;
              line-height: 1.4;
            }
            .text-center { text-align: center; }
            .mb-8 { margin-bottom: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .font-bold { font-weight: 700; }
            .tracking-tight { letter-spacing: -0.025em; }
            .text-gray-900 { color: #111827; }
            .mb-3 { margin-bottom: 0.75rem; }
            .flex { display: flex; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .gap-x-6 { column-gap: 1.5rem; }
            .gap-y-1 { row-gap: 0.25rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-gray-700 { color: #374151; }
            .flex-wrap { flex-wrap: wrap; }
            .gap-1\\.5 { gap: 0.375rem; }
            a:hover { color: #2962FF; text-decoration: underline; }
            .h-3\\.5 { height: 0.875rem; }
            .w-3\\.5 { width: 0.875rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-gray-300 { border-color: #d1d5db; }
            .pb-1 { padding-bottom: 0.25rem; }
            .text-gray-800 { color: #1f2937; }
            .leading-relaxed { line-height: 1.625; }
            .font-semibold { font-weight: 600; }
            .mb-2 { margin-bottom: 0.5rem; }
            .flex-grow { flex-grow: 1; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .font-medium { font-weight: 500; }
            .text-gray-600 { color: #4b5563; }
            .text-right { text-align: right; }
            .flex-shrink-0 { flex-shrink: 0; }
            .ml-4 { margin-left: 1rem; }
            .items-baseline { align-items: baseline; }
            .mb-1 { margin-bottom: 0.25rem; }
            .italic { font-style: italic; }
            .mt-1 { margin-top: 0.25rem; }
            .list-none { list-style-type: none; }
            .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
            .pl-2 { padding-left: 0.5rem; }
            .mr-2 { margin-right: 0.5rem; }
             /* Page break control */
            [data-section], .mb-4 { break-inside: avoid-page; page-break-inside: avoid; }
            h1, h2, h3 { break-after: avoid-page; page-break-after: avoid; }
            li { break-inside: avoid; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    
    await page.setContent(wrappedHtml, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
