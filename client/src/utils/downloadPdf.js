/**
 * downloadPdf — triggers a PDF file download in the browser
 * from a Blob response received from the API.
 *
 * Usage:
 *   const res = await admissionService.downloadLetter(id);
 *   downloadPdf(res.data, 'Admission-Letter.pdf');
 */
const downloadPdf = (blobData, filename) => {
  const url  = URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default downloadPdf;
