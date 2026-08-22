import { prisma } from '@/lib/prisma';
import { PublicProviders } from '@/components/public/PublicProviders';
import { PublicSite } from '@/components/public/PublicSite';

// Backoffice-managed content (schools, project results, applications) changes independently
// of deploys — this must read fresh on every request, not get frozen at build time.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [latestResult, schools, articles, siteImages] = await Promise.all([
    prisma.projectResult.findFirst({ orderBy: { updateDate: 'desc' } }),
    prisma.school.findMany({ orderBy: { name: 'asc' } }),
    prisma.learningArticle.findMany({
      orderBy: { createdAt: 'desc' },
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.siteImage.findMany(),
  ]);
  const siteImageByKey = Object.fromEntries(siteImages.map((i) => [i.key, i.url]));

  const schoolCards = await Promise.all(
    schools.map(async (s) => {
      const latestEgg = await prisma.eggLog.findFirst({ where: { schoolId: s.id }, orderBy: { date: 'desc' } });
      return {
        id: s.id,
        name: s.name,
        location: s.location,
        joinedYearAD: s.joinedDate.getFullYear(),
        todayEggs: latestEgg?.count ?? 0,
      };
    }),
  );

  return (
    <PublicProviders>
      <PublicSite
        projectResult={
          latestResult
            ? {
                updateDate: latestResult.updateDate.toISOString(),
                provinces: latestResult.provinces,
                countries: latestResult.countries,
                schoolCount: latestResult.schoolCount,
                studentCount: latestResult.studentCount,
                staffCount: latestResult.staffCount,
                communityCount: latestResult.communityCount,
                eggsPerCycle: latestResult.eggsPerCycle,
              }
            : null
        }
        schools={schoolCards}
        articles={articles.map((a) => ({
          id: a.id,
          tag: a.tag,
          title: a.title,
          body: a.body,
          attachments: a.attachments.map((att) => ({
            id: att.id,
            kind: att.kind,
            label: att.label,
            url: att.url,
            fileType: att.fileType,
          })),
        }))}
        siteImages={{
          teacher: siteImageByKey.teacher ?? null,
          student: siteImageByKey.student ?? null,
          project: siteImageByKey.project ?? null,
        }}
      />
    </PublicProviders>
  );
}
