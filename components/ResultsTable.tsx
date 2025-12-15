import React from 'react';
import { TextbookEntry } from '../types';
import { Download, Table } from 'lucide-react';

interface ResultsTableProps {
  data: TextbookEntry[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = ["Chapter", "Topic", "Content"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => {
        // Escape quotes and handle newlines for CSV format
        const chapter = `"${row.chapter.replace(/"/g, '""')}"`;
        const topic = `"${row.topic.replace(/"/g, '""')}"`;
        const content = `"${row.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        return [chapter, topic, content].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'textbook_transcription.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (data.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Table className="w-5 h-5" />
          Transcribed Content ({data.length} rows)
        </h2>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 w-1/6 font-semibold">Chapter</th>
                <th className="p-4 w-1/5 font-semibold">Topic</th>
                <th className="p-4 font-semibold">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((entry, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-700 font-medium align-top">
                    {entry.chapter}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium align-top">
                    {entry.topic}
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-top leading-relaxed">
                    {entry.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};