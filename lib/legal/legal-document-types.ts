export type LegalDocumentContent = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: ReadonlyArray<{
    heading: string;
    paragraphs: readonly string[];
  }>;
};
