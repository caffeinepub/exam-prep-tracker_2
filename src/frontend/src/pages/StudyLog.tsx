import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudySession, Subject } from "../backend.d";
import {
  useDeleteStudySession,
  useGetAllStudySessions,
  useGetAllSubjects,
  useLogStudySession,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudyLog() {
  const { data: sessions, isLoading: loadingSessions } =
    useGetAllStudySessions();
  const { data: subjects, isLoading: loadingSubjects } = useGetAllSubjects();
  const logSession = useLogStudySession();
  const deleteSession = useDeleteStudySession();

  const [subjectId, setSubjectId] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];
  const subjectMap = new Map<string, string>();
  if (subjects) {
    for (const s of subjects) {
      subjectMap.set(s.id.toString(), s.name);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !duration) return;
    const mins = Number.parseInt(duration, 10);
    if (Number.isNaN(mins) || mins <= 0) {
      toast.error("Enter a valid duration");
      return;
    }
    try {
      await logSession.mutateAsync({
        subjectId: BigInt(subjectId),
        durationMinutes: BigInt(mins),
        notes: notes.trim() || null,
      });
      toast.success("Session logged!");
      setSubjectId("");
      setDuration("");
      setNotes("");
    } catch {
      toast.error("Failed to log session");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-ocid="studylog.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Study Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your daily study sessions
        </p>
      </div>

      {/* Log Session Form */}
      <Card className="shadow-card" data-ocid="studylog.log.section">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">
            Log a Study Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="session-subject">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger
                    id="session-subject"
                    data-ocid="studylog.subject.select"
                    disabled={loadingSubjects}
                  >
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s: Subject) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="session-duration">Duration (minutes)</Label>
                <Input
                  id="session-duration"
                  data-ocid="studylog.duration.input"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-notes">Notes (optional)</Label>
              <Textarea
                id="session-notes"
                data-ocid="studylog.notes.textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you study?"
                rows={2}
              />
            </div>
            <Button
              type="submit"
              data-ocid="studylog.log.submit_button"
              disabled={!subjectId || !duration || logSession.isPending}
            >
              {logSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Log Session
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card className="shadow-card" data-ocid="studylog.sessions.section">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">
            All Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div
              className="space-y-3"
              data-ocid="studylog.sessions.loading_state"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : sortedSessions.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="studylog.sessions.empty_state"
            >
              <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No sessions logged yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((session: StudySession, idx: number) => (
                <div
                  key={session.id.toString()}
                  data-ocid={`studylog.sessions.item.${idx + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {subjectMap.get(session.subjectId.toString()) ??
                        "Unknown Subject"}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {Number(session.durationMinutes)} min
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(session.timestamp)}
                    </span>
                    <Button
                      data-ocid={`studylog.sessions.delete_button.${idx + 1}`}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(session.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="studylog.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This study session will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="studylog.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="studylog.delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId === null) return;
                try {
                  await deleteSession.mutateAsync(deleteId);
                  toast.success("Session deleted");
                } catch {
                  toast.error("Failed to delete");
                }
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
