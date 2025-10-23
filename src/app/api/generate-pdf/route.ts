
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Decode the base64 image
    const imageBytes = Buffer.from(imageBase64.split(',')[1], 'base64');
    
    // Embed the image into the PDF
    const image = await pdfDoc.embedPng(imageBytes);

    // Get the image's dimensions
    const { width, height } = image.scale(1);
    
    // A4 dimensions in points: 595.28 x 841.89
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;
    
    // Add a page with A4 dimensions
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    
    // Calculate scaling to fit the image on the page
    const widthRatio = A4_WIDTH / width;
    const heightRatio = A4_HEIGHT / height;
    const ratio = Math.min(widthRatio, heightRatio);

    const scaledWidth = width * ratio;
    const scaledHeight = height * ratio;

    const x = (A4_WIDTH - scaledWidth) / 2;
    const y = A4_HEIGHT - scaledHeight; // Align to top

    // Draw the image on the page
    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
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
