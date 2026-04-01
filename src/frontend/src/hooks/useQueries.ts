import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Variant_notStarted_done_inProgress } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSubjectsWithTopics() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subjectsWithTopics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubjectsWithTopics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllStudySessions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studySessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudySessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMockTests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["mockTests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMockTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopicCompletionPercentage() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topicCompletion"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTopicCompletionPercentage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalStudyHours() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalStudyHours"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalStudyHours();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string | null }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubject(name, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
    },
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: { id: bigint; name: string; description: string | null }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSubject(id, name, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSubject(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
    },
  });
}

export function useAddTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      name,
      notes,
    }: { subjectId: bigint; name: string; notes: string | null }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTopic(subjectId, name, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
      qc.invalidateQueries({ queryKey: ["topicCompletion"] });
    },
  });
}

export function useUpdateTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      notes,
    }: { id: bigint; name: string; notes: string | null }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTopic(id, name, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
    },
  });
}

export function useUpdateTopicStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: Variant_notStarted_done_inProgress }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTopicStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
      qc.invalidateQueries({ queryKey: ["topicCompletion"] });
    },
  });
}

export function useDeleteTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTopic(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjectsWithTopics"] });
      qc.invalidateQueries({ queryKey: ["topicCompletion"] });
    },
  });
}

export function useLogStudySession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      durationMinutes,
      notes,
    }: {
      subjectId: bigint;
      durationMinutes: bigint;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.logStudySession(subjectId, durationMinutes, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["studySessions"] });
      qc.invalidateQueries({ queryKey: ["totalStudyHours"] });
    },
  });
}

export function useDeleteStudySession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudySession(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["studySessions"] });
      qc.invalidateQueries({ queryKey: ["totalStudyHours"] });
    },
  });
}

export function useRecordMockTest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examName,
      score,
      maxScore,
      notes,
    }: {
      examName: string;
      score: bigint;
      maxScore: bigint;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordMockTest(examName, score, maxScore, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mockTests"] });
    },
  });
}

export function useDeleteMockTest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMockTest(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mockTests"] });
    },
  });
}
