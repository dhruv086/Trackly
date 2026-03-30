import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateTaskStatusAsync, fetchTasks, clearSelectedTask } from '../store/slices/taskSlice';
import TaskColumn from './TaskColumn';
import TaskDetailDrawer from './TaskDetailDrawer';
import AddTaskModal from './AddTaskModal';
import { Plus, Search, Filter } from 'lucide-react';
import Button from './ui/Button';

const ProjectBoard = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks: allTasks, columns, columnOrder, selectedTaskId, loading } = useSelector((state) => state.tasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  const selectedTask = selectedTaskId ? allTasks[selectedTaskId] : null;

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = columns[destination.droppableId].title;

    dispatch(updateTaskStatusAsync({
      taskId: draggableId,
      status: newStatus,
      columnId: destination.droppableId
    }));
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button variant="secondary" size="md">
            <Filter size={18} className="mr-2" />
            Filter
          </Button>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full items-start">
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                return (
                  <TaskColumn
                    key={column.id}
                    column={column}
                  />
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => dispatch(clearSelectedTask())}
      />
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default ProjectBoard;
