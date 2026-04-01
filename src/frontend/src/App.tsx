import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BookOpen, Loader2, LogIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useAddSubject, useGetAllSubjects } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import MockTests from "./pages/MockTests";
import StudyLog from "./pages/StudyLog";
import SubjectsTopics from "./pages/SubjectsTopics";

export type Page = "dashboard" | "subjects" | "studylog" | "mocktests";

const DEFAULT_SUBJECTS = [
  {
    name: "Arithmetic Reasoning",
    description: "Quantitative aptitude and reasoning",
  },
  { name: "English", description: "Grammar, comprehension, and vocabulary" },
  {
    name: "General Knowledge",
    description: "Current affairs, history, science, and more",
  },
];

function SeedSubjects({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const { data: subjects, isLoading } = useGetAllSubjects();
  const addSubject = useAddSubject();
  const seededRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || isLoading || seededRef.current) return;
    if (subjects && subjects.length === 0) {
      seededRef.current = true;
      Promise.all(
        DEFAULT_SUBJECTS.map((s) =>
          addSubject.mutateAsync({ name: s.name, description: s.description }),
        ),
      );
    } else if (subjects && subjects.length > 0) {
      seededRef.current = true;
    }
  }, [actor, isFetching, isLoading, subjects, addSubject]);

  return <>{children}</>;
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const { loginStatus, login, identity, isInitializing } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              ExamPrep
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Your personal competitive exam preparation tracker
            </p>
          </div>
          <div className="space-y-1 text-left rounded-xl bg-card border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Covers
            </p>
            {DEFAULT_SUBJECTS.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {s.name}
              </div>
            ))}
          </div>
          <Button
            data-ocid="auth.primary_button"
            className="w-full"
            onClick={login}
            disabled={loginStatus === "logging-in"}
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login to Get Started
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secure login powered by Internet Identity
          </p>
        </div>
      </div>
    );
  }

  return (
    <SeedSubjects>
      <Layout page={page} setPage={setPage}>
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "subjects" && <SubjectsTopics />}
        {page === "studylog" && <StudyLog />}
        {page === "mocktests" && <MockTests />}
      </Layout>
      <Toaster richColors position="top-right" />
    </SeedSubjects>
  );
}
