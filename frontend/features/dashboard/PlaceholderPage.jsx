import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, EmptyState } from '@frontend/components/ui/UIElements';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <SectionWrapper>
        <EmptyState 
          icon={Construction}
          title={`${title} Module Under Construction`}
          description="This scalable foundation is prepared for future backend integration and advanced UI rendering."
        />
      </SectionWrapper>
    </PageContainer>
  );
}
