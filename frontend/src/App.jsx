// import React, { useState, useEffect } from 'react';
// import {
//   Upload,
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   Play,
//   Loader2,
//   Shield,
//   X,
//   Plus,
// } from 'lucide-react';

// const PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [pdfText, setPdfText] = useState('');
//   const [rules, setRules] = useState([
//     'The document must have a purpose section.',
//     'The document must mention at least one date.',
//     'The document must mention who is responsible.',
//   ]);

//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState('idle');
//   const [error, setError] = useState('');
//   const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

//   // Load PDF.js
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = PDF_JS_URL;
//     script.async = true;
//     script.onload = () => {
//       window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
//       setPdfLibLoaded(true);
//     };
//     document.body.appendChild(script);
//     return () => document.body.removeChild(script);
//   }, []);

//   // Extract PDF text (Client Side)
//   const extractPdfText = async (file) => {
//     if (!pdfLibLoaded) throw new Error('PDF.js still loading...');

//     const buffer = await file.arrayBuffer();
//     const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;

//     let all = '';
//     const pages = Math.min(pdf.numPages, 10);

//     for (let i = 1; i <= pages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       const text = content.items.map((x) => x.str).join(' ');
//       all += `[Page ${i}] ${text}\n`;
//     }
//     return all;
//   };

//   const handleFileChange = async (e) => {
//     const f = e.target.files[0];
//     if (!f) return;
//     if (f.type !== 'application/pdf') {
//       setError('Please upload a valid PDF');
//       return;
//     }

//     setFile(f);
//     setError('');
//     setResults(null);
//     setStatus('extracting');

//     try {
//       // We extract text here just to verify it's readable, 
//       // but the BACKEND will re-extract it from the file we send.
//       const text = await extractPdfText(f);
//       setPdfText(text);
//       setStatus('idle');
//     } catch (err) {
//       setError('Could not read PDF. Is it encrypted?');
//       setStatus('error');
//     }
//   };

//   const handleRuleChange = (i, v) => {
//     const updated = [...rules];
//     updated[i] = v;
//     setRules(updated);
//   };

//   const addRule = () => setRules([...rules, '']);

//   // --- CONNECT TO BACKEND ---
//   const handleCheckDocument = async () => {
//     if (!file) return setError('No PDF uploaded');
//     if (rules.length === 0) return setError('No rules defined');

//     setError('');
//     setLoading(true);
//     setStatus('analyzing');

//     try {
//       const formData = new FormData();
//       formData.append('pdf', file);
//       formData.append('rules', JSON.stringify(rules));

//       // Using FETCH instead of Axios to avoid dependency issues
//       const response = await fetch('http://localhost:5001/api/audit', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Server error occurred');
//       }

//       setResults(data.results || []);
//       setStatus('done');
//     } catch (err) {
//       console.error(err);
//       setError(err.message || 'Failed to connect to backend.');
//       setStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 text-gray-900 font-sans">
//       <div className="max-w-6xl mx-auto">
//         <Header />

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           <div className="lg:col-span-4 space-y-6">
//             <UploadCard file={file} status={status} onChange={handleFileChange} />
//             <RulesCard rules={rules} onChange={handleRuleChange} addRule={addRule} />
//             <ActionButton
//               onClick={handleCheckDocument}
//               loading={loading}
//               disabled={!file || !pdfText || status === 'extracting'}
//             />
//             {error && <ErrorBanner msg={error} />}
//           </div>

//           <div className="lg:col-span-8">
//             <ResultsPanel loading={loading} results={results} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- SUB-COMPONENTS ---

// const Header = () => (
//   <div className="flex items-center space-x-3 mb-8">
//     <div className="bg-blue-600 p-2 rounded-lg">
//       <Shield className="w-6 h-6 text-white" />
//     </div>
//     <div>
//       <h1 className="text-2xl font-bold">PDF Auditor</h1>
//       <p className="text-sm text-gray-500">MERN Stack • Powered by Gemini</p>
//     </div>
//   </div>
// );

// const UploadCard = ({ file, status, onChange }) => (
//   <div className="bg-white rounded-xl shadow-sm border p-5">
//     <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">1. Document</h2>
//     <input type="file" id="file-u" className="hidden" accept="application/pdf" onChange={onChange} />
//     <label htmlFor="file-u" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
//       {file ? (
//         <div className="text-center px-4">
//           <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
//           <p className="text-sm font-medium text-blue-900 truncate max-w-[200px]">{file.name}</p>
//           <p className="text-xs text-blue-600 mt-1">{status === 'extracting' ? 'Extracting...' : 'Ready'}</p>
//         </div>
//       ) : (
//         <div className="text-center">
//           <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//           <p className="text-sm text-gray-500">Upload PDF</p>
//         </div>
//       )}
//     </label>
//   </div>
// );

// const RulesCard = ({ rules, onChange, addRule }) => (
//   <div className="bg-white rounded-xl shadow-sm border p-5">
//     <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">2. Rules</h2>
//     <div className="space-y-3">
//       {rules.map((r, i) => (
//         <div key={i}>
//           <label className="text-xs text-gray-500 mb-1 block">Rule {i + 1}</label>
//           <input value={r} onChange={(e) => onChange(i, e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter a rule..." />
//         </div>
//       ))}
//     </div>
//     <button onClick={addRule} className="mt-3 flex items-center gap-2 text-blue-600 text-sm hover:underline font-medium">
//       <Plus className="w-4 h-4" /> Add Another Rule
//     </button>
//   </div>
// );

// const ActionButton = ({ onClick, loading, disabled }) => (
//   <button onClick={onClick} disabled={disabled} className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
//     {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Play className="w-4 h-4 fill-current" /> Run Audit</>}
//   </button>
// );

// const ErrorBanner = ({ msg }) => (
//   <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex gap-2 border border-red-100">
//     <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//     <p>{msg}</p>
//   </div>
// );

// const ResultsPanel = ({ loading, results }) => (
//   <div className="bg-white rounded-xl shadow-sm border min-h-[600px] flex flex-col">
//     <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
//       <h2 className="text-lg font-semibold text-gray-800">Audit Results</h2>
//       {results && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200">COMPLETE</span>}
//     </div>
//     <div className="flex-1 p-6">
//       {!results && !loading && (
//         <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
//           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
//             <FileText className="w-8 h-8 text-gray-300" />
//           </div>
//           <p>Ready to audit.</p>
//         </div>
//       )}
//       {loading && (
//         <div className="space-y-4 animate-pulse">
//           {[1, 2, 3].map((i) => <div key={i} className="bg-gray-50 p-4 rounded-lg h-24 border border-gray-100"></div>)}
//         </div>
//       )}
//       {results && (
//         <div className="space-y-4">
//           {results.map((r, i) => (
//             <div key={i} className="bg-white rounded-lg border shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
//               <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${r.status.toUpperCase() === 'PASS' ? 'bg-green-100' : 'bg-red-100'}`}>
//                 {r.status.toUpperCase() === 'PASS' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
//               </div>
//               <div className="flex-1">
//                 <div className="flex justify-between mb-1">
//                   <h3 className="font-medium text-gray-900 text-sm">{r.rule}</h3>
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs text-gray-400 font-mono">CONF: {r.confidence}%</span>
//                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.status.toUpperCase() === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-600 mb-3">{r.reasoning}</p>
//                 <div className="bg-gray-50 rounded border p-3">
//                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Evidence</p>
//                   <p className="text-xs text-gray-700 italic">"{r.evidence}"</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// );
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Play, Loader2, Shield, X } from 'lucide-react';

const App = () => {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState([
    "The document must have a purpose section.",
    "The document must mention at least one date.",
    "The document must mention who is responsible."
  ]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResults(null);
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleCheckDocument = async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setLoading(true);
    setStatus('analyzing');
    setError('');

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("rules", JSON.stringify(rules));

      const response = await fetch("http://localhost:5001/api/audit", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server error");
      }

      const data = await response.json();
      setResults(data.results);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis failed. Please try again.");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Auditor App</h1>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">1. Document Source</h2>
              <div className="relative">
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}`}>
                  {file ? (
                    <div className="text-center px-4">
                      <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-purple-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-purple-600 mt-1">{status === 'analyzing' ? 'Analyzing...' : 'Ready to Audit'}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload PDF</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">2. Audit Rules</h2>
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div key={idx}>
                    <label className="text-xs text-gray-500 mb-1 block">Rule {idx + 1}</label>
                    <input type="text" value={rule} onChange={(e) => handleRuleChange(idx, e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none" placeholder={`Enter rule ${idx + 1}...`} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleCheckDocument} disabled={!file || loading} className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing...</span></> : <><Play className="w-4 h-4 fill-current" /><span>Run Audit</span></>}
            </button>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5" /><p>{error}</p></div>}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Audit Results</h2>
                {results && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">COMPLETED</span>}
              </div>
              <div className="flex-1 p-6 bg-gray-50/50 overflow-y-auto">
                {!results && !loading && <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4"><div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center"><FileText className="w-8 h-8 text-gray-300" /></div><p>Upload a document and run the audit.</p></div>}
                {loading && <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-24"></div>)}</div>}
                {results && <div className="space-y-4">{results.map((res, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${res.status.toUpperCase() === 'PASS' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {res.status.toUpperCase() === 'PASS' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">{res.rule}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">CONF: {res.confidence}%</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${res.status.toUpperCase() === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{res.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{res.reasoning}</p>
                      <div className="bg-gray-50 rounded border border-gray-100 p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Evidence Found</p>
                        <p className="text-xs text-gray-700 font-serif italic">"{res.evidence}"</p>
                      </div>
                    </div>
                  </div>
                ))}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;