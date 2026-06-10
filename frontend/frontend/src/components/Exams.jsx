import React, { useState, useEffect } from "react";
import api from "../services/api";

function ExamTracker() {
  const [exams, setExams] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get("exams/");
      setExams(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch exams.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!subjectName.trim() || !examDate) return;

    try {
      const response = await api.post("exams/", {
        subject_name: subjectName,
        exam_date: examDate,
      });
      // Ensure local state appends an empty array for syllabus_items
      setExams([...exams, { ...response.data, syllabus_items: [] }]);
      setSubjectName("");
      setExamDate("");
    } catch (err) {
      console.error(err);
      setError("Could not add exam.");
    }
  };

  const handleDeleteExam = async (id, e) => {
    e.stopPropagation(); // Prevents expanding the card when clicking delete
    try {
      await api.delete(`exams/${id}/`);
      setExams(exams.filter((exam) => exam.id !== id));
      if (expandedExamId === id) setExpandedExamId(null);
    } catch (err) {
      console.error(err);
      setError("Could not delete exam.");
    }
  };

  // 1. Add Syllabus Item (Topic) to a specific Exam
  const handleAddSyllabusItem = async (e, examId) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      // Adjust endpoint string if your Django route uses a different path (e.g., 'syllabus/')
      const response = await api.post("exams/", {
        exam: examId, // Passes foreign key ID
        topic_name: newTopicName,
        is_completed: false,
      });

      // Update local state by injecting the new item into the target exam's array
      setExams(
        exams.map((exam) => {
          if (exam.id === examId) {
            const updatedItems = [...exam.syllabus_items, response.data];
            // Recalculate quick progress locally until next full page refresh
            const completedCount = updatedItems.filter(
              (item) => item.is_completed
            ).length;
            const newProgress = roundProgress(
              completedCount,
              updatedItems.length
            );
            return {
              ...exam,
              syllabus_items: updatedItems,
              progress: newProgress,
            };
          }
          return exam;
        })
      );
      setNewTopicName("");
    } catch (err) {
      console.error(err);
      setError("Could not add syllabus item.");
    }
  };

  // 2. Toggle Status of a Syllabus Item
  const handleToggleSyllabusItem = async (examId, itemId, currentStatus) => {
    try {
      const response = await api.patch(`syllabus/${itemId}/`, {
        is_completed: !currentStatus,
      });

      setExams(
        exams.map((exam) => {
          if (exam.id === examId) {
            const updatedItems = exam.syllabus_items.map((item) =>
              item.id === itemId ? response.data : item
            );
            const completedCount = updatedItems.filter(
              (item) => item.is_completed
            ).length;
            const newProgress = roundProgress(
              completedCount,
              updatedItems.length
            );
            return {
              ...exam,
              syllabus_items: updatedItems,
              progress: newProgress,
            };
          }
          return exam;
        })
      );
    } catch (err) {
      console.error(err);
      setError("Could not update topic status.");
    }
  };

  const roundProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100 * 100) / 100;
  };

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDateObj = new Date(dateString);
    examDateObj.setHours(0, 0, 0, 0);

    const differenceInTime = examDateObj.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays === 0) return "Today! 🚨";
    if (differenceInDays < 0) return "Passed";
    return `${differenceInDays} days left`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add Exam Form */}
      <form onSubmit={handleAddExam} className="space-y-2 mb-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject Name"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition shrink-0"
            >
              Add Exam
            </button>
          </div>
        </div>
      </form>

      {error && <p className="text-rose-400 text-xs mb-2">⚠️ {error}</p>}

      {loading ? (
        <p className="text-slate-500 text-sm animate-pulse">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-slate-500 text-sm italic">
          No upcoming exams tracked.
        </p>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {exams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            const countdownText = getDaysRemaining(exam.exam_date);
            const isUrgent =
              (countdownText.includes("days left") &&
                parseInt(countdownText) <= 3) ||
              countdownText.includes("Today");

            return (
              <div
                key={exam.id}
                onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                className={`bg-slate-900/50 border rounded-xl p-4 space-y-3 transition cursor-pointer ${
                  isExpanded
                    ? "border-indigo-500 bg-slate-900/80"
                    : "border-slate-700/60 hover:border-slate-600"
                }`}
              >
                {/* Main Exam Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1.5">
                      {isExpanded ? "🔽" : "▶️"} {exam.subject_name}
                    </h4>
                    <p className="text-xs text-slate-400 pl-5">
                      {new Date(exam.exam_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        isUrgent
                          ? "bg-rose-950/40 text-rose-300 border-rose-800/60"
                          : "bg-indigo-950/40 text-indigo-300 border-indigo-800/60"
                      }`}
                    >
                      {countdownText}
                    </span>
                    <button
                      onClick={(e) => handleDeleteExam(exam.id, e)}
                      className="text-slate-500 hover:text-rose-400 text-sm transition p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Progress Bar Bar */}
                <div className="space-y-1 pl-5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Syllabus Completed</span>
                    <span className="font-medium text-indigo-400">
                      {exam.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${exam.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Collapsible Sub-Syllabus Section */}
                {isExpanded && (
                  <div
                    className="pt-3 border-t border-slate-800 space-y-3 pl-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Add Topic Inline Form */}
                    <form
                      onSubmit={(e) => handleAddSyllabusItem(e, exam.id)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="New topic (e.g., Crystal Structures)"
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-slate-800 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        + Add
                      </button>
                    </form>

                    {/* Syllabus Item List Checkboxes */}
                    {!exam.syllabus_items ||
                    exam.syllabus_items.length === 0 ? (
                      <p className="text-slate-500 text-[11px] italic">
                        No topics added to syllabus yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {exam.syllabus_items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-2.5 bg-slate-950/40 border border-slate-800/40 p-2 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              onChange={() =>
                                handleToggleSyllabusItem(
                                  exam.id,
                                  item.id,
                                  item.is_completed
                                )
                              }
                              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 cursor-pointer"
                            />
                            <span
                              className={`text-xs truncate ${
                                item.is_completed
                                  ? "line-through text-slate-500"
                                  : "text-slate-300"
                              }`}
                            >
                              {item.topic_name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExamTracker;
