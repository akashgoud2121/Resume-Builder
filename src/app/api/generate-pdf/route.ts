import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { htmlContent } = await request.json();
    
    if (!htmlContent) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Add PDF generation class and wrap content
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; }
            .pdf-generation { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              line-height: 1.4; 
              color: #000; 
              background: #fff; 
              font-size: 11pt;
            }
            .pdf-generation [data-section] { break-inside: auto; page-break-inside: auto; }
            .pdf-generation h1, .pdf-generation h2, .pdf-generation h3 { 
              break-after: avoid; 
              page-break-after: avoid; 
              orphans: 2; 
              widows: 2; 
            }
            .pdf-generation ul, .pdf-generation ol { 
              break-inside: auto; 
              page-break-inside: auto; 
            }
            .pdf-generation li { 
              break-inside: avoid; 
              page-break-inside: avoid; 
              orphans: 2; 
              widows: 2; 
            }
            .pdf-generation .mb-4 { 
              break-inside: avoid; 
              page-break-inside: avoid; 
              orphans: 2; 
              widows: 2; 
            }
            .pdf-generation p { 
              orphans: 2; 
              widows: 2; 
              break-inside: auto; 
              page-break-inside: auto; 
            }
            .pdf-generation [data-section="contact"] { 
              break-inside: avoid; 
              page-break-inside: avoid; 
            }
          </style>
        </head>
        <body>
          <div class="pdf-generation">${htmlContent}</div>
        </body>
      </html>
    `;
    
    // Set the HTML content
    await page.setContent(wrappedHtml, { waitUntil: 'networkidle0' });

    // Generate PDF with proper page breaks
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
      displayHeaderFooter: false
    });

    await browser.close();

    // Return PDF as base64
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
