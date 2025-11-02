import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:5001/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/tasks`)
      setTasks(response.data)
      setInitialLoad(true)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      alert('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch tasks on component mount so inputs become enabled without manual click
  useEffect(() => {
    // call fetchTasks once on mount
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, {
        text: newTask.trim()
      })
      setTasks([response.data, ...tasks])
      setNewTask('')
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Failed to add task')
    }
  }

  const toggleTask = async (taskId, currentStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, {
        completed: !currentStatus
      })
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`)
      setTasks(tasks.filter(task => task._id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Todo List</h1>
          <p>Simple task management app</p>
        </header>

        {/* Load Tasks Button */}
        <div className="load-section">
          {!initialLoad ? (
            <button 
              onClick={fetchTasks} 
              className="load-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Tasks'}
            </button>
          ) : (
            <div className="refresh-section">
              <span className="task-count">Total Tasks: {tasks.length}</span>
              <button 
                onClick={fetchTasks} 
                className="refresh-button"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="task-form">
          <div className="input-group">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="task-input"
              disabled={!initialLoad}
            />
            <button 
              type="submit" 
              className="add-button"
              disabled={!initialLoad || !newTask.trim()}
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <p>Loading tasks...</p>
          </div>
        )}

        {/* Tasks List */}
        {initialLoad && (
          <div className="tasks-container">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="task-section">
                <h2>Pending Tasks ({pendingTasks.length})</h2>
                <div className="tasks-list">
                  {pendingTasks.map(task => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="task-section">
                <h2>Completed Tasks ({completedTasks.length})</h2>
                <div className="tasks-list completed">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && tasks.length === 0 && (
              <div className="empty-state">
                <p>No tasks yet. Add a task to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Initial Load Prompt */}
        {!initialLoad && !loading && (
          <div className="initial-prompt">
            <p>Click "Load Tasks" to see your todo list</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Task Item Component
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <button
          onClick={() => onToggle(task._id, task.completed)}
          className={`checkbox ${task.completed ? 'checked' : ''}`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && '✓'}
        </button>
        <span className="task-text">{task.text}</span>
      </div>
      <button
        onClick={() => onDelete(task._id)}
        className="delete-button"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  )
}

export default App