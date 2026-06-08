import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Trophy, Zap, Award, Target, FolderKanban, Activity, Map, ExternalLink, FlaskConical, Lightbulb, Box, Sparkles, BriefcaseBusiness, Users, GraduationCap, Route, Network, PackageOpen, Download, Star } from 'lucide-react';
import { PortfolioService } from '../../services/firebase/portfolio';
import { LoadingState } from '../../components/ui/UIElements';
import { formatDate } from '../../lib/dateUtils';
import { AIContextPanel } from '../ai/AIContextPanel';

function StatBlock({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-white/[0.02] p-4 print:border-gray-200 print:bg-transparent">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 print:hidden">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-black text-white print:text-black">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted print:text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function InnovationSection({ title, items, icon: Icon, typeLabel }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mb-12 print:mb-8">
      <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2 print:text-black">
        <Icon className="h-6 w-6 text-accent print:hidden" /> {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(item => (
          <div key={item.id} className="rounded-xl border border-border/50 bg-surface/30 p-5 print:border-gray-200 print:bg-transparent">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white print:text-black">{item.title}</h3>
              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.status || typeLabel}</span>
            </div>
            <p className="text-sm text-text-muted print:text-gray-600 line-clamp-2">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await PortfolioService.getPortfolioData(username);
        setData(result);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><LoadingState text="Generating portfolio..." /></div>;
  }

  if (!data) {
    return <div className="p-20 text-center text-white font-bold text-2xl">Portfolio Not Found</div>;
  }

  const { profile, stats, projects, researchProjects, inventions, prototypes, discoveries, certificates, specializations, activity, foundedVentures, joinedVentures, successfulVentures, completedCourses, learningPaths, userLearning, marketplaceResources, marketplaceCollections } = data;

  return (
    <div className="min-h-screen bg-background pb-20 print:bg-white print:text-black print:pb-0">
      
      {/* Print-only Header (Name and Contact) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-8 pt-8 px-8">
        <h1 className="text-4xl font-black">{profile.displayName || profile.username}</h1>
        <p className="text-gray-600 mt-1">@{profile.username} | {profile.role || 'Member'} at BeastBuck Ecosystem</p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-12 md:px-8 print:pt-0">
        
        {/* Controls - Hidden in print */}
        <div className="mb-8 flex justify-end gap-3 print:hidden">
          <Link to={`/portfolio/${username}/share`} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-white hover:bg-white/5">
            Share Portfolio
          </Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black hover:bg-accent-hover">
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
        </div>

        {/* Hero Section */}
        <section className="mb-12 rounded-3xl border border-border bg-surface p-8 print:border-none print:bg-transparent print:p-0 print:mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-accent/20 print:border-none print:hidden">
               {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/10 text-4xl font-black text-accent">
                  {(profile.displayName || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left print:hidden">
              <h1 className="font-heading text-4xl font-black text-white">{profile.displayName || profile.username}</h1>
              <p className="mt-2 text-lg text-text-muted">@{profile.username}</p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
                  Level {stats.level}
                </span>
                <span className="rounded-lg bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-text-muted">
                  {profile.role || 'Member'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Portfolio Assistant – hidden in print */}
        <section className="mb-12 print:hidden">
          <AIContextPanel
            title="AI Portfolio Assistant"
            actions={[
              {
                label: 'Generate Professional Bio',
                prompt: `Write a professional 3-paragraph biography for ${profile.displayName || profile.username}, a Level ${stats.level} ${profile.role || 'Member'} at BeastBuck with ${stats.totalXP} XP, who has completed ${stats.projectsJoined} projects, earned ${stats.certificatesEarned} certificates, and has ${stats.achievementsEarned} achievements.`,
                mode: 'general',
              },
              {
                label: 'Summarize Achievements',
                prompt: `Write a compelling achievement summary for a resume. Member: ${profile.displayName || profile.username}. Stats: ${stats.totalXP} XP, Level ${stats.level}, ${stats.projectsJoined} projects, ${stats.certificatesEarned} certificates, ${stats.inventionsCount} inventions, ${stats.researchProjectsCount} research projects. Make it professional and concise.`,
                mode: 'general',
              },
              {
                label: 'Write Resume Summary',
                prompt: `Write a 3-5 sentence resume summary for ${profile.displayName || profile.username} suitable for a professional job application. Include their role (${profile.role || 'Member'}), key accomplishments, and skills. Stats: ${stats.totalXP} XP, ${stats.projectsJoined} projects completed, ${stats.certificatesEarned} certified areas.`,
                mode: 'general',
              },
            ]}
          />
        </section>

        {/* Statistics Grid */}
        <section className="mb-12">
          <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2 print:text-black">
            <Activity className="h-6 w-6 text-accent print:hidden" /> Impact & Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 print:grid-cols-4 print:gap-4">
            <StatBlock label="Total XP" value={stats.totalXP} icon={Zap} />
            <StatBlock label="Projects" value={stats.projectsJoined} icon={FolderKanban} />
            <StatBlock label="Certificates" value={stats.certificatesEarned} icon={Award} />
            <StatBlock label="Achievements" value={stats.achievementsEarned} icon={Trophy} />
            {stats.researchProjectsCount > 0 && <StatBlock label="Research" value={stats.researchProjectsCount} icon={FlaskConical} />}
            {stats.inventionsCount > 0 && <StatBlock label="Inventions" value={stats.inventionsCount} icon={Lightbulb} />}
            {stats.discoveriesCount > 0 && <StatBlock label="Discoveries" value={stats.discoveriesCount} icon={Sparkles} />}
            {stats.prototypesCount > 0 && <StatBlock label="Prototypes" value={stats.prototypesCount} icon={Box} />}
            {stats.foundedVenturesCount > 0 && <StatBlock label="Founded Ventures" value={stats.foundedVenturesCount} icon={BriefcaseBusiness} />}
            {stats.joinedVenturesCount > 0 && <StatBlock label="Joined Ventures" value={stats.joinedVenturesCount} icon={Users} />}
            {stats.completedCoursesCount > 0 && <StatBlock label="Courses" value={stats.completedCoursesCount} icon={GraduationCap} />}
            {stats.skillNodesUnlocked > 0 && <StatBlock label="Skill Nodes" value={stats.skillNodesUnlocked} icon={Network} />}
            {stats.publishedResourcesCount > 0 && <StatBlock label="Resources" value={stats.publishedResourcesCount} icon={PackageOpen} />}
            {stats.marketplaceDownloadsCount > 0 && <StatBlock label="Downloads" value={stats.marketplaceDownloadsCount} icon={Download} />}
            {stats.creatorRating > 0 && <StatBlock label="Creator Rating" value={stats.creatorRating} icon={Star} />}
          </div>
        </section>

        {/* Specializations & Certificates */}
        <div className="grid gap-8 md:grid-cols-2 mb-12 print:block">
          {specializations.length > 0 && (
            <section className="print:mb-8">
              <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2 print:text-black">
                <Target className="h-6 w-6 text-accent print:hidden" /> Specializations
              </h2>
              <div className="space-y-4">
                {specializations.map(spec => (
                  <div key={spec.id} className="rounded-xl border border-border/50 bg-surface/30 p-5 print:border-gray-200 print:bg-transparent">
                    <h3 className="font-bold text-white print:text-black">{spec.name}</h3>
                    <p className="mt-1 text-sm text-text-muted print:text-gray-600">{spec.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="print:mb-8">
              <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2 print:text-black">
                <Award className="h-6 w-6 text-accent print:hidden" /> Official Certificates
              </h2>
              <div className="space-y-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="rounded-xl border border-border/50 bg-surface/30 p-5 print:border-gray-200 print:bg-transparent">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white print:text-black">{cert.title}</h3>
                      <Link to={`/verify/${cert.id}`} className="text-accent hover:underline text-xs flex items-center gap-1 print:hidden">
                        Verify <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-sm text-text-muted print:text-gray-600">{cert.description}</p>
                    <p className="mt-2 text-[10px] font-mono text-text-soft print:text-gray-500">ID: {cert.certificateNumber}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-12 print:mb-8">
            <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2 print:text-black">
              <FolderKanban className="h-6 w-6 text-accent print:hidden" /> Key Projects
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map(project => (
                <div key={project.id} className="rounded-xl border border-border/50 bg-surface/30 p-5 print:border-gray-200 print:bg-transparent">
                  <h3 className="font-bold text-white print:text-black">{project.title}</h3>
                  <p className="mt-1 text-sm text-text-muted print:text-gray-600 line-clamp-2">{project.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted print:border print:border-gray-300">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Innovation Sections */}
        <InnovationSection title="Research Projects" items={researchProjects} icon={FlaskConical} typeLabel="RESEARCH" />
        <InnovationSection title="Inventions" items={inventions} icon={Lightbulb} typeLabel="INVENTION" />
        <InnovationSection title="Discoveries" items={discoveries} icon={Sparkles} typeLabel="DISCOVERY" />
        <InnovationSection title="Prototypes" items={prototypes} icon={Box} typeLabel="PROTOTYPE" />
        <InnovationSection title="Founded Ventures" items={foundedVentures} icon={BriefcaseBusiness} typeLabel="FOUNDER" />
        <InnovationSection title="Joined Ventures" items={joinedVentures} icon={Users} typeLabel="TEAM MEMBER" />
        <InnovationSection title="Successful Ventures" items={successfulVentures} icon={Trophy} typeLabel="SUCCESSFUL" />
        <InnovationSection title="Completed Courses" items={completedCourses?.map(item => ({ ...item, title: item.courseTitle || item.courseId, description: `${item.progressPercent || 100}% complete` }))} icon={GraduationCap} typeLabel="COURSE" />
        <InnovationSection title="Learning Paths" items={learningPaths} icon={Route} typeLabel="PATH" />
        <InnovationSection title="Skill Unlocks" items={userLearning?.map(item => ({ ...item, title: item.nodeId, description: item.status }))} icon={Network} typeLabel="SKILL" />
        <InnovationSection title="Published Resources" items={marketplaceResources} icon={PackageOpen} typeLabel="RESOURCE" />
        <InnovationSection title="Resource Collections" items={marketplaceCollections} icon={FolderKanban} typeLabel="COLLECTION" />

        {/* Growth Timeline (Truncated for print to save space) */}
        {activity.length > 0 && (
          <section className="print:hidden">
            <h2 className="mb-6 font-heading text-2xl font-black text-white flex items-center gap-2">
              <Map className="h-6 w-6 text-accent" /> Growth Timeline
            </h2>
            <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
              {activity.slice(0, 10).map((act, i) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-accent" />
                  <h4 className="font-bold text-white">{act.title || act.type}</h4>
                  <p className="text-sm text-text-muted mt-1">{act.description}</p>
                  <p className="text-xs text-text-soft mt-2">{formatDate(act.timestamp)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
