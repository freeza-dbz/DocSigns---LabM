import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fetch from 'node-fetch';

/**
 * Embeds signatures into a PDF document.
 * @param {string} pdfUrl The URL of the original PDF document.
 * @param {Array<Object>} signatureFields An array of signature field objects, including signatureData (base64 image).
 * @returns {Promise<Uint8Array>} The bytes of the new PDF document with embedded signatures.
 */
export const embedSignaturesToPDF = async (pdfUrl, signatureFields) => {
    try {
        // 1. Fetch the original PDF
        const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

        // 2. Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // 3. Iterate through signature fields and embed them
        for (const field of signatureFields) {
            if (field.isSigned && field.signatureData) {
                const pageIndex = field.page - 1; // PDF-lib pages are 0-indexed
                if (pageIndex < 0 || pageIndex >= pdfDoc.getPages().length) {
                    console.warn(`Signature field for page ${field.page} is out of bounds. Skipping.`);
                    continue;
                }

                const page = pdfDoc.getPages()[pageIndex];

                // Convert percentage coordinates to actual pixel coordinates
                // field.x and field.y are top-left corner percentages. PDF-lib y-axis is from bottom-left.
                const { width: pageWidth, height: pageHeight } = page.getSize();
                const x = (field.x / 100) * pageWidth;
                const y = pageHeight - ((field.y / 100) * pageHeight) - field.height;

                const signatureImageBytes = Buffer.from(field.signatureData.split(',')[1], 'base64');
                const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

                page.drawImage(signatureImage, { x, y, width: field.width, height: field.height });
            }
        }
        return await pdfDoc.save();
    } catch (error) {
        console.error("Error embedding signatures to PDF:", error);
        throw new Error("Failed to embed signatures to PDF.");
    }
};