import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { extractTextFromPDF } from './services/pdfService';
import { analyzeTextBatch } from './services/geminiService';
import { TextbookEntry, ProcessingStatus, PageBatchSize } from './types';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>({
    total: 0,
    current: 0,
    stage: 'idle'
  });
  const [data, setData] = useState<TextbookEntry[]>([]);

  const processPDF = useCallback(async (file: File) => {
    try {
      // 1. Extraction Stage
      setStatus({ total: 0, current: 0, stage: 'extracting' });
      const pagesText = await extractTextFromPDF(file);
      
      setStatus({ 
        total: pagesText.length, 
        current: 0, 
        stage: 'analyzing',
        message: 'Text extracted. Starting AI analysis...'
      });

      // 2. Analysis Stage (Batching)
      // We batch pages to optimize context window usage and provide progress updates
      const BATCH_SIZE = PageBatchSize.MEDIUM; 
      let allEntries: TextbookEntry[] = [];
      let lastChapterContext = "";

      for (let i = 0; i < pagesText.length; i += BATCH_SIZE) {
        const batch = pagesText.slice(i, i + BATCH_SIZE).join('\n');
        
        setStatus(prev => ({
          ...prev,
          current: Math.min(i + BATCH_SIZE, pagesText.length),
          message: `Analyzing pages ${i + 1} to ${Math.min(i + BATCH_SIZE, pagesText.length)}...`
        }));

        const { entries, lastChapter } = await analyzeTextBatch(batch, lastChapterContext);
        
        if (entries && entries.length > 0) {
          allEntries = [...allEntries, ...entries];
          // Update UI incrementally
          setData(prev => [...prev, ...entries]);
        }
        
        // Update context for next batch so AI knows which chapter it is in
        if (lastChapter) {
          lastChapterContext = lastChapter;
        }
      }

      setStatus({ total: pagesText.length, current: pagesText.length, stage: 'complete', message: 'Transcription complete!' });

    } catch (error) {
      console.error(error);
      setStatus(prev => ({
        ...prev,
        stage: 'error',
        message: 'An error occurred during processing. Please try again.'
      }));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Textbook Transcriber</h1>
          </div>
          <div className="text-sm text-slate-500">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-4 sm:p-6 lg:p-8">
        
        {/* Hero / Upload Section */}
        {status.stage === 'idle' && (
          <div className="text-center max-w-2xl mx-auto mb-12 mt-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Convert Textbook PDFs to Spreadsheets
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Automatically extract chapters, topics, and detailed content. 
              Intelligently ignores prefaces and indexes.
            </p>
            <FileUploader 
              onFileSelect={processPDF} 
              isProcessing={false}
            />
          </div>
        )}

        {/* Progress Section */}
        {(status.stage === 'extracting' || status.stage === 'analyzing') && (
          <div className="max-w-2xl mx-auto mt-10 text-center">
             <FileUploader 
              onFileSelect={() => {}} 
              isProcessing={true}
            />
            <div className="mt-8">
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${status.total > 0 ? (status.current / status.total) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-slate-700 font-medium animate-pulse">
                {status.message || 'Processing...'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {status.stage === 'analyzing' && `Processed ${status.current} of ${status.total} pages`}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status.stage === 'error' && (
          <div className="max-w-2xl mx-auto mt-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{status.message}</p>
            <button 
              onClick={() => setStatus({ total: 0, current: 0, stage: 'idle' })}
              className="ml-auto text-sm underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Completion Message */}
        {status.stage === 'complete' && (
          <div className="max-w-6xl mx-auto mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between text-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">{status.message}</span>
            </div>
            <button 
              onClick={() => {
                setStatus({ total: 0, current: 0, stage: 'idle' });
                setData([]);
              }}
              className="text-sm font-medium hover:underline"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Results */}
        <ResultsTable data={data} />

      </main>
    </div>
  );
};

export default App;