import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateTaskStatusAsync, fetchTasks, fetchAllTasks, selectTask, clearSelectedTask } from '../../store/slices/taskSlice';
import MainLayout from '../../layouts/MainLayout';
import TaskToolbar from '../../components/TaskToolbar';
import TaskColumn from '../../components/TaskColumn';
import TaskDetailDrawer from '../../components/TaskDetailDrawer';
import AddTaskModal from '../../components/AddTaskModal';
import { Plus } from 'lucide-react';

const TaskBoard = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const { tasks: allTasks, columns, columnOrder, selectedTaskId, loading } = useSelector((state) => state.tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    } else {
      dispatch(fetchAllTasks());
    }
  }, [dispatch, projectId]);

  const selectedTask = selectedTaskId ? allTasks[selectedTaskId] : null;

  // Filter columns based on search query
  const filteredColumns = searchQuery
    ? Object.fromEntries(
        Object.entries(columns).map(([colId, col]) => {
          const filtered = col.taskIds.filter((taskId) => {
            const task = allTasks[taskId];
            if (!task) return false;
            const q = searchQuery.toLowerCase();
            return (
              task.title?.toLowerCase().includes(q) ||
              task.description?.toLowerCase().includes(q)
            );
          });
          return [colId, { ...col, taskIds: filtered }];
        })
      )
    : columns;

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = columns[destination.droppableId]?.title;

    // Optimistic update — move card between columns immediately in Redux state
    dispatch({
      type: 'tasks/optimisticMove',
      payload: {
        taskId:    draggableId,
        fromColId: source.droppableId,
        toColId:   destination.droppableId,
        toIndex:   destination.index,
      },
    });

    // Persist to backend
    dispatch(updateTaskStatusAsync({
      taskId:   draggableId,
      status:   newStatus,
      columnId: destination.droppableId,
    }));
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <TaskToolbar
          onSearch={setSearchQuery}
          showAddButton={!projectId}
          onAddTaskClick={() => setIsAddModalOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 overflow-x-auto overflow-y-hidden bg-slate-50/30">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 h-full items-start pb-4">
                {columnOrder.map((columnId) => {
                  const column = filteredColumns[columnId];
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
        </main>
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
    </MainLayout>
  );
};

export default TaskBoard;
