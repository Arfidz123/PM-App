export declare function generatePdfHtml(
  activePopId: string | null | undefined,
  activePopName: string | null | undefined,
  activePopLocation: any,
  formData: any,
): string;

export declare function generateDownloadablePdfHtml(
  activePopId: string | null | undefined,
  activePopName: string | null | undefined,
  activePopLocation: any,
  formData: any,
): string;

export declare function generatePdfSections(
  activePopId: string | null | undefined,
  activePopName: string | null | undefined,
  activePopLocation: any,
  formData: any,
): Array<{ title: string; html: string }>;
