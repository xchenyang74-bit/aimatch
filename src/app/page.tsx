import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// 开发模式：设置为 true 自动跳转到 Dashboard
const DEV_MODE = true;

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user && !DEV_MODE) {
    redirect('/login');
  }
  
  redirect('/dashboard');
}
