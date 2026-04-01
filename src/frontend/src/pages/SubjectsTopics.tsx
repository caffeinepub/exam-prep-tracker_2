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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Subject,
  type Topic,
  Variant_notStarted_done_inProgress,
} from "../backend.d";
import {
  useAddSubject,
  useAddTopic,
  useDeleteSubject,
  useDeleteTopic,
  useGetAllSubjectsWithTopics,
  useUpdateSubject,
  useUpdateTopic,
  useUpdateTopicStatus,
} from "../hooks/useQueries";

const STATUS_OPTIONS = [
  {
    value: Variant_notStarted_done_inProgress.notStarted,
    label: "Not Started",
  },
  {
    value: Variant_notStarted_done_inProgress.inProgress,
    label: "In Progress",
  },
  { value: Variant_notStarted_done_inProgress.done, label: "Done" },
];

const SUBJECT_PALETTE = [
  {
    header: "from-violet-500 to-purple-600",
    headerLight: "bg-violet-50",
    headerBorder: "border-violet-200",
    title: "text-violet-700",
    desc: "text-violet-500/70",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    topicBg: "bg-violet-50/60 border-violet-100",
    topicText: "text-violet-700",
    addBtn: "border-violet-300 text-violet-600 hover:bg-violet-50",
    icon: "text-violet-400",
  },
  {
    header: "from-sky-500 to-cyan-600",
    headerLight: "bg-sky-50",
    headerBorder: "border-sky-200",
    title: "text-sky-700",
    desc: "text-sky-500/70",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    topicBg: "bg-sky-50/60 border-sky-100",
    topicText: "text-sky-700",
    addBtn: "border-sky-300 text-sky-600 hover:bg-sky-50",
    icon: "text-sky-400",
  },
  {
    header: "from-emerald-500 to-teal-600",
    headerLight: "bg-emerald-50",
    headerBorder: "border-emerald-200",
    title: "text-emerald-700",
    desc: "text-emerald-500/70",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    topicBg: "bg-emerald-50/60 border-emerald-100",
    topicText: "text-emerald-700",
    addBtn: "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
    icon: "text-emerald-400",
  },
  {
    header: "from-amber-500 to-orange-500",
    headerLight: "bg-amber-50",
    headerBorder: "border-amber-200",
    title: "text-amber-700",
    desc: "text-amber-500/70",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    topicBg: "bg-amber-50/60 border-amber-100",
    topicText: "text-amber-700",
    addBtn: "border-amber-300 text-amber-600 hover:bg-amber-50",
    icon: "text-amber-400",
  },
  {
    header: "from-rose-500 to-pink-600",
    headerLight: "bg-rose-50",
    headerBorder: "border-rose-200",
    title: "text-rose-700",
    desc: "text-rose-500/70",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    topicBg: "bg-rose-50/60 border-rose-100",
    topicText: "text-rose-700",
    addBtn: "border-rose-300 text-rose-600 hover:bg-rose-50",
    icon: "text-rose-400",
  },
  {
    header: "from-fuchsia-500 to-violet-600",
    headerLight: "bg-fuchsia-50",
    headerBorder: "border-fuchsia-200",
    title: "text-fuchsia-700",
    desc: "text-fuchsia-500/70",
    badge: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    topicBg: "bg-fuchsia-50/60 border-fuchsia-100",
    topicText: "text-fuchsia-700",
    addBtn: "border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50",
    icon: "text-fuchsia-400",
  },
];

const STATUS_STYLES: Record<Variant_notStarted_done_inProgress, string> = {
  [Variant_notStarted_done_inProgress.notStarted]:
    "bg-slate-100 text-slate-600 border-slate-200",
  [Variant_notStarted_done_inProgress.inProgress]:
    "bg-amber-100 text-amber-700 border-amber-200",
  [Variant_notStarted_done_inProgress.done]:
    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function SubjectsTopics() {
  const { data: subjectsWithTopics, isLoading } = useGetAllSubjectsWithTopics();

  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const addTopic = useAddTopic();
  const updateTopic = useUpdateTopic();
  const updateTopicStatus = useUpdateTopicStatus();
  const deleteTopic = useDeleteTopic();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(),
  );

  // Subject dialog
  const [subjectDialog, setSubjectDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    subject?: Subject;
  }>({ open: false, mode: "add" });
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");

  // Topic dialog
  const [topicDialog, setTopicDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    subjectId?: bigint;
    topic?: Topic;
  }>({ open: false, mode: "add" });
  const [topicName, setTopicName] = useState("");
  const [topicNotes, setTopicNotes] = useState("");

  // Delete confirmations
  const [deleteSubjectId, setDeleteSubjectId] = useState<bigint | null>(null);
  const [deleteTopicId, setDeleteTopicId] = useState<bigint | null>(null);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddSubject = () => {
    setSubjectName("");
    setSubjectDesc("");
    setSubjectDialog({ open: true, mode: "add" });
  };

  const openEditSubject = (subject: Subject) => {
    setSubjectName(subject.name);
    setSubjectDesc(subject.description ?? "");
    setSubjectDialog({ open: true, mode: "edit", subject });
  };

  const handleSubjectSubmit = async () => {
    if (!subjectName.trim()) return;
    try {
      if (subjectDialog.mode === "add") {
        await addSubject.mutateAsync({
          name: subjectName.trim(),
          description: subjectDesc.trim() || null,
        });
        toast.success("Subject added");
      } else if (subjectDialog.subject) {
        await updateSubject.mutateAsync({
          id: subjectDialog.subject.id,
          name: subjectName.trim(),
          description: subjectDesc.trim() || null,
        });
        toast.success("Subject updated");
      }
      setSubjectDialog({ open: false, mode: "add" });
    } catch {
      toast.error("Failed to save subject");
    }
  };

  const openAddTopic = (subjectId: bigint) => {
    setTopicName("");
    setTopicNotes("");
    setTopicDialog({ open: true, mode: "add", subjectId });
  };

  const openEditTopic = (topic: Topic) => {
    setTopicName(topic.name);
    setTopicNotes(topic.notes ?? "");
    setTopicDialog({ open: true, mode: "edit", topic });
  };

  const handleTopicSubmit = async () => {
    if (!topicName.trim()) return;
    try {
      if (topicDialog.mode === "add" && topicDialog.subjectId != null) {
        await addTopic.mutateAsync({
          subjectId: topicDialog.subjectId,
          name: topicName.trim(),
          notes: topicNotes.trim() || null,
        });
        toast.success("Topic added");
      } else if (topicDialog.topic) {
        await updateTopic.mutateAsync({
          id: topicDialog.topic.id,
          name: topicName.trim(),
          notes: topicNotes.trim() || null,
        });
        toast.success("Topic updated");
      }
      setTopicDialog({ open: false, mode: "add" });
    } catch {
      toast.error("Failed to save topic");
    }
  };

  const handleStatusChange = async (
    topicId: bigint,
    status: Variant_notStarted_done_inProgress,
  ) => {
    try {
      await updateTopicStatus.mutateAsync({ id: topicId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-ocid="subjects.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Subjects & Topics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your study curriculum
          </p>
        </div>
        <Button
          data-ocid="subjects.add_subject.open_modal_button"
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
          onClick={openAddSubject}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Subject
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="subjects.loading_state">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !subjectsWithTopics || subjectsWithTopics.length === 0 ? (
        <Card data-ocid="subjects.empty_state">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No subjects yet. Add your first subject to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subjectsWithTopics.map(
            ([subject, topics]: [Subject, Topic[]], idx: number) => {
              const expanded = expandedSubjects.has(subject.id.toString());
              const done = topics.filter(
                (t) => t.status === Variant_notStarted_done_inProgress.done,
              ).length;
              const pct =
                topics.length > 0
                  ? Math.round((done / topics.length) * 100)
                  : 0;
              const palette = SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length];
              return (
                <Card
                  key={subject.id.toString()}
                  data-ocid={`subjects.item.${idx + 1}`}
                  className="shadow-card overflow-hidden border-0"
                >
                  {/* Colored top bar */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${palette.header}`}
                  />

                  <CardHeader
                    className={`pb-3 ${palette.headerLight} border-b ${palette.headerBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleSubject(subject.id.toString())}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="flex-1">
                          <h3
                            className={`font-display text-base font-bold ${palette.title}`}
                          >
                            {subject.name}
                          </h3>
                          {subject.description && (
                            <p className={`text-xs mt-0.5 ${palette.desc}`}>
                              {subject.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${palette.badge}`}
                          >
                            {done}/{topics.length} done · {pct}%
                          </span>
                          {expanded ? (
                            <ChevronUp className={`h-4 w-4 ${palette.icon}`} />
                          ) : (
                            <ChevronDown
                              className={`h-4 w-4 ${palette.icon}`}
                            />
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          data-ocid={`subjects.edit_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${palette.icon} hover:bg-white/60`}
                          onClick={() => openEditSubject(subject)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`subjects.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-white/60"
                          onClick={() => setDeleteSubjectId(subject.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expanded && (
                    <CardContent className="pt-3 pb-4 space-y-2 bg-white">
                      {topics.length === 0 ? (
                        <p
                          className="text-sm text-muted-foreground text-center py-3"
                          data-ocid={`subjects.topics.empty_state.${idx + 1}`}
                        >
                          No topics yet.
                        </p>
                      ) : (
                        topics.map((topic, tIdx) => (
                          <div
                            key={topic.id.toString()}
                            data-ocid={`subjects.topics.item.${tIdx + 1}`}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${palette.topicBg}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold ${palette.topicText} truncate`}
                              >
                                {topic.name}
                              </p>
                              {topic.notes && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {topic.notes}
                                </p>
                              )}
                            </div>
                            <Select
                              value={topic.status}
                              onValueChange={(v) =>
                                handleStatusChange(
                                  topic.id,
                                  v as Variant_notStarted_done_inProgress,
                                )
                              }
                            >
                              <SelectTrigger
                                data-ocid={`subjects.topics.status.${tIdx + 1}`}
                                className={`w-32 h-7 text-xs border font-medium ${STATUS_STYLES[topic.status as Variant_notStarted_done_inProgress] ?? ""}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs"
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                              <Button
                                data-ocid={`subjects.topics.edit_button.${tIdx + 1}`}
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${palette.icon} hover:bg-white`}
                                onClick={() => openEditTopic(topic)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                data-ocid={`subjects.topics.delete_button.${tIdx + 1}`}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-white"
                                onClick={() => setDeleteTopicId(topic.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      <Button
                        data-ocid={`subjects.add_topic.button.${idx + 1}`}
                        variant="outline"
                        size="sm"
                        className={`w-full mt-2 ${palette.addBtn}`}
                        onClick={() => openAddTopic(subject.id)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Topic
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            },
          )}
        </div>
      )}

      {/* Subject Dialog */}
      <Dialog
        open={subjectDialog.open}
        onOpenChange={(o) => setSubjectDialog((p) => ({ ...p, open: o }))}
      >
        <DialogContent data-ocid="subjects.subject.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {subjectDialog.mode === "add" ? "Add Subject" : "Edit Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">Name</Label>
              <Input
                id="subject-name"
                data-ocid="subjects.subject.name.input"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Arithmetic Reasoning"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-desc">Description (optional)</Label>
              <Textarea
                id="subject-desc"
                data-ocid="subjects.subject.description.textarea"
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="subjects.subject.cancel_button"
              onClick={() => setSubjectDialog({ open: false, mode: "add" })}
            >
              Cancel
            </Button>
            <Button
              data-ocid="subjects.subject.submit_button"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              onClick={handleSubjectSubmit}
              disabled={
                !subjectName.trim() ||
                addSubject.isPending ||
                updateSubject.isPending
              }
            >
              {(addSubject.isPending || updateSubject.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {subjectDialog.mode === "add" ? "Add Subject" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog
        open={topicDialog.open}
        onOpenChange={(o) => setTopicDialog((p) => ({ ...p, open: o }))}
      >
        <DialogContent data-ocid="subjects.topic.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {topicDialog.mode === "add" ? "Add Topic" : "Edit Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="topic-name">Topic Name</Label>
              <Input
                id="topic-name"
                data-ocid="subjects.topic.name.input"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Fractions & Decimals"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-notes">Notes (optional)</Label>
              <Textarea
                id="topic-notes"
                data-ocid="subjects.topic.notes.textarea"
                value={topicNotes}
                onChange={(e) => setTopicNotes(e.target.value)}
                placeholder="Study notes or references..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="subjects.topic.cancel_button"
              onClick={() => setTopicDialog({ open: false, mode: "add" })}
            >
              Cancel
            </Button>
            <Button
              data-ocid="subjects.topic.submit_button"
              className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white"
              onClick={handleTopicSubmit}
              disabled={
                !topicName.trim() || addTopic.isPending || updateTopic.isPending
              }
            >
              {(addTopic.isPending || updateTopic.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {topicDialog.mode === "add" ? "Add Topic" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subject Confirmation */}
      <AlertDialog
        open={deleteSubjectId !== null}
        onOpenChange={(o) => !o && setDeleteSubjectId(null)}
      >
        <AlertDialogContent data-ocid="subjects.delete_subject.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the subject and all its topics. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="subjects.delete_subject.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="subjects.delete_subject.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteSubjectId === null) return;
                try {
                  await deleteSubject.mutateAsync(deleteSubjectId);
                  toast.success("Subject deleted");
                } catch {
                  toast.error("Failed to delete");
                }
                setDeleteSubjectId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Topic Confirmation */}
      <AlertDialog
        open={deleteTopicId !== null}
        onOpenChange={(o) => !o && setDeleteTopicId(null)}
      >
        <AlertDialogContent data-ocid="subjects.delete_topic.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This topic will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="subjects.delete_topic.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="subjects.delete_topic.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTopicId === null) return;
                try {
                  await deleteTopic.mutateAsync(deleteTopicId);
                  toast.success("Topic deleted");
                } catch {
                  toast.error("Failed to delete");
                }
                setDeleteTopicId(null);
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
