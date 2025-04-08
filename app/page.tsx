import { auth } from '@/app/(auth)/auth';
import { HomeHeader } from '@/components/custom/home-header';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="container py-6">
      <HomeHeader />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
      </div>
    </div>
  );
} 