// js/tasks.js

const TasksManager = {
    getTasks() {
        return StorageManager.getTasks();
    },

    getTaskById(id) {
        return this.getTasks().find(t => t.id === id);
    },

    addTask(taskData) {
        this.validateTaskData(taskData);

        const tasks = this.getTasks();
        const newTask = {
            id: 'task-' + Date.now(),
            title: taskData.title.trim(),
            description: taskData.description.trim(),
            assigneeId: taskData.assigneeId || '',
            deptId: taskData.deptId || '',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate,
            tags: taskData.tags ? taskData.tags.trim() : '',
            status: taskData.status || 'todo'
        };

        tasks.push(newTask);
        StorageManager.saveTasks(tasks);
        return newTask;
    },

    updateTask(id, taskData) {
        this.validateTaskData(taskData);

        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Không tìm thấy công việc.');

        tasks[index] = {
            ...tasks[index],
            title: taskData.title.trim(),
            description: taskData.description.trim(),
            assigneeId: taskData.assigneeId || '',
            deptId: taskData.deptId || '',
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            tags: taskData.tags ? taskData.tags.trim() : '',
            status: taskData.status
        };

        StorageManager.saveTasks(tasks);
        return tasks[index];
    },

    deleteTask(id) {
        let tasks = this.getTasks();
        tasks = tasks.filter(t => t.id !== id);
        StorageManager.saveTasks(tasks);
    },

    changeTaskStatus(id, newStatus) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.status = newStatus;
        StorageManager.saveTasks(tasks);
    },

    validateTaskData(data) {
        if (!data.title || !data.title.trim()) throw new Error('Tiêu đề công việc không được để trống.');
        if (!data.dueDate) throw new Error('Vui lòng chọn hạn chót công việc.');
    },

    getPriorityLabel(priority) {
        switch (priority) {
            case 'high':
                return '<span class="priority-badge priority-high">Cao</span>';
            case 'medium':
                return '<span class="priority-badge priority-medium">Trung bình</span>';
            case 'low':
                return '<span class="priority-badge priority-low">Thấp</span>';
            default:
                return `<span class="priority-badge">${priority}</span>`;
        }
    },

    getStatusLabel(status) {
        switch (status) {
            case 'todo': return 'Cần làm';
            case 'in-progress': return 'Đang làm';
            case 'review': return 'Đang duyệt';
            case 'completed': return 'Hoàn thành';
            default: return status;
        }
    },

    getDueDateClass(dueDate, status) {
        if (status === 'completed') return 'due-completed';
        const today = new Date().toISOString().slice(0, 10);
        if (dueDate < today) return 'due-overdue';
        if (dueDate === today) return 'due-today';
        return 'due-future';
    },

    getDueDateText(dueDate, status) {
        if (status === 'completed') return 'Đã xong';
        const today = new Date().toISOString().slice(0, 10);
        if (dueDate < today) return 'Quá hạn';
        if (dueDate === today) return 'Hôm nay';
        
        const diffTime = new Date(dueDate) - new Date(today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `Còn ${diffDays} ngày`;
    },

    renderKanban(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let filteredTasks = this.getTasks();

        // Apply filters
        if (filters.search) {
            const searchVal = filters.search.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(t => 
                t.title.toLowerCase().includes(searchVal) || 
                t.description.toLowerCase().includes(searchVal) ||
                (t.tags && t.tags.toLowerCase().includes(searchVal))
            );
        }
        if (filters.deptId) {
            filteredTasks = filteredTasks.filter(t => t.deptId === filters.deptId);
        }
        if (filters.assigneeId) {
            filteredTasks = filteredTasks.filter(t => t.assigneeId === filters.assigneeId);
        }
        if (filters.priority) {
            filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
        }
        // Custom filters for Dang do / Hoan thanh
        if (filters.status) {
            if (filters.status === 'pending') {
                filteredTasks = filteredTasks.filter(t => t.status !== 'completed');
            } else if (filters.status === 'completed') {
                filteredTasks = filteredTasks.filter(t => t.status === 'completed');
            }
        }

        const columns = [
            { id: 'todo', name: 'Cần Làm', colorClass: 'col-todo' },
            { id: 'in-progress', name: 'Đang Làm', colorClass: 'col-in-progress' },
            { id: 'review', name: 'Đang Duyệt', colorClass: 'col-review' },
            { id: 'completed', name: 'Hoàn Thành', colorClass: 'col-completed' }
        ];

        // Hide columns if they don't match the general filter
        let activeColumns = columns;
        if (filters.status === 'completed') {
            activeColumns = columns.filter(c => c.id === 'completed');
        } else if (filters.status === 'pending') {
            activeColumns = columns.filter(c => c.id !== 'completed');
        }

        let gridColumnsStyle = `grid-template-columns: repeat(${activeColumns.length}, 1fr);`;
        let html = `<div class="kanban-board" style="${gridColumnsStyle}">`;

        activeColumns.forEach(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            html += `
                <div class="kanban-column ${col.colorClass}" data-status="${col.id}">
                    <div class="kanban-column-header">
                        <h3>${col.name}</h3>
                        <span class="column-count">${colTasks.length}</span>
                    </div>
                    <div class="kanban-cards-container" id="kanban-col-${col.id}">
            `;

            if (colTasks.length === 0) {
                html += `
                    <div class="kanban-empty-slot">
                        <p>Kéo công việc vào đây</p>
                    </div>
                `;
            } else {
                colTasks.forEach(task => {
                    const assignee = PersonnelManager.getStaffById(task.assigneeId);
                    const deptName = DepartmentsManager.getDepartmentName(task.deptId);
                    const dueClass = this.getDueDateClass(task.dueDate, task.status);
                    const dueText = this.getDueDateText(task.dueDate, task.status);
                    
                    const assigneeInitials = assignee 
                        ? assignee.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                        : '??';
                    const assigneeName = assignee ? assignee.name : 'Chưa phân công';

                    // Parse tags
                    const taskTags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(t => t) : [];

                    html += `
                        <div class="kanban-card" draggable="true" data-id="${task.id}" style="cursor:pointer;">
                            <div class="card-tags">
                                <span class="tag-dept">${deptName}</span>
                                ${this.getPriorityLabel(task.priority)}
                            </div>
                            <h4 class="card-title" style="margin-top: 4px;">${task.title}</h4>
                            
                            <!-- Tags badges (Mini tags instead of description) -->
                            ${taskTags.length > 0 ? `
                                <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:6px;">
                                    ${taskTags.map(tag => `<span class="badge" style="background-color: var(--bg-tertiary); color: var(--text-muted); font-size:10px; padding: 1px 6px; border-radius:4px;">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="card-meta">
                                <div class="card-due ${dueClass}" title="Hạn chót: ${PersonnelManager.formatDate(task.dueDate)}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>${dueText}</span>
                                </div>
                                <div class="card-assignee" title="${assigneeName}">
                                    <div class="avatar-sm" style="${!assignee ? 'background-color: var(--border-color); color: var(--text-muted);' : ''}">${assigneeInitials}</div>
                                </div>
                            </div>

                            <!-- Mobile Quick Move Controls -->
                            <div class="mobile-only-flex card-actions-mobile">
                                ${col.id !== 'todo' ? `
                                    <button class="btn-mobile-move move-left" data-id="${task.id}" data-current="${col.id}" title="Chuyển về cột trước">
                                        ←
                                    </button>
                                ` : '<div style="flex:1;"></div>'}
                                
                                <button class="btn-mobile-edit" data-id="${task.id}">Xem</button>
                                
                                ${col.id !== 'completed' ? `
                                    <button class="btn-mobile-move move-right" data-id="${task.id}" data-current="${col.id}" title="Chuyển sang cột tiếp">
                                        →
                                    </button>
                                ` : '<div style="flex:1;"></div>'}
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        this.bindKanbanEvents(container, filters);
    },

    renderList(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let filteredTasks = this.getTasks();

        // Apply filters
        if (filters.search) {
            const searchVal = filters.search.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(t => 
                t.title.toLowerCase().includes(searchVal) || 
                t.description.toLowerCase().includes(searchVal) ||
                (t.tags && t.tags.toLowerCase().includes(searchVal))
            );
        }
        if (filters.deptId) {
            filteredTasks = filteredTasks.filter(t => t.deptId === filters.deptId);
        }
        if (filters.assigneeId) {
            filteredTasks = filteredTasks.filter(t => t.assigneeId === filters.assigneeId);
        }
        if (filters.priority) {
            filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
        }
        
        // Custom filters for Dang do / Hoan thanh
        if (filters.status) {
            if (filters.status === 'pending') {
                filteredTasks = filteredTasks.filter(t => t.status !== 'completed');
            } else if (filters.status === 'completed') {
                filteredTasks = filteredTasks.filter(t => t.status === 'completed');
            } else {
                filteredTasks = filteredTasks.filter(t => t.status === filters.status);
            }
        }

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>Không tìm thấy công việc nào phù hợp.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Công Việc</th>
                            <th>Người Thực Hiện</th>
                            <th>Phòng Ban</th>
                            <th>Độ Ưu Tiên</th>
                            <th>Hạn Chót</th>
                            <th>Trạng Thái</th>
                            <th class="text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filteredTasks.forEach(task => {
            const assignee = PersonnelManager.getStaffById(task.assigneeId);
            const deptName = DepartmentsManager.getDepartmentName(task.deptId);
            const dueClass = this.getDueDateClass(task.dueDate, task.status);
            const dueText = this.getDueDateText(task.dueDate, task.status);
            const assigneeName = assignee ? assignee.name : 'Chưa phân công';

            const taskTags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(t => t) : [];

            html += `
                <tr>
                    <td>
                        <div class="font-semibold text-lg-size task-title-click" data-id="${task.id}" style="cursor:pointer; color:var(--text-main);">${task.title}</div>
                        <!-- Mini tags list under title -->
                        ${taskTags.length > 0 ? `
                            <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:4px;">
                                ${taskTags.map(tag => `<span class="badge" style="background-color: var(--bg-tertiary); color: var(--text-muted); font-size:9px; padding: 1px 4px; border-radius:4px;">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </td>
                    <td><span class="font-medium">${assigneeName}</span></td>
                    <td><span class="badge badge-dept">${deptName}</span></td>
                    <td>${this.getPriorityLabel(task.priority)}</td>
                    <td>
                        <span class="due-text ${dueClass}">${PersonnelManager.formatDate(task.dueDate)} (${dueText})</span>
                    </td>
                    <td>
                        <span class="status-indicator status-ind-${task.status}">
                            ${this.getStatusLabel(task.status)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button class="btn btn-icon btn-primary btn-edit-task" data-id="${task.id}" title="Sửa công việc">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button class="btn btn-icon btn-danger btn-delete-task" data-id="${task.id}" title="Xóa công việc">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = html;

        // Bind clicks to open details modal
        container.querySelectorAll('.task-title-click').forEach(title => {
            title.addEventListener('click', () => {
                const id = title.getAttribute('data-id');
                window.openTaskDetailModal?.(id);
            });
        });

        // Bind edit buttons
        container.querySelectorAll('.btn-edit-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.openTaskModal?.(id);
            });
        });

        // Bind delete buttons
        container.querySelectorAll('.btn-delete-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const task = this.getTaskById(id);
                if (confirm(`Bạn có chắc chắn muốn xóa công việc "${task.title}"?`)) {
                    this.deleteTask(id);
                    this.renderList(containerId, filters);
                    window.showToast?.('Xóa công việc thành công!', 'success');
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                }
            });
        });
    },

    bindKanbanEvents(container, filters) {
        const cards = container.querySelectorAll('.kanban-card');
        const columns = container.querySelectorAll('.kanban-column');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            // Single click to open detail view
            card.addEventListener('click', (e) => {
                // Prevent trigger if clicking on mobile actions
                if (e.target.closest('.card-actions-mobile')) return;
                
                const id = card.getAttribute('data-id');
                window.openTaskDetailModal?.(id);
            });

            const editBtn = card.querySelector('.btn-mobile-edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = editBtn.getAttribute('data-id');
                    window.openTaskDetailModal?.(id);
                });
            }
        });

        columns.forEach(col => {
            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = col.getAttribute('data-status');
                
                if (taskId && newStatus) {
                    const task = this.getTaskById(taskId);
                    if (task && task.status !== newStatus) {
                        this.changeTaskStatus(taskId, newStatus);
                        this.renderKanban(container.id, filters);
                        window.showToast?.(`Đã chuyển sang: ${this.getStatusLabel(newStatus)}`, 'success');
                        window.dispatchEvent(new CustomEvent('tasksUpdated'));
                    }
                }
            });
        });

        // Mobile move buttons
        container.querySelectorAll('.btn-mobile-move').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.getAttribute('data-id');
                const currentStatus = btn.getAttribute('data-current');
                const isLeft = btn.classList.contains('move-left');
                
                const statusOrder = ['todo', 'in-progress', 'review', 'completed'];
                const currentIndex = statusOrder.indexOf(currentStatus);
                let nextIndex = isLeft ? currentIndex - 1 : currentIndex + 1;
                
                if (nextIndex >= 0 && nextIndex < statusOrder.length) {
                    const nextStatus = statusOrder[nextIndex];
                    this.changeTaskStatus(taskId, nextStatus);
                    this.renderKanban(container.id, filters);
                    window.showToast?.(`Đã chuyển sang: ${this.getStatusLabel(nextStatus)}`, 'success');
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                }
            });
        });
    }
};

window.TasksManager = TasksManager;
