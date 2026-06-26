declare module "pdf-parse" {
  interface PDFParseOptions {
    max?: number;
    version?: string;
    pagerender?: (pageData: any) => string;
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
  }

  interface PDFParseData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
    pdfInfo: any;
  }

  function pdf(data: Buffer | Uint8Array | ArrayBuffer, options?: PDFParseOptions): Promise<PDFParseData>;
  export = pdf;
}
