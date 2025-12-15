// Using global pdfjsLib loaded via script tag in index.html
declare const pdfjsLib: any;

export const extractTextFromPDF = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const pagesText: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine text items with spacing based on their transform or basic join
      // This basic join is usually sufficient for LLM processing as the LLM can infer structure
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pagesText.push(pageText);
    }

    return pagesText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to parse PDF file.");
  }
};