import { Worker } from '@prisma/client';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { domainUrl, verificationPath } from './constants';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch {
    throw new Error('Failed to generate QR code');
  }
};

export const generateWorkerPDF = async (worker: Worker): Promise<Buffer> => {
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];

  // Collect buffer data
  doc.on('data', buffers.push.bind(buffers));

  // Add worker details
  doc.fontSize(16).text(`Name: ${worker.name}`, { continued: false });
  doc.text(`National ID: ${worker.nationalId}`);
  doc.text(`Serial ID: ${worker.serialId}`);
  doc.text(`Job Title: ${worker.jobTitle}`);
  doc.text(`Description: ${worker.description}`);

  // Add worker photo
  if (worker.photoUrl) {
    try {
      doc.image(worker.photoUrl, { width: 100, height: 100, align: 'center' });
    } catch {
      doc.text('Photo could not be loaded.');
    }
  }

  // Add QR Code
  const verificationUrl = `${domainUrl}/${verificationPath}/${worker.id}`;
  try {
    const qrCode = await generateQRCode(verificationUrl);
    const base64Image = qrCode.split(';base64,').pop();
    if (base64Image) {
      const qrBuffer = Buffer.from(base64Image, 'base64');
      doc.image(qrBuffer, { width: 100, height: 100, align: 'center' });
    }
  } catch {
    doc.text('QR Code could not be generated.');
  }

  // Finalize PDF and return as Buffer
  doc.end();
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
  });
};
