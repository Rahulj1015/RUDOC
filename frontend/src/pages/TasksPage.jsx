export default function TasksPage({
  tasks,
  selectedService,
  onStatusChange,
  onCreateTasks,
}) {
  const completedCount = tasks.filter((t) => t.status === 'Completed').length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const statuses = ['Not Started', 'In Progress', 'Completed']

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-teal">Task Action Plan</span>
            <h3 className="card-title" style={{ marginTop: '4px' }}>
              Missing Document Roadmap for {selectedService?.title || 'Selected Service'}
            </h3>
            <p className="card-subtitle">
              Follow these actionable steps to obtain your missing certificates and documents before the deadline.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCreateTasks}
          >
            🔄 Refresh Plan
          </button>
        </div>

        {tasks.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: '700', color: '#475569' }}>
                Action Plan Completion
              </span>
              <strong style={{ color: progress === 100 ? '#16a34a' : '#0d9488' }}>
                {completedCount} of {tasks.length} Completed ({progress}%)
              </strong>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px', background: '#e2e8f0' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? '#10b981' : undefined,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
          <h3 style={{ fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
            No Pending Tasks!
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '460px', margin: '8px auto 20px' }}>
            Either your vault has all required documents for this service, or you haven't generated a plan yet.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreateTasks}
          >
            📋 Re-generate Task Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tasks.map((task) => {
            const isDone = task.status === 'Completed'
            return (
              <div key={task.id} className={`task-item ${isDone ? 'done' : ''}`}>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge ${task.priority === 'High' ? 'badge-red' : task.priority === 'Medium' ? 'badge-amber' : 'badge-teal'}`}>
                      {task.priority} Priority
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      🏛️ Source: {task.source}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: isDone ? '#64748b' : '#0f172a' }}>
                    {task.title}
                  </h4>

                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0' }}>
                    <strong>Why it's needed:</strong> {task.reason}
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#334155',
                    marginTop: '6px',
                  }}>
                    👉 <strong>How to get:</strong> {task.nextStep}
                  </div>
                </div>

                <div className="task-status-group">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`task-status-btn ${task.status === st ? 'active' : ''}`}
                      onClick={() => onStatusChange(task.id, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

