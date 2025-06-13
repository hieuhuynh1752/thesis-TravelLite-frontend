'use client';
import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getPublicEvents } from '../../services/api/event.api';
import {
  motion,
  Variants,
  useInView,
  useMotionValue,
  animate,
  AnimatePresence,
  stagger,
} from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventType } from '../../services/api/type.api';
import { Clock, MapPin, ScanText, UserCog } from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { useRouter, redirect } from 'next/navigation';
import { UserRole } from '../../services/api/type.api';
import Cookie from 'js-cookie';
import AppScreenshot from '@/img/AppScreenshot.jpeg';

/* ------------------------------------------------------------------ */
/*  ✨ ANIMATION PRESETS                                               */
/* ------------------------------------------------------------------ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: (i = 0) => ({
    transition: { staggerChildren: 0.2, delayChildren: i },
  }),
};

/* ------------------------------------------------------------------ */
/*  🔢 AnimatedCounter – zero-to-N count-up when it scrolls into view  */
/* ------------------------------------------------------------------ */
const AnimatedCounter: React.FC<{ to: number }> = ({ to }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(motionVal, to, {
        duration: 1.2,
        ease: 'easeOut',
      });
      return controls.stop; // cleanup if component unmounts early
    }
  }, [isInView, motionVal, to]);

  React.useEffect(
    () =>
      motionVal.on('change', (v) => {
        setCurrent(Math.round(v));
      }),
    [motionVal],
  );

  return (
    <span ref={ref} className="tabular-nums">
      {current.toLocaleString()}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  🗂️ Data                                                           */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: 'Real-time carbon tracking',
    description:
      'Automatic CO₂-eq calculations for flights, trains, buses & drives—no spreadsheets required.',
    icon: '🌍',
  },
  {
    title: 'Greener route suggestions',
    description:
      'Surface rail & public-transit options first, highlight airlines with fuel-efficient fleets.',
    icon: '🚆',
  },
  {
    title: 'Shareable sustainability reports',
    description:
      'Generate branded PDFs or live dashboards for clients in one click.',
    icon: '📊',
  },
];

const stats = [
  { label: 'Trips offset', value: 12480 },
  { label: 't CO₂e avoided', value: 3721 },
  { label: 'Partner eco-stays', value: 640 },
];

const methodology = [
  {
    phase: 'Collect',
    emoji: '📥',
    headline: 'High-resolution travel data',
    detail:
      'We pull live flight schedules, rail timetables and routes metadata from Google Maps & Flights. Each segment is geo-tagged, timed and distance-verified to <50 m accuracy.',
  },
  {
    phase: 'Calculate',
    emoji: '🧮',
    headline: 'Science-backed emission factors',
    detail:
      'Emissions are computed using COPERT 4 & IEA Vehicle Emissions factors, with Google Flights Carbon Emission Estimations for flights. All math is GHG-Protocol conformant.',
  },
  {
    phase: 'Verify',
    emoji: '✅',
    headline: 'Transparent auditing pipeline',
    detail:
      'Every calculation stores inputs, factors and formulas in an immutable ledger. Export the full JSON or a branded PDF—both include methodology notes and citation links.',
  },
];

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-baseline gap-1 border-l-4 border-primary bg-muted/20 px-2 font-medium text-primary">
        <Icon size={16} className="self-center" />
        {label}:
      </span>
      <span>{children}</span>
    </div>
  );
}

function UpcomingEvents() {
  const router = useRouter();
  const [publicEvents, setPublicEvents] = React.useState<EventType[]>([]);

  React.useEffect(() => {
    const role = Cookie.get('role');
    if (role === UserRole.ADMIN || role === UserRole.USER) {
      redirect('/dashboard');
    } else {
      getPublicEvents().then((events) => setPublicEvents(events));
    }
  }, []);
  return (
    <section
      id="events"
      className="mx-auto max-w-7xl px-4 py-20 md:px-8 bg-white"
    >
      <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        Upcoming Events
      </h2>

      {/* container */}
      <motion.div
        variants={{ visible: { transition: stagger(0.1) } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {publicEvents?.length ? (
            publicEvents
              .filter((event) => isFuture(event.dateTime))
              .map((event, i) => (
                <motion.div
                  key={event.id}
                  custom={i}
                  variants={fadeUp}
                  layout
                  /* Keep Card width consistent on wrap */
                  className="w-full sm:w-[22rem] md:w-[20rem] lg:w-[22rem] xl:w-[24rem]"
                >
                  <Card className="h-full border-muted shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted flex flex-col">
                    {/* Header */}
                    <div className="flex gap-3 p-4 pb-2">
                      {/* DATE badge */}
                      <div className="flex flex-col rounded-xl border-2 border-muted text-primary">
                        <p className="w-14 self-center text-center text-2xl font-extrabold">
                          {format(parseISO(event.dateTime), 'd')}
                        </p>
                        <p className="bg-muted/20 px-4 text-center text-lg font-medium">
                          {format(parseISO(event.dateTime), 'MMM')}
                        </p>
                      </div>

                      <CardHeader className="p-2">
                        <CardTitle>{event.title}</CardTitle>
                        {event.location?.name && (
                          <CardDescription>
                            at {event.location.name}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </div>

                    {/* Body */}
                    <CardContent className="flex flex-col gap-3 border-t-2 border-dashed border-muted p-4 pt-3">
                      <InfoRow icon={Clock} label="Time">
                        {format(parseISO(event.dateTime), 'hh:mm a')}
                      </InfoRow>

                      {event.creator?.name && (
                        <InfoRow icon={UserCog} label="Host">
                          {event.creator.name}
                        </InfoRow>
                      )}

                      {event.location?.address && (
                        <InfoRow icon={MapPin} label="Address">
                          {event.location.address}
                        </InfoRow>
                      )}

                      {event.description && (
                        <InfoRow icon={ScanText} label="Description">
                          {event.description}
                        </InfoRow>
                      )}
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="justify-end gap-2 p-4 pt-0 mt-auto">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          router.push(`/explore/events/${event.id}`)
                        }
                      >
                        See more
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/login?eventRegister=${event.id}`)
                        }
                      >
                        Register now!
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
          ) : (
            <motion.p
              key="no-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 text-gray-500"
            >
              No upcoming events – check back soon!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>TravelLite • Plan journeys, leave lighter footprints</title>
        <meta
          name="description"
          content="TravelLite helps you craft unforgettable itineraries while measuring and reducing your travel footprint."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 text-center md:grid-cols-2 md:text-left md:py-28 lg:py-32">
          {/* text side */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            className="flex flex-col justify-center gap-6"
          >
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="text-4xl font-extrabold leading-tight sm:text-5xl"
            >
              Plan journeys,{' '}
              <span className="text-emerald-600">leave lighter footprints</span>
              .
            </motion.h1>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="text-lg text-gray-600"
            >
              TravelLite combines intuitive itinerary building with real-time
              carbon metrics so you can travel smarter and report your impact
              effortlessly.
            </motion.p>
            <motion.div
              custom={2}
              variants={fadeUp}
              className="mt-4 flex flex-col items-center gap-3 md:flex-row md:items-start"
            >
              <a
                id="get-started"
                href="/login"
                className="rounded-md bg-emerald-600 px-6 py-3 text-white shadow hover:bg-emerald-700"
              >
                Get started – it’s free
              </a>
            </motion.div>
          </motion.div>

          {/* mocked screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 60 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.4 }}
            className="relative h-64 w-full md:h-auto"
          >
            <Image
              src={AppScreenshot}
              alt="Screenshot of TravelLite app"
              layout="fill"
              objectFit="contain"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section id="learn-more" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
          Sustainability tools built for travelers
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-12 md:grid-cols-3"
        >
          {features.map(({ title, description, icon }, idx) => (
            <motion.div
              key={title}
              custom={idx}
              variants={fadeUp}
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="mb-4 text-4xl">{icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------- IMPACT SNAPSHOT ---------------- */}
      <section className="bg-emerald-600 text-white">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 py-14 md:flex-row md:px-8"
        >
          {stats.map(({ label, value }, idx) => (
            <motion.div
              key={label}
              custom={idx}
              variants={fadeUp}
              className="text-center md:text-left"
            >
              <div className="text-3xl font-bold sm:text-4xl">
                <AnimatedCounter to={value} />+
              </div>
              <div className="opacity-90">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* -------------- METHODOLOGY -------------- */}
      <section
        id="methodology"
        className="mx-auto max-w-7xl px-4 py-20 md:px-8 bg-white"
      >
        <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
          Our methodology, at a glance
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="relative border-l md:border-none md:grid md:grid-cols-3 md:gap-10"
        >
          {methodology.map(({ phase, emoji, headline, detail }, i) => (
            <motion.article
              key={phase}
              custom={i}
              variants={fadeUp}
              className="relative mb-12 pl-8 md:pl-0"
            >
              {/* vertical timeline bullet for mobile */}
              <span className="absolute -left-3 top-1.5 hidden h-3 w-3 rounded-full bg-emerald-600 md:block" />
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                <h3 className="text-xl font-semibold">{headline}</h3>
              </div>
              <p className="text-gray-600">{detail}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <UpcomingEvents />

      {/* ---------------- TESTIMONIAL ---------------- */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-xl italic leading-relaxed"
        >
          “TravelLite made it effortless for our team to visualize and reduce
          our travel emissions. The automated reports were a lifesaver for our
          ESG Scope 3 disclosures.”
        </motion.blockquote>
        <motion.figcaption
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 font-medium"
        >
          — Jordan Lee, Sustainability Officer @ GreenGlobe Inc.
        </motion.figcaption>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TravelLite. All rights reserved.
          </p>
          <div className="flex gap-6 text-gray-500">
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="mailto:hello@TravelLite.app" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
