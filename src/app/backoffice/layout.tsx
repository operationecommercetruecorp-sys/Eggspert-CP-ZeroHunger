import { BackofficeProviders } from './providers';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return <BackofficeProviders>{children}</BackofficeProviders>;
}
