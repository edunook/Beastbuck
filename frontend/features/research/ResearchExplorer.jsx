import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, FlaskConical, Microscope, Cpu, Dna, Globe, FileText } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';

const RESEARCH_CATEGORIES = [
  { id: 'all', name: 'All Research', icon: BookOpen },
  { id: 'space-science', name: 'Space Science', icon: Globe },
  { id: 'computer-systems', name: 'Computer Systems', icon: Cpu },
  { id: 'genetics', name: 'Genetics', icon: Dna },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical },
  { id: 'biology', name: 'Biology', icon: Microscope },
  { id: 'physics', name: 'Physics', icon: FileText },
];

export function ResearchExplorer() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in production, fetch from Firestore
  useEffect(() => {
    const mockPapers = [
      {
        id: '1',
        title: 'Advances in Quantum Computing',
        category: 'computer-systems',
        author: 'Dr. Sarah Chen',
        abstract: 'Exploring new quantum algorithms for optimization problems...',
        date: '2024-01-15',
        citations: 42,
      },
      {
        id: '2',
        title: 'CRISPR Gene Editing Applications',
        category: 'genetics',
        author: 'Prof. Michael Roberts',
        abstract: 'Recent developments in gene therapy and precision medicine...',
        date: '2024-01-10',
        citations: 89,
      },
      {
        id: '3',
        title: 'Mars Colonization Challenges',
        category: 'space-science',
        author: 'Dr. Emily Watson',
        abstract: 'Analyzing the technical and biological hurdles for human settlement...',
        date: '2024-01-08',
        citations: 35,
      },
    ];
    setPapers(mockPapers);
    setLoading(false);
  }, []);

  const filteredPapers = papers.filter(paper => {
    const matchesCategory = selectedCategory === 'all' || paper.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcon = RESEARCH_CATEGORIES.find(cat => cat.id === selectedCategory)?.icon || BookOpen;
  const Icon = categoryIcon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Research Explorer</h1>
          <p className="text-text-muted">Discover and explore scientific research papers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>

      {/* Category Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {RESEARCH_CATEGORIES.map(category => {
              const CatIcon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    isSelected
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-border hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <CatIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search papers by title, author, or abstract..."
                className="pl-10"
              />
            </div>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading research papers...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-white">
                {RESEARCH_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'All Research'}
              </h2>
            </div>
            <span className="text-sm text-text-muted">{filteredPapers.length} papers found</span>
          </div>

          {filteredPapers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-muted">No papers found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredPapers.map(paper => (
              <Card key={paper.id} className="hover:border-accent/40 transition cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white mb-2">{paper.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <span>{paper.author}</span>
                        <span>•</span>
                        <span>{paper.date}</span>
                        <span>•</span>
                        <span className="text-accent">{paper.citations} citations</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-soft line-clamp-3">{paper.abstract}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm">Read Paper</Button>
                    <Button size="sm" variant="secondary">Save to Notebook</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
