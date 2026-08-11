'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { AudienceDoors } from './AudienceDoors';
import { ProjectSection } from './ProjectSection';
import { ImpactStats, type ProjectResultData } from './ImpactStats';
import { FindSchool, type SchoolCardData } from './FindSchool';
import { SchoolModal } from './SchoolModal';
import { KnowledgeLibrary, type ArticleData } from './KnowledgeLibrary';
import { Footer } from './Footer';
import { ApplyModal } from './ApplyModal';
import { ChatPanel } from './ChatPanel';

export function PublicSite({
  projectResult,
  schools,
  articles,
  siteImages,
}: {
  projectResult: ProjectResultData | null;
  schools: SchoolCardData[];
  articles: ArticleData[];
  siteImages: { teacher: string | null; student: string | null; project: string | null };
}) {
  const [projOpen, setProjOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState<string | undefined>(undefined);
  const [openSchoolId, setOpenSchoolId] = useState<string | null>(null);

  function askInChat(question: string) {
    setChatQuestion(question);
    setChatOpen(true);
  }

  return (
    <div className="relative mx-auto max-w-[1440px] bg-white shadow-[0_0_60px_rgba(0,0,0,.08)]">
      <Header />
      <Hero onOpenChat={() => setChatOpen(true)} onAsk={askInChat} />
      <AudienceDoors teacherImageUrl={siteImages.teacher} studentImageUrl={siteImages.student} />
      <ProjectSection
        projOpen={projOpen}
        onToggleProj={() => setProjOpen((v) => !v)}
        onOpenForm={() => setFormOpen(true)}
        imageUrl={siteImages.project}
      />
      <ImpactStats result={projectResult} />
      <FindSchool schools={schools} onView={setOpenSchoolId} />
      <KnowledgeLibrary articles={articles} />
      <Footer />

      {formOpen && <ApplyModal onClose={() => setFormOpen(false)} />}
      {chatOpen && (
        <ChatPanel
          onClose={() => {
            setChatOpen(false);
            setChatQuestion(undefined);
          }}
          initialQuestion={chatQuestion}
        />
      )}
      {openSchoolId && <SchoolModal schoolId={openSchoolId} onClose={() => setOpenSchoolId(null)} />}
    </div>
  );
}
