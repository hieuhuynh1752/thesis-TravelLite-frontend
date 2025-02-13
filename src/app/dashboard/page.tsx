import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {UserRole} from '../../../services/api/type.api';

export default async function DashboardRouter() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const role = cookieStore.get('role')?.value;

  if (!token) {
    redirect('/login'); // Redirect if not authenticated
  }

  // ✅ Redirect based on role
  if (role === UserRole.ADMIN) {
    redirect('/dashboard/admin');
  } else if (role === UserRole.USER) {
    redirect('/dashboard/user');
  } else {
    redirect('/login'); // Fallback for undefined roles
  }
}
