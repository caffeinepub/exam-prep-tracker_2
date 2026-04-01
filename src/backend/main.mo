import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Types
  type Subject = {
    id : Nat;
    name : Text;
    description : ?Text;
  };

  type Topic = {
    id : Nat;
    subjectId : Nat;
    name : Text;
    status : {
      #notStarted;
      #inProgress;
      #done;
    };
    notes : ?Text;
  };

  type StudySession = {
    id : Nat;
    subjectId : Nat;
    durationMinutes : Nat;
    timestamp : Int;
    notes : ?Text;
  };

  type MockTest = {
    id : Nat;
    examName : Text;
    score : Nat;
    maxScore : Nat;
    timestamp : Int;
    notes : ?Text;
  };

  module Subject {
    public func compare(a : Subject, b : Subject) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Topic {
    public func compare(a : Topic, b : Topic) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module StudySession {
    public func compare(a : StudySession, b : StudySession) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module MockTest {
    public func compare(a : MockTest, b : MockTest) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Persistent storage
  let subjects = Map.empty<Nat, Subject>();
  let topics = Map.empty<Nat, Topic>();
  let studySessions = Map.empty<Nat, StudySession>();
  let mockTests = Map.empty<Nat, MockTest>();

  // ID counters
  var nextSubjectId = 1;
  var nextTopicId = 1;
  var nextSessionId = 1;
  var nextTestId = 1;

  // Helper functions
  func getSubjectInternal(id : Nat) : Subject {
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) { subject };
    };
  };

  func getTopicInternal(id : Nat) : Topic {
    switch (topics.get(id)) {
      case (null) { Runtime.trap("Topic not found") };
      case (?topic) { topic };
    };
  };

  // Subject Management
  public shared ({ caller }) func addSubject(name : Text, description : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    assert name.size() > 0;
    let id = nextSubjectId;
    let subject : Subject = {
      id;
      name;
      description;
    };
    subjects.add(id, subject);
    nextSubjectId += 1;
    id;
  };

  public shared ({ caller }) func updateSubject(id : Nat, name : Text, description : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore getSubjectInternal(id);
    let updatedSubject : Subject = {
      id;
      name;
      description;
    };
    subjects.add(id, updatedSubject);
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore getSubjectInternal(id);
    subjects.remove(id);

    // Remove associated topics
    let toRemove = List.empty<Nat>();
    for ((topicId, topic) in topics.entries()) {
      if (topic.subjectId == id) {
        toRemove.add(topicId);
      };
    };
    toRemove.values().forEach(func(topicId) { topics.remove(topicId) });
  };

  public query ({ caller }) func getSubject(id : Nat) : async Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    getSubjectInternal(id);
  };

  public query ({ caller }) func getAllSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    subjects.values().toArray().sort();
  };

  // Topic Management
  public shared ({ caller }) func addTopic(subjectId : Nat, name : Text, notes : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore getSubjectInternal(subjectId);
    let id = nextTopicId;
    let topic : Topic = {
      id;
      subjectId;
      name;
      status = #notStarted;
      notes;
    };
    topics.add(id, topic);
    nextTopicId += 1;
    id;
  };

  public query ({ caller }) func getTopicsBySubject(subjectId : Nat) : async [Topic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    topics.values().toArray().filter(
      func(t) { t.subjectId == subjectId }
    );
  };

  public query ({ caller }) func getAllTopics() : async [Topic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    topics.values().toArray().sort();
  };

  public query ({ caller }) func getAllSubjectsWithTopics() : async [(Subject, [Topic])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    subjects.toArray().map(
      func((_, s)) {
        (
          s,
          topics.toArray().filter(
            func((_, t)) { t.subjectId == s.id }
          ).map(func((_, t)) { t }),
        );
      }
    );
  };

  public query ({ caller }) func getAllSubjectsDetailed() : async [(Subject, [Topic])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    subjects.values().toArray().sort().map(
      func(s) {
        (
          s,
          topics.values().toArray().sort().filter(
            func(t) { t.subjectId == s.id }
          ),
        );
      }
    );
  };

  public shared ({ caller }) func updateTopic(id : Nat, name : Text, notes : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let existing = getTopicInternal(id);
    topics.add(
      id,
      {
        existing with
        name;
        notes;
      },
    );
  };

  public shared ({ caller }) func updateTopicStatus(id : Nat, status : { #notStarted; #inProgress; #done }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let existing = getTopicInternal(id);
    topics.add(
      id,
      {
        existing with
        status;
      },
    );
  };

  public shared ({ caller }) func deleteTopic(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore getTopicInternal(id);
    topics.remove(id);
  };

  // Study Session Management
  public shared ({ caller }) func logStudySession(subjectId : Nat, durationMinutes : Nat, notes : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore getSubjectInternal(subjectId);
    let id = nextSessionId;
    let session : StudySession = {
      id;
      subjectId;
      durationMinutes;
      timestamp = Time.now(); 
      notes;
    };
    studySessions.add(id, session);
    nextSessionId += 1;
    id;
  };

  public query ({ caller }) func getSessionsByDateRange(startTimestamp : Int, endTimestamp : Int) : async [StudySession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    studySessions.values().toArray().filter(
      func(s) { s.timestamp >= startTimestamp and s.timestamp <= endTimestamp }
    );
  };

  public query ({ caller }) func getAllStudySessions() : async [StudySession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    studySessions.values().toArray().sort();
  };

  public query ({ caller }) func getSessionsBySubject(subjectId : Nat) : async [StudySession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    studySessions.values().toArray().filter(
      func(s) { s.subjectId == subjectId }
    );
  };

  public shared ({ caller }) func updateStudySession(id : Nat, durationMinutes : Nat, notes : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let session = switch (studySessions.get(id)) {
      case (null) { Runtime.trap("StudySession not found") };
      case (?s) { s };
    };
    studySessions.add(
      id,
      {
        session with
        durationMinutes;
        notes;
      },
    );
  };

  public shared ({ caller }) func deleteStudySession(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore switch (studySessions.get(id)) {
      case (null) { Runtime.trap("StudySession not found") };
      case (?session) { session };
    };
    studySessions.remove(id);
  };

  // Mock Test Management
  public shared ({ caller }) func recordMockTest(examName : Text, score : Nat, maxScore : Nat, notes : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    assert maxScore > 0;
    assert score <= maxScore;
    let id = nextTestId;
    let test : MockTest = {
      id;
      examName;
      score;
      maxScore;
      timestamp = Time.now();
      notes;
    };
    mockTests.add(id, test);
    nextTestId += 1;
    id;
  };

  public query ({ caller }) func getAllMockTests() : async [MockTest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    mockTests.values().toArray().sort();
  };

  public query ({ caller }) func getMockTestsByScoreRange(minScore : Nat, maxScore : Nat) : async [MockTest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    mockTests.values().toArray().filter(
      func(t) { t.score >= minScore and t.score <= maxScore }
    );
  };

  public query ({ caller }) func getMockTestsByExamName(examName : Text) : async [MockTest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    mockTests.values().toArray().filter(
      func(t) { t.examName.contains(#text examName) }
    );
  };

  public shared ({ caller }) func updateMockTest(id : Nat, score : Nat, maxScore : Nat, notes : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    assert maxScore > 0;
    assert score <= maxScore;
    ignore switch (mockTests.get(id)) {
      case (null) { Runtime.trap("MockTest not found") };
      case (?test) { test };
    };
    let updatedTest : MockTest = {
      id;
      examName = "";
      score;
      maxScore;
      timestamp = Time.now();
      notes;
    };
    mockTests.add(id, updatedTest);
  };

  public shared ({ caller }) func deleteMockTest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore switch (mockTests.get(id)) {
      case (null) { Runtime.trap("MockTest not found") };
      case (?test) { test };
    };
    mockTests.remove(id);
  };

  // Stats
  public query ({ caller }) func getTotalStudyHours() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    var totalMinutes = 0;
    for ((_, session) in studySessions.entries()) {
      totalMinutes += session.durationMinutes;
    };
    totalMinutes.toFloat() / 60.0;
  };

  public query ({ caller }) func getTopicCompletionPercentage() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    var completed = 0;
    for ((_, topic) in topics.entries()) {
      if (topic.status == #done) {
        completed += 1;
      };
    };
    if (topics.size() == 0) {
      return 0.0;
    };
    completed.toFloat() / topics.size().toFloat() * 100.0;
  };
};
