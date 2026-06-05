// js/app.js

// Global variables for filtering
let personnelFilters = { search: '', deptId: '', status: '' };
let taskFilters = { search: '', deptId: '', assigneeId: '', priority: '', status: '' };
let currentTaskView = 'kanban'; // 'kanban' or 'list'
let activeTab = 'dashboard';
let activeProcurementMonth = new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
let personnelChart = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupTabNavigation();
    setupThemeToggle();
    setupDashboard();
    setupPersonnelPage();
    setupTasksPage();
    setupProcurementPage();
    setupContractsPage();
    setupDepartmentsPage();
    setupDataSettings();
    setupModals();
    setupNotifications();

    // Trigger initial render
    renderActiveTab();
    
    // Register global event listeners for state updates
    window.addEventListener('departmentsUpdated', handleDataUpdate);
    window.addEventListener('personnelUpdated', handleDataUpdate);
    window.addEventListener('tasksUpdated', handleDataUpdate);
    window.addEventListener('procurementsUpdated', handleDataUpdate);
    window.addEventListener('contractTemplateUpdated', handleDataUpdate);
    window.addEventListener('dataCleared', () => {
        showToast('Đã khôi phục dữ liệu mẫu!', 'info');
        // Reset active month filter to current
        activeProcurementMonth = new Date().toISOString().slice(0, 7);
        handleDataUpdate();
    });
    
    // Redraw chart when theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(renderFluctuationsChart, 100); // Wait for transition
        });
    }
});

// Theme Logic
function initTheme() {
    const theme = StorageManager.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageManager.saveTheme(newTheme);
        initTheme();
    });
}

// Tab Switching Navigation
function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (!tabName) return;

            activeTab = tabName;

            // Update active nav classes (handles both sidebar and bottom-nav)
            navLinks.forEach(l => {
                if (l.getAttribute('data-tab') === tabName) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });

            // Show current section, hide others
            sections.forEach(sec => {
                if (sec.id === `${tabName}-section`) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });

            renderActiveTab();
        });
    });
}

// Global data refresh
function handleDataUpdate() {
    renderActiveTab();
}

function renderActiveTab() {
    switch (activeTab) {
        case 'dashboard':
            renderDashboardStats();
            renderFluctuationsChart();
            break;
        case 'tasks':
            renderTasksListOrKanban();
            break;
        case 'personnel':
            PersonnelManager.renderPersonnelList('personnel-list-container', personnelFilters);
            break;
        case 'procurement':
            ProcurementManager.renderProcurementPage('procurement-list-container', activeProcurementMonth);
            break;
        case 'contracts':
            ContractsManager.renderContractsTab('contracts-container');
            break;
        case 'departments':
            DepartmentsManager.renderDepartmentsList('departments-list-container');
            break;
    }
}

// --- DASHBOARD PAGE LOGIC ---
function setupDashboard() {
    // Quick Actions
    const quickAddStaff = document.getElementById('quick-add-staff');
    if (quickAddStaff) {
        quickAddStaff.addEventListener('click', () => {
            window.openStaffModal();
        });
    }

    const quickAddTask = document.getElementById('quick-add-task');
    if (quickAddTask) {
        quickAddTask.addEventListener('click', () => {
            window.openTaskModal();
        });
    }
}

function renderDashboardStats() {
    const tasks = TasksManager.getTasks();
    const personnel = PersonnelManager.getPersonnel().filter(p => p.status !== 'inactive');
    const depts = DepartmentsManager.getDepartments();
    const today = new Date().toISOString().slice(0, 10);

    // Basic Stats Counters
    const totalStaff = personnel.length;
    const totalDepts = depts.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < today).length;

    // Calculate Completion Rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Set counter texts
    document.getElementById('stat-total-staff').innerText = totalStaff;
    document.getElementById('stat-total-depts').innerText = totalDepts;
    document.getElementById('stat-total-tasks').innerText = totalTasks;
    document.getElementById('stat-overdue-tasks').innerText = overdueTasks;
    
    // Status text details
    document.getElementById('stat-todo-count').innerText = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('stat-inprogress-count').innerText = tasks.filter(t => t.status === 'in-progress').length;
    const reviewCountEl = document.getElementById('stat-review-count');
    if (reviewCountEl) {
        reviewCountEl.innerText = tasks.filter(t => t.status === 'review').length;
    }
    document.getElementById('stat-completed-count').innerText = completedTasks;

    // Update Progress Bar
    const progressFill = document.getElementById('dashboard-progress-fill');
    const progressPercentText = document.getElementById('dashboard-progress-percent');
    if (progressFill && progressPercentText) {
        progressFill.style.width = `${completionRate}%`;
        progressPercentText.innerText = `${completionRate}% Hoàn Thành`;
    }

    // Render Urgent & Overdue Tasks List
    const urgentTasksContainer = document.getElementById('urgent-tasks-container');
    if (urgentTasksContainer) {
        const urgentTasks = tasks
            .filter(t => t.status !== 'completed' && (t.priority === 'high' || t.dueDate <= today))
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            .slice(0, 5);

        if (urgentTasks.length === 0) {
            urgentTasksContainer.innerHTML = `
                <div class="empty-state-compact">
                    <p class="text-muted text-sm-size">Không có công việc khẩn cấp nào cần xử lý! 🎉</p>
                </div>
            `;
        } else {
            let html = '<div class="urgent-list">';
            urgentTasks.forEach(task => {
                const assignee = PersonnelManager.getStaffById(task.assigneeId);
                const dueClass = TasksManager.getDueDateClass(task.dueDate, task.status);
                const dueText = TasksManager.getDueDateText(task.dueDate, task.status);
                const assigneeName = assignee ? assignee.name : 'Chưa phân công';

                html += `
                    <div class="urgent-item">
                        <div class="urgent-item-header">
                            <span class="font-semibold text-base-size text-truncate" style="max-width:200px;">${task.title}</span>
                            ${TasksManager.getPriorityLabel(task.priority)}
                        </div>
                        <div class="urgent-item-body">
                            <span class="text-sm-size text-muted">Phân công: <b>${assigneeName}</b></span>
                            <span class="urgent-due-badge ${dueClass}">${dueText} (${PersonnelManager.formatDate(task.dueDate)})</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            urgentTasksContainer.innerHTML = html;
        }
    }
}

// --- NEW: PERSONNEL FLUCTUATIONS CHART (CHART.JS) ---
function renderFluctuationsChart() {
    const ctx = document.getElementById('personnel-chart');
    if (!ctx) return;

    const personnel = PersonnelManager.getPersonnel();
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const labels = months.map(m => `Tháng ${m}/2026`);

    // Array to hold recruits & exits by month in 2026
    const recruitsData = Array(12).fill(0);
    const exitsData = Array(12).fill(0);

    // Compute dynamic figures based on staff database
    personnel.forEach(p => {
        if (p.joinDate && p.joinDate.startsWith('2026-')) {
            const m = parseInt(p.joinDate.slice(5, 7)) - 1;
            if (m >= 0 && m < 12) recruitsData[m]++;
        }
        if (p.status === 'inactive') {
            // For mock/calculated leaves, let's assume they left 3 months after joinDate or in May if join date is earlier
            if (p.joinDate) {
                let exitMonth = 4; // May (index 4)
                const joinYear = p.joinDate.slice(0, 4);
                if (joinYear === '2026') {
                    exitMonth = (parseInt(p.joinDate.slice(5,7)) + 2) % 12;
                }
                exitsData[exitMonth]++;
            } else {
                exitsData[4]++;
            }
        }
    });

    // Baseline historical mock values to display a richer graph initially
    const baselineRecruits = [1, 2, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0];
    const baselineExits = [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];

    const finalRecruits = recruitsData.map((v, i) => v + baselineRecruits[i]);
    const finalExits = exitsData.map((v, i) => v + baselineExits[i]);

    if (personnelChart) {
        personnelChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#2a354f' : '#e2e8f0';

    personnelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tuyển Mới (Người)',
                    data: finalRecruits,
                    backgroundColor: '#4f46e5',
                    hoverBackgroundColor: '#4338ca',
                    borderRadius: 6,
                    borderWidth: 0
                },
                {
                    label: 'Nghỉ Việc (Người)',
                    data: finalExits,
                    backgroundColor: '#ef4444',
                    hoverBackgroundColor: '#dc2626',
                    borderRadius: 6,
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    padding: 12,
                    titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 12 }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Plus Jakarta Sans' },
                        stepSize: 1,
                        callback: value => value + ' NV'
                    }
                }
            }
        }
    });
}

// --- PERSONNEL PAGE LOGIC ---
function setupPersonnelPage() {
    DepartmentsManager.populateSelectElement('filter-personnel-dept', 'Phòng ban');

    const searchInput = document.getElementById('search-personnel');
    const deptFilter = document.getElementById('filter-personnel-dept');
    const statusFilter = document.getElementById('filter-personnel-status');

    const triggerFilter = () => {
        personnelFilters.search = searchInput ? searchInput.value : '';
        personnelFilters.deptId = deptFilter ? deptFilter.value : '';
        personnelFilters.status = statusFilter ? statusFilter.value : '';
        PersonnelManager.renderPersonnelList('personnel-list-container', personnelFilters);
    };

    if (searchInput) searchInput.addEventListener('input', triggerFilter);
    if (deptFilter) deptFilter.addEventListener('change', triggerFilter);
    if (statusFilter) statusFilter.addEventListener('change', triggerFilter);

    const addStaffBtn = document.getElementById('btn-add-personnel');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', () => {
            window.openStaffModal();
        });
    }

    const importExcelTrigger = document.getElementById('btn-import-excel-trigger');
    const importExcelInput = document.getElementById('input-import-excel');
    if (importExcelTrigger && importExcelInput) {
        importExcelTrigger.addEventListener('click', () => {
            importExcelInput.click();
        });
        importExcelInput.addEventListener('change', handleExcelImport);
    }
}

function handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Get raw JSON rows
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (rows.length < 2) {
                showToast('File Excel trống hoặc không đủ thông tin!', 'error');
                return;
            }
            
            const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
            
            // Map headers to field indices
            const mapField = (variants) => {
                return headers.findIndex(h => variants.some(v => h.includes(v.toLowerCase())));
            };
            
            const nameIdx = mapField(['họ tên', 'ho ten', 'họ và tên', 'ho va ten', 'tên', 'ten', 'name']);
            const emailIdx = mapField(['email', 'thư điện tử', 'thu dien tu']);
            const phoneIdx = mapField(['sđt', 'sdt', 'số điện thoại', 'so dien thoai', 'điện thoại', 'dien thoai', 'phone']);
            const deptIdx = mapField(['phòng ban', 'phong ban', 'bộ phận', 'bo phan', 'department', 'dept']);
            const roleIdx = mapField(['chức vụ', 'chuc vu', 'chức danh', 'chuc danh', 'vai trò', 'vai tro', 'role']);
            const salaryIdx = mapField(['lương', 'luong', 'mức lương', 'muc luong', 'salary']);
            const bhxhIdx = mapField(['bhxh', 'bảo hiểm', 'bao hiem', 'số bhxh', 'so bhxh']);
            const joinDateIdx = mapField(['ngày vào', 'ngay vao', 'ngày làm', 'ngay lam', 'join date', 'joindate']);
            const contractDateIdx = mapField(['ngày ký', 'ngay ky', 'ngày hợp đồng', 'ngay hop dong', 'contract date', 'contractdate']);
            
            if (nameIdx === -1) {
                showToast('Không tìm thấy cột Họ Tên trong file Excel!', 'error');
                return;
            }
            if (deptIdx === -1) {
                showToast('Không tìm thấy cột Phòng Ban trong file Excel!', 'error');
                return;
            }
            
            const departments = StorageManager.getDepartments();
            const personnel = StorageManager.getPersonnel();
            let importedCount = 0;
            let errorCount = 0;
            
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;
                
                const rawName = row[nameIdx];
                if (!rawName || !rawName.toString().trim()) continue;
                
                const rawDept = deptIdx !== -1 ? (row[deptIdx] || '').toString().trim() : '';
                
                let matchedDept = departments.find(d => d.name.toLowerCase() === rawDept.toLowerCase());
                if (!matchedDept && rawDept) {
                    try {
                        matchedDept = DepartmentsManager.addDepartment(rawDept);
                        departments.push(matchedDept);
                    } catch (e) {}
                }
                
                const finalDeptId = matchedDept ? matchedDept.id : (departments[0] ? departments[0].id : 'dept-1');
                
                const rawEmail = emailIdx !== -1 ? (row[emailIdx] || '').toString().trim() : '';
                if (rawEmail && personnel.some(p => p.email.toLowerCase() === rawEmail.toLowerCase())) {
                    errorCount++;
                    continue;
                }
                
                const parseExcelDate = (val) => {
                    if (!val) return '';
                    if (typeof val === 'number') {
                        const date = new Date((val - 25569) * 86400 * 1000);
                        return date.toISOString().slice(0, 10);
                    }
                    const str = val.toString().trim();
                    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
                    
                    const parts = str.split(/[\/\-]/);
                    if (parts.length === 3) {
                        let day = parts[0].padStart(2, '0');
                        let month = parts[1].padStart(2, '0');
                        let year = parts[2];
                        if (year.length === 2) year = '20' + year;
                        if (parseInt(month) <= 12 && parseInt(day) <= 31) {
                            return `${year}-${month}-${day}`;
                        }
                    }
                    try {
                        const d = new Date(str);
                        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
                    } catch (e) {}
                    return '';
                };
                
                const joinDate = joinDateIdx !== -1 ? parseExcelDate(row[joinDateIdx]) : new Date().toISOString().slice(0, 10);
                const contractDate = contractDateIdx !== -1 ? parseExcelDate(row[contractDateIdx]) : joinDate;
                
                const staffData = {
                    name: rawName.toString().trim(),
                    email: rawEmail,
                    phone: phoneIdx !== -1 ? (row[phoneIdx] || '').toString().trim() : '',
                    deptId: finalDeptId,
                    role: roleIdx !== -1 ? (row[roleIdx] || '').toString().trim() : 'Nhân viên',
                    salary: salaryIdx !== -1 ? parseFloat(row[salaryIdx] || 0) : 0,
                    bhxh: bhxhIdx !== -1 ? (row[bhxhIdx] || '').toString().trim() : '',
                    joinDate: joinDate || new Date().toISOString().slice(0, 10),
                    contractDate: contractDate || joinDate || new Date().toISOString().slice(0, 10),
                    status: 'active'
                };
                
                try {
                    PersonnelManager.addStaff(staffData);
                    importedCount++;
                } catch (err) {
                    errorCount++;
                }
            }
            
            showToast(`Nhập thành công ${importedCount} nhân sự! (Lỗi/Trùng: ${errorCount})`, 'success');
            
            DepartmentsManager.populateSelectElement('filter-personnel-dept', 'Phòng ban');
            DepartmentsManager.populateSelectElement('filter-task-dept', 'Phòng ban');
            populateTaskAssigneeFilter();
            handleDataUpdate();
            
        } catch (err) {
            showToast('Lỗi khi đọc file Excel: ' + err.message, 'error');
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
}

// --- TASKS PAGE LOGIC ---
function setupTasksPage() {
    DepartmentsManager.populateSelectElement('filter-task-dept', 'Phòng ban');
    populateTaskAssigneeFilter();

    const viewKanbanBtn = document.getElementById('btn-view-kanban');
    const viewListBtn = document.getElementById('btn-view-list');

    if (viewKanbanBtn && viewListBtn) {
        viewKanbanBtn.addEventListener('click', () => {
            currentTaskView = 'kanban';
            viewKanbanBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            document.getElementById('filter-task-status-container').classList.add('hidden');
            renderTasksListOrKanban();
        });

        viewListBtn.addEventListener('click', () => {
            currentTaskView = 'list';
            viewListBtn.classList.add('active');
            viewKanbanBtn.classList.remove('active');
            document.getElementById('filter-task-status-container').classList.remove('hidden');
            renderTasksListOrKanban();
        });
    }

    const searchInput = document.getElementById('search-task');
    const deptFilter = document.getElementById('filter-task-dept');
    const assigneeFilter = document.getElementById('filter-task-assignee');
    const priorityFilter = document.getElementById('filter-task-priority');
    const statusFilter = document.getElementById('filter-task-status');

    const triggerFilter = () => {
        taskFilters.search = searchInput ? searchInput.value : '';
        taskFilters.deptId = deptFilter ? deptFilter.value : '';
        taskFilters.assigneeId = assigneeFilter ? assigneeFilter.value : '';
        taskFilters.priority = priorityFilter ? priorityFilter.value : '';
        taskFilters.status = statusFilter ? statusFilter.value : '';
        renderTasksListOrKanban();
    };

    if (searchInput) searchInput.addEventListener('input', triggerFilter);
    if (deptFilter) deptFilter.addEventListener('change', triggerFilter);
    if (assigneeFilter) assigneeFilter.addEventListener('change', triggerFilter);
    if (priorityFilter) priorityFilter.addEventListener('change', triggerFilter);
    if (statusFilter) statusFilter.addEventListener('change', triggerFilter);

    const addTaskBtn = document.getElementById('btn-add-task');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            window.openTaskModal();
        });
    }
}

function populateTaskAssigneeFilter() {
    const select = document.getElementById('filter-task-assignee');
    if (!select) return;

    const staff = PersonnelManager.getPersonnel().filter(p => p.status !== 'inactive');
    let html = '<option value="">Người thực hiện</option>';
    staff.forEach(s => {
        html += `<option value="${s.id}">${s.name}</option>`;
    });
    select.innerHTML = html;
}

function renderTasksListOrKanban() {
    if (currentTaskView === 'kanban') {
        TasksManager.renderKanban('tasks-list-container', taskFilters);
    } else {
        TasksManager.renderList('tasks-list-container', taskFilters);
    }
}

// --- NEW: PROCUREMENT PAGE LOGIC ---
function setupProcurementPage() {
    ProcurementManager.populateMonthFilter('filter-procurement-month');

    const filterMonth = document.getElementById('filter-procurement-month');
    if (filterMonth) {
        // Set default value to global activeProcurementMonth
        filterMonth.value = activeProcurementMonth;
        filterMonth.addEventListener('change', (e) => {
            activeProcurementMonth = e.target.value;
            ProcurementManager.renderProcurementPage('procurement-list-container', activeProcurementMonth);
        });
    }

    const addProcBtn = document.getElementById('btn-add-procurement');
    if (addProcBtn) {
        addProcBtn.addEventListener('click', () => {
            window.openProcurementModal();
        });
    }
}

// --- NEW: CONTRACTS PAGE LOGIC ---
function setupContractsPage() {
    // Handled mostly by ContractsManager rendering. Tab switching calls renderActiveTab.
}

// --- DEPARTMENTS PAGE LOGIC ---
function setupDepartmentsPage() {
    const form = document.getElementById('form-add-department');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-dept-name');
        const name = input ? input.value : '';

        try {
            DepartmentsManager.addDepartment(name);
            if (input) input.value = '';
            
            DepartmentsManager.renderDepartmentsList('departments-list-container');
            // Update filter dropdowns
            DepartmentsManager.populateSelectElement('filter-personnel-dept', 'Phòng ban');
            DepartmentsManager.populateSelectElement('filter-task-dept', 'Phòng ban');
            
            showToast('Thêm phòng ban mới thành công!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// --- DATA MANAGEMENT / IMPORT / EXPORT / RESET ---
function setupDataSettings() {
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            StorageManager.exportData();
            showToast('Bắt đầu tải file sao lưu dữ liệu...', 'success');
        });
    }

    const importInput = document.getElementById('input-import-data');
    const importBtn = document.getElementById('btn-import-data');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            if (e.target.files.length === 0) return;
            const file = e.target.files[0];
            
            if (confirm('Nhập dữ liệu mới sẽ ghi đè lên toàn bộ dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?')) {
                StorageManager.importData(file, (success, msg) => {
                    if (success) {
                        showToast(msg, 'success');
                        DepartmentsManager.populateSelectElement('filter-personnel-dept', 'Phòng ban');
                        DepartmentsManager.populateSelectElement('filter-task-dept', 'Phòng ban');
                        ProcurementManager.populateMonthFilter('filter-procurement-month');
                        populateTaskAssigneeFilter();
                        handleDataUpdate();
                    } else {
                        showToast(msg, 'error');
                    }
                    importInput.value = '';
                });
            } else {
                importInput.value = '';
            }
        });
    }

    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Hành động này sẽ khôi phục dữ liệu mẫu ban đầu và xóa sạch các thay đổi của bạn. Bạn chắc chắn chứ?')) {
                StorageManager.clearAll();
                DepartmentsManager.populateSelectElement('filter-personnel-dept', 'Phòng ban');
                DepartmentsManager.populateSelectElement('filter-task-dept', 'Phòng ban');
                ProcurementManager.populateMonthFilter('filter-procurement-month');
                populateTaskAssigneeFilter();
            }
        });
    }
}

// --- TOAST NOTIFICATIONS ---
function setupNotifications() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
}

function showToast(msg, type) {
    if (window.showToast) {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}

// --- MODALS (STAFF, TASK, PROCUREMENT & CONTRACT VIEW) ---
function setupModals() {
    const staffModal = document.getElementById('staff-modal');
    const taskModal = document.getElementById('task-modal');
    const procurementModal = document.getElementById('procurement-modal');
    const contractViewModal = document.getElementById('contract-view-modal');
    
    // Close buttons
    document.querySelectorAll('.modal-close, .btn-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Close on click outside modal-content
    window.addEventListener('click', (e) => {
        if (e.target === staffModal) closeAllModals();
        if (e.target === taskModal) closeAllModals();
        if (e.target === procurementModal) closeAllModals();
        if (e.target === contractViewModal) closeAllModals();
    });

    // Form Personnel Submit
    const staffForm = document.getElementById('form-staff');
    if (staffForm) {
        staffForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const staffId = document.getElementById('staff-id-field').value;
            const staffData = {
                name: document.getElementById('staff-name').value,
                email: document.getElementById('staff-email').value,
                phone: document.getElementById('staff-phone').value,
                deptId: document.getElementById('staff-dept').value,
                role: document.getElementById('staff-role').value,
                salary: document.getElementById('staff-salary').value,
                bhxh: document.getElementById('staff-bhxh').value,
                joinDate: document.getElementById('staff-join-date').value,
                contractDate: document.getElementById('staff-contract-date').value,
                status: document.getElementById('staff-status').value
            };

            try {
                if (staffId) {
                    PersonnelManager.updateStaff(staffId, staffData);
                    showToast('Cập nhật nhân sự thành công!', 'success');
                } else {
                    PersonnelManager.addStaff(staffData);
                    showToast('Thêm nhân sự mới thành công!', 'success');
                }
                closeAllModals();
                populateTaskAssigneeFilter();
                handleDataUpdate();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Form Task Submit
    const taskForm = document.getElementById('form-task');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskId = document.getElementById('task-id-field').value;
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-desc').value,
                assigneeId: document.getElementById('task-assignee').value,
                deptId: document.getElementById('task-dept').value,
                priority: document.getElementById('task-priority').value,
                dueDate: document.getElementById('task-due-date').value,
                status: document.getElementById('task-status').value
            };

            try {
                if (taskId) {
                    TasksManager.updateTask(taskId, taskData);
                    showToast('Cập nhật công việc thành công!', 'success');
                } else {
                    TasksManager.addTask(taskData);
                    showToast('Tạo công việc mới thành công!', 'success');
                }
                closeAllModals();
                handleDataUpdate();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // NEW: Form Procurement Submit
    const procurementForm = document.getElementById('form-procurement');
    if (procurementForm) {
        procurementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('procurement-id-field').value;
            const data = {
                date: document.getElementById('proc-date').value,
                supplier: document.getElementById('proc-supplier').value,
                productName: document.getElementById('proc-product-name').value,
                quantity: document.getElementById('proc-quantity').value,
                price: document.getElementById('proc-price').value
            };

            try {
                if (id) {
                    ProcurementManager.updateProcurement(id, data);
                    showToast('Cập nhật mua sắm thành công!', 'success');
                } else {
                    ProcurementManager.addProcurement(data);
                    showToast('Ghi nhận mua sắm thành công!', 'success');
                }
                closeAllModals();
                
                // Refresh months filter and table view
                ProcurementManager.populateMonthFilter('filter-procurement-month');
                if (data.date) {
                    activeProcurementMonth = data.date.slice(0, 7);
                    const monthSelect = document.getElementById('filter-procurement-month');
                    if (monthSelect) monthSelect.value = activeProcurementMonth;
                }
                ProcurementManager.renderProcurementPage('procurement-list-container', activeProcurementMonth);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // NEW: Print Contract Action
    const printBtn = document.getElementById('btn-print-contract');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const previewText = document.getElementById('contract-preview-content').innerText;
            const printContent = document.getElementById('print-content');
            if (printContent) {
                printContent.innerText = previewText;
                window.print();
            }
        });
    }

    // Export modal handlers to window
    window.openStaffModal = function(staffId = null) {
        DepartmentsManager.populateSelectElement('staff-dept', 'Chọn phòng ban');
        
        const modalTitle = document.getElementById('staff-modal-title');
        const submitBtn = document.getElementById('btn-submit-staff');
        const idField = document.getElementById('staff-id-field');
        const nameField = document.getElementById('staff-name');
        const emailField = document.getElementById('staff-email');
        const phoneField = document.getElementById('staff-phone');
        const deptField = document.getElementById('staff-dept');
        const roleField = document.getElementById('staff-role');
        const salaryField = document.getElementById('staff-salary');
        const bhxhField = document.getElementById('staff-bhxh');
        const joinDateField = document.getElementById('staff-join-date');
        const contractDateField = document.getElementById('staff-contract-date');
        const statusField = document.getElementById('staff-status');

        if (staffId) {
            const staff = PersonnelManager.getStaffById(staffId);
            if (!staff) return;

            modalTitle.innerText = 'Chỉnh Sửa Nhân Sự';
            submitBtn.innerText = 'Lưu Thay Đổi';
            idField.value = staff.id;
            nameField.value = staff.name;
            emailField.value = staff.email || '';
            phoneField.value = staff.phone || '';
            deptField.value = staff.deptId;
            roleField.value = staff.role;
            salaryField.value = staff.salary || '';
            bhxhField.value = staff.bhxh || '';
            joinDateField.value = staff.joinDate;
            contractDateField.value = staff.contractDate || staff.joinDate;
            statusField.value = staff.status;
            
            document.getElementById('staff-status-group').classList.remove('hidden');
        } else {
            modalTitle.innerText = 'Thêm Nhân Sự Mới';
            submitBtn.innerText = 'Thêm Nhân Sự';
            staffForm.reset();
            idField.value = '';
            
            const today = new Date().toISOString().slice(0, 10);
            joinDateField.value = today;
            contractDateField.value = today;
            statusField.value = 'active';
        }

        staffModal.classList.add('active');
    };

    window.openTaskModal = function(taskId = null) {
        DepartmentsManager.populateSelectElement('task-dept', 'Chọn phòng ban phụ trách');
        PersonnelManager.populateAssigneeSelect('task-assignee', 'Chọn nhân viên thực hiện');

        const modalTitle = document.getElementById('task-modal-title');
        const submitBtn = document.getElementById('btn-submit-task');
        const idField = document.getElementById('task-id-field');
        const titleField = document.getElementById('task-title');
        const descField = document.getElementById('task-desc');
        const assigneeField = document.getElementById('task-assignee');
        const deptField = document.getElementById('task-dept');
        const priorityField = document.getElementById('task-priority');
        const dueField = document.getElementById('task-due-date');
        const statusField = document.getElementById('task-status');

        // Automatically prefill department
        assigneeField.addEventListener('change', () => {
            const assigneeId = assigneeField.value;
            if (assigneeId) {
                const staff = PersonnelManager.getStaffById(assigneeId);
                if (staff && staff.deptId) {
                    deptField.value = staff.deptId;
                }
            }
        });

        if (taskId) {
            const task = TasksManager.getTaskById(taskId);
            if (!task) return;

            modalTitle.innerText = 'Chỉnh Sửa Công Việc';
            submitBtn.innerText = 'Lưu Thay Đổi';
            idField.value = task.id;
            titleField.value = task.title;
            descField.value = task.description;
            assigneeField.value = task.assigneeId;
            deptField.value = task.deptId;
            priorityField.value = task.priority;
            dueField.value = task.dueDate;
            statusField.value = task.status;

            document.getElementById('task-status-group').classList.remove('hidden');
        } else {
            modalTitle.innerText = 'Tạo Công Việc Mới';
            submitBtn.innerText = 'Tạo Công Việc';
            taskForm.reset();
            idField.value = '';
            
            const oneWeek = new Date();
            oneWeek.setDate(oneWeek.getDate() + 7);
            dueField.value = oneWeek.toISOString().slice(0, 10);
            
            priorityField.value = 'medium';
            statusField.value = 'todo';
        }

        taskModal.classList.add('active');
    };

    // NEW: Open Procurement Modal Helper
    window.openProcurementModal = function(id = null) {
        const modalTitle = document.getElementById('procurement-modal-title');
        const submitBtn = document.getElementById('btn-submit-procurement');
        const idField = document.getElementById('procurement-id-field');
        const dateField = document.getElementById('proc-date');
        const supplierField = document.getElementById('proc-supplier');
        const productField = document.getElementById('proc-product-name');
        const qtyField = document.getElementById('proc-quantity');
        const priceField = document.getElementById('proc-price');

        if (id) {
            const p = ProcurementManager.getProcurementById(id);
            if (!p) return;
            modalTitle.innerText = 'Chỉnh Sửa Mua Sắm Vật Tư';
            submitBtn.innerText = 'Lưu Thay Đổi';
            idField.value = p.id;
            dateField.value = p.date;
            supplierField.value = p.supplier;
            productField.value = p.productName;
            qtyField.value = p.quantity;
            priceField.value = p.price;
        } else {
            modalTitle.innerText = 'Ghi Nhận Mua Sắm Mới';
            submitBtn.innerText = 'Ghi Nhận Mua Sắm';
            procurementForm.reset();
            idField.value = '';
            dateField.value = new Date().toISOString().slice(0, 10);
        }

        procurementModal.classList.add('active');
    };

    // NEW: Open Contract View Modal Helper
    window.openContractViewModal = function(staffId) {
        const staff = PersonnelManager.getStaffById(staffId);
        if (!staff) return;

        const previewContainer = document.getElementById('contract-preview-content');
        const staffIdField = document.getElementById('contract-view-staff-id');

        // Compile template
        const text = ContractsManager.generateContractText(staff);
        previewContainer.innerText = text;
        staffIdField.value = staff.id;

        contractViewModal.classList.add('active');
    };
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}
