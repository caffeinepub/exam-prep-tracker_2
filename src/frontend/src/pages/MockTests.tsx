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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { MockTest } from "../backend.d";
import {
  useDeleteMockTest,
  useGetAllMockTests,
  useRecordMockTest,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getScorePct(score: bigint, maxScore: bigint): number {
  if (maxScore === 0n) return 0;
  return Math.round((Number(score) / Number(maxScore)) * 100);
}

function scoreBadgeClass(pct: number): string {
  if (pct >= 80) return "bg-green-50 text-green-700 border-green-200";
  if (pct >= 60) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export default function MockTests() {
  const { data: tests, isLoading } = useGetAllMockTests();
  const recordTest = useRecordMockTest();
  const deleteTest = useDeleteMockTest();

  const [examName, setExamName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const sortedTests = tests
    ? [...tests].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  const chartData = sortedTests
    .slice()
    .reverse()
    .map((t) => ({
      name: formatDate(t.timestamp),
      score: getScorePct(t.score, t.maxScore),
      exam: t.examName,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !score || !maxScore) return;
    const s = Number.parseInt(score, 10);
    const m = Number.parseInt(maxScore, 10);
    if (Number.isNaN(s) || Number.isNaN(m) || m <= 0 || s < 0 || s > m) {
      toast.error("Check score values");
      return;
    }
    try {
      await recordTest.mutateAsync({
        examName: examName.trim(),
        score: BigInt(s),
        maxScore: BigInt(m),
        notes: notes.trim() || null,
      });
      toast.success("Test recorded!");
      setExamName("");
      setScore("");
      setMaxScore("");
      setNotes("");
    } catch {
      toast.error("Failed to record test");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-ocid="mocktests.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Mock Tests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your mock test performance
        </p>
      </div>

      {/* Record Test Form */}
      <Card className="shadow-card" data-ocid="mocktests.record.section">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">
            Record a Mock Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="exam-name">Exam Name</Label>
                <Input
                  id="exam-name"
                  data-ocid="mocktests.examname.input"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. SSC CGL Mock 1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  data-ocid="mocktests.score.input"
                  type="number"
                  min="0"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 75"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-score">Max Score</Label>
                <Input
                  id="max-score"
                  data-ocid="mocktests.maxscore.input"
                  type="number"
                  min="1"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-notes">Notes (optional)</Label>
              <Textarea
                id="test-notes"
                data-ocid="mocktests.notes.textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Areas to improve, observations..."
                rows={2}
              />
            </div>
            <Button
              type="submit"
              data-ocid="mocktests.record.submit_button"
              disabled={
                !examName.trim() || !score || !maxScore || recordTest.isPending
              }
            >
              {recordTest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Record Test
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Score Trend Chart */}
      {!isLoading && chartData.length >= 2 && (
        <Card className="shadow-card" data-ocid="mocktests.chart.section">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold">
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#5b4ed8"
                  strokeWidth={2}
                  dot={{ fill: "#5b4ed8", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      <Card className="shadow-card" data-ocid="mocktests.tests.section">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">
            Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="space-y-3"
              data-ocid="mocktests.tests.loading_state"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : sortedTests.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="mocktests.tests.empty_state"
            >
              <Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No mock tests recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTests.map((test: MockTest, idx: number) => {
                const pct = getScorePct(test.score, test.maxScore);
                return (
                  <div
                    key={test.id.toString()}
                    data-ocid={`mocktests.tests.item.${idx + 1}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {test.examName}
                      </p>
                      {test.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {test.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                          {Number(test.score)}/{Number(test.maxScore)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(test.timestamp)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs border ${scoreBadgeClass(pct)}`}
                      >
                        {pct}%
                      </Badge>
                      <Button
                        data-ocid={`mocktests.tests.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(test.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="mocktests.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test?</AlertDialogTitle>
            <AlertDialogDescription>
              This mock test record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="mocktests.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="mocktests.delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId === null) return;
                try {
                  await deleteTest.mutateAsync(deleteId);
                  toast.success("Test deleted");
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
