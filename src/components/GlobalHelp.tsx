import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpCircle, Book, Video, MessageCircle, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { helpContent } from '@/config/helpContent';

/**
 * Global help overlay accessible from anywhere in the app
 * Press F1 or click help icon to open
 */
export default function GlobalHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search across all help content
  const searchResults = Object.entries(helpContent)
    .flatMap(([pageKey, content]) => 
      content.items.map(item => ({
        page: content.title,
        pageKey,
        title: item.title,
        content: item.content
      }))
    )
    .filter(item => 
      searchQuery.length > 2 && (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  // Listen for F1 key
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsOpen(true);
      }
    });
  }

  return (
    <>
      {/* Global Help Button in Header/Nav */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        title="Press F1 for help"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              GRC Platform Help Center
            </DialogTitle>
          </DialogHeader>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search all help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length > 2 && (
            <div className="overflow-y-auto flex-1 space-y-2">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-slate-500 mb-3">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{result.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{result.page}</p>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{result.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-slate-400 mt-2">Try different keywords or browse topics below</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Access when not searching */}
          {searchQuery.length <= 2 && (
            <div className="overflow-y-auto flex-1 space-y-4">
              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 text-left transition-colors">
                  <Book className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">User Guide</h4>
                    <p className="text-xs text-slate-500">Complete documentation</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 text-left transition-colors">
                  <Video className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Video Tutorials</h4>
                    <p className="text-xs text-slate-500">Watch & learn</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 text-left transition-colors">
                  <MessageCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Contact Support</h4>
                    <p className="text-xs text-slate-500">Get personalized help</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 text-left transition-colors">
                  <ExternalLink className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Knowledge Base</h4>
                    <p className="text-xs text-slate-500">Browse articles</p>
                  </div>
                </button>
              </div>

              {/* Popular Topics */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Popular Topics</h3>
                <div className="space-y-2">
                  {[
                    { title: 'How to create a new risk', page: 'Risk Assessment' },
                    { title: 'Understanding risk scores', page: 'Risk Register' },
                    { title: 'Linking controls to risks', page: 'Control Library' },
                    { title: 'Creating treatment plans', page: 'Treatment Monitor' },
                    { title: 'Reading the risk heatmap', page: 'Dashboard' },
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-start justify-between p-2 hover:bg-slate-50 rounded text-left"
                      onClick={() => setSearchQuery(topic.title)}
                    >
                      <div>
                        <p className="text-sm font-medium">{topic.title}</p>
                        <p className="text-xs text-slate-500">{topic.page}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Open Help</span>
                    <kbd className="px-2 py-1 bg-slate-100 border rounded text-xs">F1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Search</span>
                    <kbd className="px-2 py-1 bg-slate-100 border rounded text-xs">Ctrl + K</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
