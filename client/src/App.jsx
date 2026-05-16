import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Folder,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  File,
  Clock,
  Star,
  HardDrive,
  Tag,
  ChevronRight,
  Monitor,
  Cloud,
  Download,
  Trash2,
  Settings,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}


const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <ImageIcon className="w-4 h-4 text-pink-500" />;
  if (['mp3', 'wav', 'ogg'].includes(ext)) return <Music className="w-4 h-4 text-purple-500" />;
  if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return <Video className="w-4 h-4 text-red-500" />;
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return <FileText className="w-4 h-4 text-blue-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error('Status fetch failed', err));
  }, []);


  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Search failed', err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex h-screen w-full bg-white select-none">
      {}
      <div className="w-64 glass border-r flex flex-col pt-12 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <h3 className="text-[11px] font-bold text-black/40 uppercase tracking-wider mb-2 px-3">Favorites</h3>
          <div className="space-y-0.5">
            <div className="sidebar-item active"><Clock className="w-4 h-4" /> Recents</div>
            <div className="sidebar-item"><Star className="w-4 h-4 text-orange-400" /> Favorites</div>
            <div className="sidebar-item"><Download className="w-4 h-4 text-blue-500" /> Downloads</div>
            <div className="sidebar-item"><ImageIcon className="w-4 h-4 text-pink-500" /> Documents</div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <h3 className="text-[11px] font-bold text-black/40 uppercase tracking-wider mb-2 px-3">Locations</h3>
          <div className="space-y-0.5">
            <div className="sidebar-item"><Cloud className="w-4 h-4 text-blue-400" /> iCloud Drive</div>
            <div className="sidebar-item"><HardDrive className="w-4 h-4 text-gray-500" /> Macintosh HD</div>
            <div className="sidebar-item"><Monitor className="w-4 h-4 text-gray-500" /> Network</div>
          </div>
        </div>

        <div className="px-4 mt-auto">
          <h3 className="text-[11px] font-bold text-black/40 uppercase tracking-wider mb-2 px-3">Tags</h3>
          <div className="space-y-0.5">
            <div className="sidebar-item"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red</div>
            <div className="sidebar-item"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Orange</div>
            <div className="sidebar-item"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Yellow</div>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col min-w-0">
        {}
        <header className="h-14 glass border-b flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-1 text-black/50 ml-2">
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs font-medium text-black/80">Search Results</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="bg-black/5 border border-black/10 rounded-md py-1 pl-8 pr-3 text-[13px] w-64 focus:outline-none focus:ring-2 focus:ring-mac-accent/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-black/60 cursor-pointer" />
              <Info className="w-4 h-4 text-black/60 cursor-pointer" />
            </div>
          </div>
        </header>

        {}
        <div className="flex-1 overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b">
              <tr className="text-[11px] font-bold text-black/40 uppercase">
                <th className="px-6 py-2 border-r border-black/5 w-1/4">Name</th>
                <th className="px-4 py-2 border-r border-black/5 w-1/4">Path</th>
                <th className="px-4 py-2 border-r border-black/5">Date Modified</th>
                <th className="px-4 py-2 border-r border-black/5">Size</th>
                <th className="px-4 py-2">Kind</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              <AnimatePresence mode="popLayout">
                {results.length > 0 ? (
                  results.map((item, idx) => (
                    <motion.tr
                      key={item.path}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedFile(item)}
                      className={cn(
                        "group cursor-default",
                        selectedFile?.path === item.path ? "bg-mac-accent text-white" : "hover:bg-mac-accent/5 even:bg-black/[0.02]"
                      )}
                    >
                      <td className="px-6 py-2 flex items-center gap-3">
                        {getFileIcon(item.name)}
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className={cn("px-4 py-2 max-w-xs", selectedFile?.path === item.path ? "text-white/60" : "text-black/40")}>
                        <div className="truncate text-[11px]" title={item.path}>{item.path}</div>
                      </td>
                      <td className={cn("px-4 py-2", selectedFile?.path === item.path ? "text-white/80" : "text-black/50")}>
                        {item.modified}
                      </td>
                      <td className={cn("px-4 py-2", selectedFile?.path === item.path ? "text-white/80" : "text-black/50")}>
                        {(item.size / 1024).toFixed(1)} KB
                      </td>
                      <td className={cn("px-4 py-2", selectedFile?.path === item.path ? "text-white/80" : "text-black/50")}>
                        {item.name.split('.').pop().toUpperCase()} File
                      </td>
                    </motion.tr>
                  ))
                ) : !loading && query && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-black/20">
                        <Search className="w-12 h-12" />
                        <p className="text-lg font-medium">No results found for "{query}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-mac-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {}
        <footer className="h-7 glass border-t flex items-center justify-between px-4 text-[11px] text-black/50">
          <div className="flex items-center gap-4">
            <span>{results.length} items found</span>
            {status && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {status.indexedFiles.toLocaleString()} files indexed
              </span>
            )}
          </div>
          <div>
            {status && <span>Root: {status.root}</span>}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
