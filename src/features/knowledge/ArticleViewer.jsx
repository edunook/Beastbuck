import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { KnowledgeService } from '../../services/firebase/knowledge';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { ChevronLeft, History, Quote, Users, Sparkles, Share2, Bookmark, ThumbsUp, Network } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ArticleViewer() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAiExplainer, setShowAiExplainer] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await KnowledgeService.getArticle(id);
        if (data) {
          setArticle(data);
          
          const related = await KnowledgeService.getArticles({ category: data.category, limitCount: 3 });
          setRelatedArticles(related.filter(r => r.id !== id));
          
          if (data.authorId) {
            const authorSnap = await getDoc(doc(db, 'users', data.authorId));
            if (authorSnap.exists()) setAuthor(authorSnap.data());
          }
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        setReadingProgress((window.scrollY / scrollTotal) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <PageContainer>
      <div className="flex items-center justify-center py-20">
         <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    </PageContainer>
  );

  if (!article) return (
    <PageContainer>
      <div className="p-8 text-center text-text-muted">Article not found</div>
    </PageContainer>
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-accent z-50 transition-all duration-150" 
        style={{ width: `${readingProgress}%` }}
      ></div>

      <PageContainer>
        <div className="max-w-5xl mx-auto py-8">
          <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to Knowledge Hub
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Main Content Area */}
            <div className="flex-1">
               <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-accent/10 text-accent">
                        {article.category || 'Article'}
                     </span>
                     <span className="text-sm text-text-muted">
                        {new Date(article.createdAt?.toDate ? article.createdAt.toDate() : Date.now()).toLocaleDateString()}
                     </span>
                     <span className="text-sm text-text-muted flex items-center gap-1">
                        <History className="w-4 h-4" /> v{article.versions ? article.versions.length : 1}
                     </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                     {article.title}
                  </h1>

                  {author && (
                     <div className="flex items-center justify-between border-y border-border py-4 mb-8">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full overflow-hidden bg-surface border border-border">
                              {author.avatar ? (
                                 <img src={author.avatar} alt={author.displayName} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center font-bold text-accent">
                                    {author.displayName?.charAt(0) || author.username?.charAt(0) || '?'}
                                 </div>
                              )}
                           </div>
                           <div>
                              <div className="font-bold text-white">{author.displayName || author.username}</div>
                              <div className="text-xs text-text-muted">{author.role || 'Member'}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="secondary" size="sm"><Share2 className="w-4 h-4" /></Button>
                           <Button variant="secondary" size="sm"><Bookmark className="w-4 h-4" /></Button>
                        </div>
                     </div>
                  )}

                  {/* AI Explainer Mode */}
                  {showAiExplainer && (
                     <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-8 relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                           <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-purple-400 font-bold mb-2">AI Explainer</h3>
                        <p className="text-sm text-white/90 leading-relaxed">
                           This article discusses {article.title}, breaking down its core concepts into actionable insights. 
                           The primary focus is on how it integrates with current workflows and why it matters for the organization's overarching goals.
                        </p>
                        <button onClick={() => setShowAiExplainer(false)} className="text-xs text-purple-400 underline mt-3">Dismiss</button>
                     </div>
                  )}

                  <div className="bg-surface/50 border border-border rounded-2xl p-8 md:p-12 shadow-sm relative group">
                     {/* Floating AI Button */}
                     <button 
                        onClick={() => setShowAiExplainer(true)}
                        className="absolute -right-4 -top-4 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        title="Explain with AI"
                     >
                        <Sparkles className="w-5 h-5" />
                     </button>
                     <div className="prose prose-invert max-w-none text-white/90 whitespace-pre-wrap leading-relaxed text-lg">
                        {article.content || 'No content provided.'}
                     </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-4 mt-8">
                     <Button variant="secondary"><ThumbsUp className="w-4 h-4 mr-2" /> Helpful ({article.likes?.length || 0})</Button>
                     <Button variant="secondary"><Network className="w-4 h-4 mr-2" /> View on Knowledge Map</Button>
                  </div>
               </div>
            </div>

            {/* Sidebar Data */}
            <div className="w-full lg:w-80 space-y-6">
               
               {/* Contributors */}
               <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> Contributors</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold text-xs">
                        {author ? (author.displayName?.charAt(0) || author.username?.charAt(0)) : 'A'}
                     </div>
                     <span className="text-sm text-white font-medium">{author?.displayName || 'Primary Author'}</span>
                  </div>
               </div>

               {/* Citations & References */}
               <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Quote className="w-4 h-4 text-purple-400" /> Citations & References</h3>
                  <p className="text-xs text-text-muted mb-3">This article is referenced by {article.references || 0} other knowledge items.</p>
                  {article.references > 0 ? (
                     <div className="space-y-2">
                        <div className="text-sm text-white italic">Citations linked in knowledge graph</div>
                     </div>
                  ) : (
                     <p className="text-sm text-text-muted italic">No citations yet.</p>
                  )}
               </div>

               {/* Related Content */}
               <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-bold text-white mb-4">Related Content</h3>
                  <div className="space-y-3">
                     {relatedArticles.length === 0 ? (
                       <p className="text-sm text-text-muted italic">No related content found.</p>
                     ) : (
                       relatedArticles.map(rel => (
                         <Link key={rel.id} to={`/knowledge/article/${rel.id}`} className="block p-3 rounded-lg border border-border/50 hover:border-accent transition-colors cursor-pointer">
                            <span className="text-[10px] text-accent uppercase font-bold">{rel.category || 'Article'}</span>
                            <h4 className="text-sm text-white font-bold mt-1 line-clamp-1">{rel.title}</h4>
                         </Link>
                       ))
                     )}
                  </div>
               </div>

            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
