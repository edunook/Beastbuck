import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { 
  FileText, 
  FlaskConical, Coins, Award, Loader2
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import EmptyState from '../../components/ui/EmptyState';

export default function VentureDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [venture, setVenture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabData, setTabData] = useState(null);

  useEffect(() => {
    const fetchVenture = async () => {
      try {
        setLoading(true);
        const ventureDoc = await getDoc(doc(db, 'ventures', id));
        if (ventureDoc.exists()) {
          setVenture({ id: ventureDoc.id, ...ventureDoc.data() });
        }
      } catch (error) {
        console.error('Failed to fetch venture:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenture();
    }
  }, [id]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (!venture) return;

      try {
        if (activeTab === 'funding') {
          const fundingQuery = query(
            collection(db, 'venture_funding'),
            where('ventureId', '==', id),
            orderBy('createdAt', 'desc')
          );
          const fundingSnap = await getDocs(fundingQuery);
          setTabData(fundingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else if (activeTab === 'team') {
          const teamQuery = query(
            collection(db, 'venture_members'),
            where('ventureId', '==', id)
          );
          const teamSnap = await getDocs(teamQuery);
          setTabData(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else if (activeTab === 'research') {
          const researchQuery = query(
            collection(db, 'research'),
            where('ventureId', '==', id)
          );
          const researchSnap = await getDocs(researchQuery);
          setTabData(researchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setTabData(null);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} data:`, error);
        setTabData(null);
      }
    };

    fetchTabData();
  }, [activeTab, venture, id]);

  const tabs = [
    'Overview', 'Team', 'Research', 'Projects', 'Products', 'Inventions', 
    'Documents', 'Analytics', 'Funding', 'Mentors', 'Recruitment', 'Timeline', 'Activity'
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  if (!venture) {
    return (
      <PageContainer>
        <EmptyState
          icon={FileText}
          title="Venture Not Found"
          description="The venture you're looking for doesn't exist or you don't have permission to view it."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Venture Header Banner */}
      <div className="relative h-64 rounded-2xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-border mb-8 overflow-hidden flex items-end p-8">
         <div className="absolute inset-0 bg-black/40"></div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-surface border-2 border-accent flex items-center justify-center font-bold text-4xl text-accent shadow-[0_0_20px_rgba(0,240,255,0.3)]">
               {venture.name?.charAt(0) || 'V'}
            </div>
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-accent/20 text-accent border border-accent/30">{venture.milestone || 'MVP Stage'}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30">{venture.visibility || 'Public Showcase'}</span>
               </div>
               <h1 className="text-4xl font-bold text-white mb-2">{venture.name || 'Untitled Venture'}</h1>
               <p className="text-white/80">{venture.description || 'No description provided.'}</p>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Main Content */}
         <div className="flex-1">
            
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar border-b border-border/50">
               {tabs.map(tab => {
                  const key = tab.toLowerCase();
                  return (
                     <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                           activeTab === key 
                              ? 'bg-white/10 text-white' 
                              : 'text-text-muted hover:text-white hover:bg-white/5'
                        }`}
                     >
                        {tab}
                     </button>
                  );
               })}
            </div>

            {/* Tab Content Areas */}
            {activeTab === 'overview' && (
               <div className="space-y-6">
                  <Card className="bg-surface/50 border-border">
                     <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Vision & Mission</h3>
                        <p className="text-text-muted leading-relaxed mb-6">
                           {venture.vision || venture.description || 'No vision statement provided.'}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="p-4 rounded-xl bg-black/20 border border-border/50 text-center">
                              <div className="text-2xl font-bold text-green-400">${venture.funding?.toLocaleString() || 0}</div>
                              <div className="text-[10px] text-text-muted uppercase">Virtual Funding</div>
                           </div>
                           <div className="p-4 rounded-xl bg-black/20 border border-border/50 text-center">
                              <div className="text-2xl font-bold text-accent">{venture.healthScore || 0}</div>
                              <div className="text-[10px] text-text-muted uppercase">Health Score</div>
                           </div>
                           <div className="p-4 rounded-xl bg-black/20 border border-border/50 text-center">
                              <div className="text-2xl font-bold text-white">{venture.teamSize || 0}</div>
                              <div className="text-[10px] text-text-muted uppercase">Team Members</div>
                           </div>
                           <div className="p-4 rounded-xl bg-black/20 border border-border/50 text-center">
                              <div className="text-2xl font-bold text-purple-400">{venture.inventionCount || 0}</div>
                              <div className="text-[10px] text-text-muted uppercase">Linked Inventions</div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            )}

            {activeTab === 'funding' && (
               <Card className="bg-surface/50 border-border">
                  <CardContent className="p-6">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-green-400"/> Funding History</h3>
                     <p className="text-sm text-text-muted mb-6">Track your reputation funding, grants, and simulated investor rounds.</p>
                     {tabData && tabData.length > 0 ? (
                        <div className="space-y-4">
                           {tabData.map(funding => (
                              <div key={funding.id} className="flex justify-between items-center p-4 rounded-lg bg-black/20 border border-border/50">
                                 <div>
                                    <div className="font-bold text-white">{funding.source || 'Funding Source'}</div>
                                    <div className="text-xs text-text-muted">{funding.description || 'No description'}</div>
                                 </div>
                                 <div className="font-bold text-green-400">+${funding.amount?.toLocaleString() || 0}</div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <EmptyState
                           icon={Coins}
                           title="No Funding History"
                           description="This venture hasn't received any funding yet."
                           variant="default"
                        />
                     )}
                  </CardContent>
               </Card>
            )}

            {/* Other tabs with empty state */}
            {activeTab !== 'overview' && activeTab !== 'funding' && (
               <EmptyState
                  icon={FileText}
                  title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon`}
                  description="This feature is under development. Check back later."
                  variant="default"
               />
            )}
         </div>

         {/* Sidebar Actions */}
         <div className="w-full lg:w-80 space-y-6">
            <Button className="w-full bg-accent text-black hover:bg-accent-hover shadow-[0_0_15px_rgba(0,240,255,0.3)]">
               Apply to Join Team
            </Button>
            <Button variant="secondary" className="w-full">
               Sponsor / Fund (Simulated)
            </Button>
            
            <Card className="bg-surface border-border">
               <CardContent className="p-5">
                  <h3 className="font-bold text-white mb-4">Venture Leader</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                        {venture.leaderName?.charAt(0) || '?'}
                     </div>
                     <div>
                        <div className="text-white font-bold text-sm">{venture.leaderName || 'Unknown'}</div>
                        <div className="text-xs text-text-muted">{venture.leaderRole || 'Venture Lead'}</div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-surface border-border">
               <CardContent className="p-5">
                  <h3 className="font-bold text-white mb-4">Integrations</h3>
                  <div className="space-y-2">
                     <Link to="#" className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors p-2 rounded hover:bg-white/5"><FileText className="w-4 h-4"/> 12 Documents</Link>
                     <Link to="#" className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors p-2 rounded hover:bg-white/5"><FlaskConical className="w-4 h-4"/> 3 Research Papers</Link>
                     <Link to="#" className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors p-2 rounded hover:bg-white/5"><Award className="w-4 h-4"/> 2 Inventions</Link>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </PageContainer>
  );
}
