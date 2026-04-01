import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronRight, Clock, Flame, Target } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import type { StudySession, Subject, Topic } from "../backend.d";
import { Variant_notStarted_done_inProgress } from "../backend.d";
import {
  useGetAllStudySessions,
  useGetAllSubjectsWithTopics,
  useGetTopicCompletionPercentage,
  useGetTotalStudyHours,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calcStreak(sessions: StudySession[]): number {
  if (!sessions.length) return 0;
  const days = new Set(
    sessions.map((s) => {
      const d = new Date(Number(s.timestamp) / 1_000_000);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

const SUBJECT_COLORS = [
  {
    bar: "bg-violet-500",
    text: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    bar: "bg-sky-500",
    text: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  {
    bar: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    bar: "bg-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    bar: "bg-rose-500",
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    bar: "bg-fuchsia-500",
    text: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
  },
];

interface DashboardProps {
  setPage: (p: Page) => void;
}

export default function Dashboard({ setPage }: DashboardProps) {
  const { data: subjectsWithTopics, isLoading: loadingSubjects } =
    useGetAllSubjectsWithTopics();
  const { data: sessions, isLoading: loadingSessions } =
    useGetAllStudySessions();
  const { data: completion, isLoading: loadingCompletion } =
    useGetTopicCompletionPercentage();
  const { data: studyHours, isLoading: loadingHours } = useGetTotalStudyHours();

  const isLoading =
    loadingSubjects || loadingSessions || loadingCompletion || loadingHours;
  const streak = sessions ? calcStreak(sessions) : 0;
  const recentSessions = sessions
    ? [...sessions]
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        .slice(0, 5)
    : [];

  const subjectMap = new Map<string, string>();
  if (subjectsWithTopics) {
    for (const [subject] of subjectsWithTopics) {
      subjectMap.set(subject.id.toString(), subject.name);
    }
  }

  const stats = [
    {
      label: "Topic Completion",
      value: isLoading ? null : `${Math.round((completion ?? 0) * 100) / 100}%`,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      lightBg: "bg-violet-50",
      iconColor: "text-violet-600",
      valueBg: "bg-violet-500",
      border: "border-violet-100",
      ocid: "dashboard.completion.card",
    },
    {
      label: "Total Study Hours",
      value: isLoading ? null : `${(studyHours ?? 0).toFixed(1)}h`,
      icon: Clock,
      gradient: "from-sky-500 to-cyan-600",
      lightBg: "bg-sky-50",
      iconColor: "text-sky-600",
      valueBg: "bg-sky-500",
      border: "border-sky-100",
      ocid: "dashboard.hours.card",
    },
    {
      label: "Study Streak",
      value: isLoading ? null : `${streak} day${streak !== 1 ? "s" : ""} 🔥`,
      icon: Flame,
      gradient: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueBg: "bg-amber-500",
      border: "border-amber-100",
      ocid: "dashboard.streak.card",
    },
    {
      label: "Subjects",
      value: isLoading ? null : `${subjectsWithTopics?.length ?? 0}`,
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueBg: "bg-emerald-500",
      border: "border-emerald-100",
      ocid: "dashboard.subjects.card",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-ocid="dashboard.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your exam preparation at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                data-ocid={stat.ocid}
                className={`shadow-card border ${stat.border} overflow-hidden`}
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${stat.gradient}`}
                />
                <CardContent className="p-4">
                  <div
                    className={`w-9 h-9 rounded-xl ${stat.lightBg} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  {stat.value === null ? (
                    <Skeleton className="h-7 w-16 mb-1" />
                  ) : (
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Subject Progress */}
      <Card
        className="shadow-card border-border"
        data-ocid="dashboard.subjects.section"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 inline-block" />
            Subject Progress
          </CardTitle>
          <button
            type="button"
            data-ocid="dashboard.subjects.link"
            onClick={() => setPage("subjects")}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSubjects ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-2 w-full" />
              </div>
            </>
          ) : subjectsWithTopics && subjectsWithTopics.length > 0 ? (
            subjectsWithTopics.map(
              ([subject, topics]: [Subject, Topic[]], idx: number) => {
                const done = topics.filter(
                  (t) => t.status === Variant_notStarted_done_inProgress.done,
                ).length;
                const pct =
                  topics.length > 0
                    ? Math.round((done / topics.length) * 100)
                    : 0;
                const colors = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                return (
                  <div key={subject.id.toString()} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${colors.text}`}>
                        {subject.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {done}/{topics.length} topics · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )
          ) : (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="dashboard.subjects.empty_state"
            >
              No subjects yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Study Sessions */}
      <Card
        className="shadow-card border-border"
        data-ocid="dashboard.sessions.section"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 inline-block" />
            Recent Study Sessions
          </CardTitle>
          <button
            type="button"
            data-ocid="dashboard.studylog.link"
            onClick={() => setPage("studylog")}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div
              className="space-y-3"
              data-ocid="dashboard.sessions.loading_state"
            >
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentSessions.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="dashboard.sessions.empty_state"
            >
              <p className="text-sm text-muted-foreground">
                No study sessions logged yet.
              </p>
              <button
                type="button"
                onClick={() => setPage("studylog")}
                className="text-sm text-emerald-600 hover:underline mt-1 font-medium"
              >
                Log your first session →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session, idx) => {
                const colors = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                return (
                  <div
                    key={session.id.toString()}
                    data-ocid={`dashboard.sessions.item.${idx + 1}`}
                    className={`flex items-center justify-between p-3 rounded-xl ${colors.bg} border ${colors.border}`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${colors.text}`}>
                        {subjectMap.get(session.subjectId.toString()) ??
                          "Unknown Subject"}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
                        variant="outline"
                      >
                        {Number(session.durationMinutes)} min
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(session.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
