import { auth } from '@/app/(auth)/auth';
import { HomeHeader } from '@/components/custom/home-header';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="container py-6">
      <HomeHeader user={user} />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6">Home</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Get Started
        </Button>
      </div>
    </div>
  );
} 