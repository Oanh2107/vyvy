// js/calendar.js

const CalendarManager = {
    selectedDate: new Date().toISOString().slice(0, 10),
    weekOffset: 0, // 0 = current week, +1 = next week, -1 = prev week

    getWeekDates() {
        const currentDate = new Date();
        // Shift date by weeks based on offset
        currentDate.setDate(currentDate.getDate() + (this.weekOffset * 7));
        
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(currentDate.setDate(diff));
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const tempDate = new Date(monday);
            tempDate.setDate(monday.getDate() + i);
            weekDates.push(tempDate.toISOString().slice(0, 10));
        }
        return weekDates;
    },

    getDayName(dayIndex) {
        const names = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        return names[dayIndex];
    },

    changeWeek(offsetDir) {
        this.weekOffset += offsetDir;
        this.renderCalendar('calendar-grid-container', 'calendar-checklist-container');
    },

    selectDay(date) {
        this.selectedDate = date;
        this.renderCalendar('calendar-grid-container', 'calendar-checklist-container');
    },

    renderCalendar(gridId, checklistId) {
        const grid = document.getElementById(gridId);
        const checklist = document.getElementById(checklistId);
        if (!grid || !checklist) return;

        const weekDates = this.getWeekDates();
        const tasks = StorageManager.getTasks();

        // Render Calendar Grid Header with Month and Prev/Next buttons
        const startParts = weekDates[0].split('-');
        const endParts = weekDates[6].split('-');
        const dateRangeText = `Tuần: ${startParts[2]}/${startParts[1]} - ${endParts[2]}/${endParts[1]} (Năm ${startParts[0]})`;

        let gridHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; width:100%; flex-wrap:wrap; gap:12px;">
                <h3 class="font-semibold text-base-size" id="calendar-week-range">${dateRangeText}</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="btn-prev-week">« Tuần trước</button>
                    <button class="btn btn-sm btn-secondary" id="btn-today-week">Hiện tại</button>
                    <button class="btn btn-sm btn-secondary" id="btn-next-week">Tuần sau »</button>
                </div>
            </div>
            <div class="calendar-days-grid" style="display:grid; grid-template-columns: repeat(7, 1fr); gap:8px; width:100%; text-align:center;">
        `;

        weekDates.forEach((date, index) => {
            const dayTasks = tasks.filter(t => t.dueDate === date);
            const pendingTasksCount = dayTasks.filter(t => t.status !== 'completed').length;
            const isSelected = this.selectedDate === date;
            const isToday = new Date().toISOString().slice(0, 10) === date;
            
            const activeClass = isSelected ? 'background-color: var(--primary-color); color: var(--text-inverse); border-color: var(--primary-color);' : '';
            const todayClass = isToday && !isSelected ? 'border: 2px solid var(--primary-color); background-color: var(--primary-glow);' : '';
            const borderStyle = !isSelected ? 'border: 1px solid var(--border-color); background-color: var(--bg-secondary);' : '';

            const dateLabel = date.split('-')[2];

            gridHtml += `
                <div class="calendar-day-card" data-date="${date}" style="cursor:pointer; padding: 12px 6px; border-radius: 8px; transition: all var(--transition-speed); display:flex; flex-direction:column; gap:4px; ${borderStyle} ${activeClass} ${todayClass}">
                    <span class="text-xs-size font-semibold" style="opacity: 0.8;">${this.getDayName(index)}</span>
                    <span class="font-semibold text-lg-size">${dateLabel}</span>
                    ${pendingTasksCount > 0 ? `
                        <span class="badge" style="background-color: ${isSelected ? 'var(--bg-secondary)' : 'var(--primary-color)'}; color: ${isSelected ? 'var(--primary-color)' : 'var(--text-inverse)'}; font-size: 10px; padding: 1px 6px; align-self: center; margin-top:2px;">
                            ${pendingTasksCount}
                        </span>
                    ` : `
                        <span style="height:17px;"></span>
                    `}
                </div>
            `;
        });

        gridHtml += `</div>`;
        grid.innerHTML = gridHtml;

        // Bind calendar controls
        document.getElementById('btn-prev-week').addEventListener('click', () => this.changeWeek(-1));
        document.getElementById('btn-today-week').addEventListener('click', () => {
            this.weekOffset = 0;
            this.selectedDate = new Date().toISOString().slice(0, 10);
            this.renderCalendar(gridId, checklistId);
        });
        document.getElementById('btn-next-week').addEventListener('click', () => this.changeWeek(1));

        grid.querySelectorAll('.calendar-day-card').forEach(card => {
            card.addEventListener('click', () => {
                const date = card.getAttribute('data-date');
                this.selectDay(date);
            });
        });

        // Render checklist for the selected day
        this.renderChecklist(checklistId, this.selectedDate);
    },

    renderChecklist(containerId, date) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tasks = StorageManager.getTasks();
        const dayTasks = tasks.filter(t => t.dueDate === date);

        const parts = date.split('-');
        const friendlyDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

        let html = `
            <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                <h4 class="font-semibold text-base-size" style="margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Checklist Công Việc - Ngày ${friendlyDate}</span>
                    <span class="badge badge-dept" style="font-size:11px;">Tổng cộng: ${dayTasks.length}</span>
                </h4>
        `;

        if (dayTasks.length === 0) {
            html += `
                <div class="empty-state-compact" style="background-color: var(--bg-secondary); border: 1px dashed var(--border-color); padding: 24px; border-radius: 8px;">
                    <p class="text-muted text-center">Không có công việc nào cần hoàn thành trong ngày này! 🎉</p>
                </div>
            `;
        } else {
            html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
            dayTasks.forEach(task => {
                const assignee = PersonnelManager.getStaffById(task.assigneeId);
                const assigneeName = assignee ? assignee.name : 'Chưa phân công';
                const isCompleted = task.status === 'completed';
                
                const cardStyle = isCompleted 
                    ? 'border-color: var(--border-color); opacity: 0.75; background-color: var(--bg-primary);' 
                    : 'border-color: var(--border-color); background-color: var(--bg-secondary);';
                
                const textDecoration = isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : '';

                const taskTags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(t => t) : [];

                html += `
                    <div class="checklist-item" data-id="${task.id}" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border: 1px solid var(--border-color); border-radius: 8px; ${cardStyle} transition: all var(--transition-speed);">
                        <input type="checkbox" class="task-check-input" data-id="${task.id}" ${isCompleted ? 'checked' : ''} style="width: 18px; height: 18px; cursor:pointer; accent-color: var(--primary-color);">
                        
                        <div style="flex-grow:1; cursor:pointer;" class="task-detail-click" data-id="${task.id}">
                            <div class="font-semibold text-base-size" style="${textDecoration}">${task.title}</div>
                            <div class="text-xs-size text-muted" style="margin-top:2px;">
                                Phân công: <b>${assigneeName}</b> | Hạn: ${PersonnelManager.formatDate(task.dueDate)}
                            </div>
                        </div>

                        <div style="display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; max-width: 150px;">
                            ${taskTags.map(tag => `<span class="badge" style="background-color: var(--bg-tertiary); color: var(--text-muted); font-size:10px; padding: 1px 6px;">${tag}</span>`).join('')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Bind checkboxes
        container.querySelectorAll('.task-check-input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = checkbox.getAttribute('data-id');
                const isChecked = checkbox.checked;
                const newStatus = isChecked ? 'completed' : 'in-progress';
                
                TasksManager.changeTaskStatus(taskId, newStatus);
                window.showToast?.(`Đã đánh dấu công việc là: ${TasksManager.getStatusLabel(newStatus)}`, 'success');
                
                // Redraw calendar & checklist
                this.renderCalendar(gridId, containerId);
                // Dispatch event to sync other views
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
            });
        });

        // Bind item click to open details modal
        container.querySelectorAll('.task-detail-click').forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.getAttribute('data-id');
                window.openTaskDetailModal?.(taskId);
            });
        });
    }
};

window.CalendarManager = CalendarManager;
