import { useSelector, useDispatch } from 'react-redux';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { MoreHorizontal } from 'lucide-react';
import { selectTask } from '../store/slices/taskSlice';

const PRIORITY_WEIGHT = { High: 0, Medium: 1, Low: 2 };
const FAR_FUTURE = new Date('2099-12-31').getTime();

/**
 * Sort tasks by:
 *   1. Priority — High → Medium → Low
 *   2. Due date — earliest first (tasks without a due date go last)
 */
function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_WEIGHT[a.priority] ?? 1;
    const pb = PRIORITY_WEIGHT[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;

    const da = a.dueDate ? new Date(a.dueDate).getTime() : FAR_FUTURE;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : FAR_FUTURE;
    return da - db;
  });
}

const columnStyles = {
  todo:       { header: 'text-slate-600',  dot: 'bg-slate-400',   bg: 'bg-slate-50/60',  border: 'border-slate-100' },
  inprogress: { header: 'text-indigo-600', dot: 'bg-indigo-500',  bg: 'bg-indigo-50/30', border: 'border-indigo-100' },
  review:     { header: 'text-amber-600',  dot: 'bg-amber-400',   bg: 'bg-amber-50/30',  border: 'border-amber-100' },
  done:       { header: 'text-emerald-600',dot: 'bg-emerald-500', bg: 'bg-emerald-50/30',border: 'border-emerald-100' },
};

const TaskColumn = ({ column }) => {
  const dispatch = useDispatch();
  const { tasks: allTasks } = useSelector((state) => state.tasks);

  const rawTasks = column.taskIds.map((id) => allTasks[id]).filter(Boolean);
  const tasks = sortTasks(rawTasks);

  const styles = columnStyles[column.id] || columnStyles.todo;

  return (
    <div className={`flex flex-col w-80 min-w-[312px] rounded-2xl border ${styles.border} ${styles.bg} p-2 max-h-full`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3.5 mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <h3 className={`text-[11px] font-black uppercase tracking-[0.12em] ${styles.header}`}>
            {column.title}
          </h3>
          <span className="bg-white/80 border border-current/10 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
        <button className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-white/80 rounded-lg transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Sorted task list */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 px-1 overflow-y-auto min-h-[120px] transition-colors rounded-xl ${
              snapshot.isDraggingOver ? 'bg-white/60 ring-2 ring-indigo-200 ring-inset' : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 text-[11px] text-slate-300 font-bold select-none">
                Drop tasks here
              </div>
            )}
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-all ${snapshot.isDragging ? 'shadow-2xl shadow-indigo-200 scale-[1.03] z-50 rotate-1' : ''}`}
                  >
                    <TaskCard task={task} onClick={() => dispatch(selectTask(task.id))} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;
