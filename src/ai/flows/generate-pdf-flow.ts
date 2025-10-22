'use server';
/**
 * @fileOverview An AI flow for generating a PDF from HTML content using Puppeteer.
 *
 * - generatePdf - A function that takes an HTML string and returns a base64-encoded PDF.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import puppeteer from 'puppeteer';

const GeneratePdfInputSchema = z.object({
  htmlContent: z.string().describe('The HTML content to be converted to PDF.'),
});
export type GeneratePdfInput = z.infer<typeof GeneratePdfInputSchema>;

const GeneratePdfOutputSchema = z.object({
  pdfBase64: z.string().describe('The base64-encoded PDF file.'),
});
export type GeneratePdfOutput = z.infer<typeof GeneratePdfOutputSchema>;


export async function generatePdf(input: GeneratePdfInput): Promise<GeneratePdfOutput> {
  return generatePdfFlow(input);
}


const generatePdfFlow = ai.defineFlow(
  {
    name: 'generatePdfFlow',
    inputSchema: GeneratePdfInputSchema,
    outputSchema: GeneratePdfOutputSchema,
  },
  async ({ htmlContent }) => {
    let browser;
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      console.log('Setting page content...');
      // We need to wrap the content in a full HTML document for Puppeteer
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              /* You can inject global styles here if needed */
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      console.log('Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in',
        },
      });

      console.log('PDF generated successfully.');
      return {
        pdfBase64: pdfBuffer.toString('base64'),
      };
    } catch (error) {
      console.error('Error generating PDF with Puppeteer:', error);
      throw new Error('Failed to generate PDF.');
    } finally {
      if (browser) {
        console.log('Closing Puppeteer browser...');
        await browser.close();
      }
    }
  }
);
