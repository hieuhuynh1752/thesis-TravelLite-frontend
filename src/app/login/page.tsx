import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '@/components/login-form';
import Image from 'next/image';
import login_landing from '../../img/login_landing.svg';
import logo_travellite from '../../img/logo_travellite.png';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>

            <Image
              src={logo_travellite}
              alt="Image"
              className=" h-fit w-28 md:p-10 dark:brightness-[0.2] dark:grayscale"
              width={192}
              style={{ padding: 0 }}
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={login_landing}
          alt="Image"
          className="absolute inset-0 h-full w-full p-6 md:p-10 dark:brightness-[0.2] dark:grayscale"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
