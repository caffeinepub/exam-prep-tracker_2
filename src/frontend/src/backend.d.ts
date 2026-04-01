import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Topic {
    id: bigint;
    status: Variant_notStarted_done_inProgress;
    name: string;
    subjectId: bigint;
    notes?: string;
}
export interface StudySession {
    id: bigint;
    durationMinutes: bigint;
    subjectId: bigint;
    notes?: string;
    timestamp: bigint;
}
export interface Subject {
    id: bigint;
    name: string;
    description?: string;
}
export interface UserProfile {
    name: string;
}
export interface MockTest {
    id: bigint;
    maxScore: bigint;
    score: bigint;
    notes?: string;
    timestamp: bigint;
    examName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_notStarted_done_inProgress {
    notStarted = "notStarted",
    done = "done",
    inProgress = "inProgress"
}
export interface backendInterface {
    addSubject(name: string, description: string | null): Promise<bigint>;
    addTopic(subjectId: bigint, name: string, notes: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMockTest(id: bigint): Promise<void>;
    deleteStudySession(id: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    deleteTopic(id: bigint): Promise<void>;
    getAllMockTests(): Promise<Array<MockTest>>;
    getAllStudySessions(): Promise<Array<StudySession>>;
    getAllSubjects(): Promise<Array<Subject>>;
    getAllSubjectsDetailed(): Promise<Array<[Subject, Array<Topic>]>>;
    getAllSubjectsWithTopics(): Promise<Array<[Subject, Array<Topic>]>>;
    getAllTopics(): Promise<Array<Topic>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMockTestsByExamName(examName: string): Promise<Array<MockTest>>;
    getMockTestsByScoreRange(minScore: bigint, maxScore: bigint): Promise<Array<MockTest>>;
    getSessionsByDateRange(startTimestamp: bigint, endTimestamp: bigint): Promise<Array<StudySession>>;
    getSessionsBySubject(subjectId: bigint): Promise<Array<StudySession>>;
    getSubject(id: bigint): Promise<Subject>;
    getTopicCompletionPercentage(): Promise<number>;
    getTopicsBySubject(subjectId: bigint): Promise<Array<Topic>>;
    getTotalStudyHours(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logStudySession(subjectId: bigint, durationMinutes: bigint, notes: string | null): Promise<bigint>;
    recordMockTest(examName: string, score: bigint, maxScore: bigint, notes: string | null): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMockTest(id: bigint, score: bigint, maxScore: bigint, notes: string | null): Promise<void>;
    updateStudySession(id: bigint, durationMinutes: bigint, notes: string | null): Promise<void>;
    updateSubject(id: bigint, name: string, description: string | null): Promise<void>;
    updateTopic(id: bigint, name: string, notes: string | null): Promise<void>;
    updateTopicStatus(id: bigint, status: Variant_notStarted_done_inProgress): Promise<void>;
}
