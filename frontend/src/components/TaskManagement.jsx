import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TaskToolbar from './TaskToolbar';
import TaskColumn from './TaskColumn';
import TaskDetailDrawer from './TaskDetailDrawer';

const initialData = {
  tasks: {},
  columns: {
    'todo':       { id: 'todo',       title: 'To Do',       taskIds: [] },
    'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
    'review':     { id: 'review',     title: 'Review',      taskIds: [] },
    'done':       { id: 'done',       title: 'Done',        taskIds: [] },
  },
  columnOrder: ['todo', 'inprogress', 'review', 'done'],
};

const TaskManagement = () => {
  const [data, setData] = useState(initialData);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn }
      });
      return;
    }

    // Moving between different columns
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds };

    // Update task status based on column title
    const updatedTasks = { ...data.tasks };
    updatedTasks[draggableId] = { ...updatedTasks[draggableId], status: newFinishColumn.title };

    setData({
      ...data,
      tasks: updatedTasks,
      columns: {
        ...data.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 flex flex-col min-h-0">
          <TaskToolbar
            onSearch={() => { }}
            onFilter={() => { }}
            onSort={() => { }}
          />

          <main className="flex-1 p-6 overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 h-full items-start">
                {data.columnOrder.map((columnId) => {
                  const column = data.columns[columnId];
                  const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                  return (
                    <TaskColumn
                      key={column.id}
                      column={column}
                      tasks={tasks}
                      onTaskClick={handleTaskClick}
                    />
                  );
                })}
              </div>
            </DragDropContext>
          </main>
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default TaskManagement;
