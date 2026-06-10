import React, { useState, useEffect } from "react";
import api from "../services/api";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch To-Dos from Django Backend when component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    console.log(
      "Current Token in LocalStorage:",
      localStorage.getItem("access_token")
    );
    try {
      setLoading(true);
      // Adjust endpoint string if your Django path differs (e.g., 'todos/')
      const response = await api.get("todos/");
      setTodos(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Add a new Task
  // 2. Add a new Task (Updated keys to match Django)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await api.post("todos/", {
        task: newTitle, // <-- Changed from 'title' to 'task'
        is_done: false, // <-- Changed from 'completed' to 'is_done'
      });
      setTodos([...todos, response.data]);
      setNewTitle("");
    } catch (err) {
      console.error(err);
      setError("Could not add task.");
    }
  };

  // 3. Toggle Complete Status (Updated keys to match Django)
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const response = await api.patch(`todos/${id}/`, {
        is_done: !currentStatus, // <-- Changed from 'completed' to 'is_done'
      });
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (err) {
      console.error(err);
      setError("Could not update task status.");
    }
  };

  // 4. Delete a Task
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`todos/${id}/`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error(err);
      setError("Could not delete task.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add Task Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a study goal..."
          className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
        >
          Add
        </button>
      </form>

      {/* Error Feedback */}
      {error && <p className="text-rose-400 text-xs mb-2">⚠️ {error}</p>}

      {/* List Display Container */}
      {loading ? (
        <p className="text-slate-500 text-sm animate-pulse">Loading tasks...</p>
      ) : todos.length === 0 ? (
        <p className="text-slate-500 text-sm italic">
          No tasks yet! Add one above.
        </p>
      ) : (
        <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-slate-900/50 border border-slate-700/60 p-3 rounded-xl gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={todo.is_done} // <-- Changed from todo.completed
                  onChange={() => handleToggleComplete(todo.id, todo.is_done)} // <-- Changed from todo.completed
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span
                  className={`text-sm truncate ${
                    todo.is_done
                      ? "line-through text-slate-500"
                      : "text-slate-200" // <-- Changed from todo.completed
                  }`}
                >
                  {todo.task} {/* <-- Changed from todo.title */}
                </span>
              </div>

              <button
                onClick={() => handleDeleteTask(todo.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
