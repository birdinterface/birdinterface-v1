import { auth } from '@/app/(auth)/auth';
import { HomeHeader } from '@/components/custom/home-header';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="container py-6">
      <HomeHeader user={user} />
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      {/* Add your home page content here */}
    </div>
  );
} 