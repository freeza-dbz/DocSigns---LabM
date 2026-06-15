import { PDFDocument } from "pdf-lib";

export const embedSignaturesToPDF = async (cloudinaryUrl, signatureFields) => {
   
    const response = await fetch(cloudinaryUrl);
    const pdfBuffer = await response.arrayBuffer();
    
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    for (const field of signatureFields) {
        if (!field.isSigned || !field.signatureData) continue;
        
        const pageIndex = field.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;
        
        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const xPos = (field.x / 100) * pageWidth;
        
        const yPosTopDown = (field.y / 100) * pageHeight;
        const yPosBottomUp = pageHeight - yPosTopDown - field.height;

        let imageToEmbed;
        try {
            
            if (field.signatureData.startsWith('data:image/png')) {
                imageToEmbed = await pdfDoc.embedPng(field.signatureData);
            } else if (field.signatureData.startsWith('data:image/jpeg') || field.signatureData.startsWith('data:image/jpg')) {
                imageToEmbed = await pdfDoc.embedJpg(field.signatureData);
            }
            
            if (imageToEmbed) {
                page.drawImage(imageToEmbed, {
                    x: xPos,
                    y: yPosBottomUp,
                    width: field.width,
                    height: field.height,
                });
            }
        } catch (error) {
            console.error("Failed to embed signature image", error);
        }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};
