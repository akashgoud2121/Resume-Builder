
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
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
          <style>
            /* Your global styles from globals.css should be included here for Puppeteer */
            /* This is a simplified version for demonstration */
            body {
              font-family: 'Roboto', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              background-color: #fff;
              color: #000;
            }
             .page-container {
                width: 210mm;
                min-height: 297mm;
                padding: 0.5in;
                background-color: #fff;
             }
             h1,h2,h3,h4,h5,h6 { color: #000; }
             h1 { font-size: 2.25rem; font-weight: 700; }
             h2 { font-size: 1.25rem; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #ccc; padding-bottom: 4px; margin-bottom: 12px; }
             a { color: #2962FF; text-decoration: none; }
             .text-gray-900 { color: #1a202c; }
             .text-gray-800 { color: #2d3748; }
             .text-gray-700 { color: #4a5568; }
             .text-gray-600 { color: #718096; }
             .font-bold { font-weight: 700; }
             .font-semibold { font-weight: 600; }
             .font-medium { font-weight: 500; }
             .text-sm { font-size: 0.875rem; }
             .text-3xl { font-size: 1.875rem; }
             .mb-8 { margin-bottom: 2rem; }
             .mb-6 { margin-bottom: 1.5rem; }
             .mb-4 { margin-bottom: 1rem; }
             .mb-3 { margin-bottom: 0.75rem; }
             .mb-2 { margin-bottom: 0.5rem; }
             .mb-1 { margin-bottom: 0.25rem; }
             .mt-1 { margin-top: 0.25rem; }
             .italic { font-style: italic; }
             .flex { display: flex; }
             .justify-center { justify-content: center; }
             .justify-between { justify-content: space-between; }
             .items-center { align-items: center; }
             .items-baseline { align-items: baseline; }
             .items-start { align-items: flex-start; }
             .gap-x-6 { column-gap: 1.5rem; }
             .gap-y-1 { row-gap: 0.25rem; }
             .gap-1.5 { gap: 0.375rem; }
             .flex-wrap { flex-wrap: wrap; }
             .text-center { text-align: center; }
             .tracking-tight { letter-spacing: -0.025em; }
             .tracking-wider { letter-spacing: 0.05em; }
             .uppercase { text-transform: uppercase; }
             .border-b-2 { border-bottom-width: 2px; }
             .border-gray-300 { border-color: #d2d6dc; }
             .pb-1 { padding-bottom: 0.25rem; }
             .pl-2 { padding-left: 0.5rem; }
             .flex-grow { flex-grow: 1; }
             .flex-shrink-0 { flex-shrink: 0; }
             .ml-4 { margin-left: 1rem; }
             .text-right { text-align: right; }
             .list-none { list-style-type: none; }
             .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
             .leading-relaxed { line-height: 1.625; }
             .break-inside-avoid { break-inside: avoid; }
             .section-header-no-break { page-break-after: avoid; }
            
            /* SVG icons need explicit sizing */
             svg {
                display: inline-block;
                width: 0.875rem; /* 14px */
                height: 0.875rem; /* 14px */
                vertical-align: middle;
             }
          </style>
        </head>
        <body>
          <div class="page-container">${htmlContent}</div>
        </body>
      </html>
    `;
    
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
    
    // Wait for fonts to be loaded
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
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
