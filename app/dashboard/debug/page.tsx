'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TestResult {
    success: boolean;
    duration?: number;
    resultCount?: number;
    results?: any[];
    error?: string;
    found?: boolean;
    result?: any;
    enrichmentAnalysis?: Array<{
        title: string;
        source: string;
        hasDescription: boolean;
        hasPageCount: boolean;
        hasPublisher: boolean;
        hasCategories: boolean;
    }>;
}

interface DebugData {
    timestamp: string;
    query: string;
    googleBooksEnabled: boolean;
    tests: {
        openLibrary?: TestResult;
        googleBooks?: TestResult;
        isbnSearch?: TestResult;
        unifiedSearch?: TestResult;
    };
}

export default function DebugPage() {
    const [query, setQuery] = useState('dune');
    const [isbn, setIsbn] = useState('');
    const [debugData, setDebugData] = useState<DebugData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const router = useRouter();

    const runTests = async () => {
        setLoading(true);
        setError(null);
        setAccessDenied(false);

        try {
            const params = new URLSearchParams({ q: query });
            if (isbn) params.append('isbn', isbn);

            const response = await fetch(`/api/debug/books?${params}`);

            if (response.status === 403) {
                setAccessDenied(true);
                setError('Debug features not enabled. Set ENABLE_DEBUG_FEATURES=true in your environment.');
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to run tests: ${response.statusText}`);
            }

            const data = await response.json();
            setDebugData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runTests();
    }, []);

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-zinc-900 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-zinc-800/50 backdrop-blur-lg border border-zinc-700 rounded-lg p-8">
                        <h1 className="text-3xl font-bold text-zinc-100 mb-4">Debug Features Disabled</h1>
                        <p className="text-zinc-400 mb-4">
                            Debug features are not enabled. To enable them, set the following environment variable:
                        </p>
                        <code className="block bg-zinc-900 p-4 rounded text-green-400 font-mono">
                            ENABLE_DEBUG_FEATURES=true
                        </code>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2">Book Search Debug Console</h1>
                    <p className="text-zinc-400">Test Open Library and Google Books API integration</p>
                </div>

                {/* Controls */}
                <div className="bg-zinc-800/50 backdrop-blur-lg border border-zinc-700 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Search Query
                            </label>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., dune"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                ISBN (optional)
                            </label>
                            <input
                                type="text"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 9780441013593"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={runTests}
                                disabled={loading}
                                className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 text-white rounded-lg transition-colors"
                            >
                                {loading ? 'Running Tests...' : 'Run Tests'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Results */}
                {debugData && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-zinc-800/50 backdrop-blur-lg border border-zinc-700 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-zinc-100 mb-4">API Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-zinc-400">Google Books API:</span>
                                    <span className={`ml-2 ${debugData.googleBooksEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                        {debugData.googleBooksEnabled ? '✓ Enabled' : '✗ Disabled'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Last Run:</span>
                                    <span className="ml-2 text-zinc-300">
                                        {new Date(debugData.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Test Results */}
                        {Object.entries(debugData.tests).map(([testName, result]) => (
                            <TestResultCard key={testName} testName={testName} result={result} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TestResultCard({ testName, result }: { testName: string; result: TestResult }) {
    const [expanded, setExpanded] = useState(false);

    const testLabels: Record<string, string> = {
        openLibrary: 'Open Library Search',
        googleBooks: 'Google Books Search',
        isbnSearch: 'ISBN Search (Google)',
        unifiedSearch: 'Unified Search (Fallback Logic)',
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-lg border border-zinc-700 rounded-lg overflow-hidden">
            <div
                className="p-6 cursor-pointer hover:bg-zinc-800/70 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-100">
                                {testLabels[testName] || testName}
                            </h3>
                            {result.duration && (
                                <p className="text-sm text-zinc-400">Completed in {result.duration}ms</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {result.resultCount !== undefined && (
                            <span className="text-zinc-300">{result.resultCount} results</span>
                        )}
                        {result.found !== undefined && (
                            <span className={result.found ? 'text-green-400' : 'text-red-400'}>
                                {result.found ? 'Found' : 'Not found'}
                            </span>
                        )}
                        <svg
                            className={`w-5 h-5 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {result.error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded">
                        <p className="text-sm text-red-400">{result.error}</p>
                    </div>
                )}
            </div>

            {expanded && (
                <div className="border-t border-zinc-700 p-6 bg-zinc-900/50 space-y-6">
                    {/* Enrichment Analysis (for unified search) */}
                    {result.enrichmentAnalysis && result.enrichmentAnalysis.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Data Enrichment Summary:</h4>
                            <div className="space-y-2">
                                {result.enrichmentAnalysis.map((item, idx) => (
                                    <div key={idx} className="bg-zinc-950 p-3 rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-zinc-200 font-medium">{item.title}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                item.source.includes('+')
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : item.source.includes('Google')
                                                    ? 'bg-blue-900/30 text-blue-400'
                                                    : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                                {item.source}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className={item.hasDescription ? 'text-green-400' : 'text-red-400'}>
                                                {item.hasDescription ? '✓' : '✗'} Description
                                            </span>
                                            <span className={item.hasPageCount ? 'text-green-400' : 'text-red-400'}>
                                                {item.hasPageCount ? '✓' : '✗'} Pages
                                            </span>
                                            <span className={item.hasPublisher ? 'text-green-400' : 'text-red-400'}>
                                                {item.hasPublisher ? '✓' : '✗'} Publisher
                                            </span>
                                            <span className={item.hasCategories ? 'text-green-400' : 'text-red-400'}>
                                                {item.hasCategories ? '✓' : '✗'} Categories
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Response */}
                    {(result.results || result.result) && (
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Raw Response:</h4>
                            <pre className="bg-zinc-950 p-4 rounded overflow-x-auto text-xs text-zinc-300 max-h-96 overflow-y-auto">
                                {JSON.stringify(result.results || result.result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
