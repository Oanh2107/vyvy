
const DepartmentsManager = {
    getDepartments() {
        return StorageManager.getDepartments();
    },

    addDepartment(name) {
        const cleanedName = name.trim();
        if (!cleanedName) throw new Error('Tên phòng ban không được để trống.');

        const departments = this.getDepartments();
        const exists = departments.some(d => d.name.toLowerCase() === cleanedName.toLowerCase());
        if (exists) throw new Error('Tên phòng ban đã tồn tại.');

        const newDept = {
            id: 'dept-' + Date.now(),
            name: cleanedName
        };

        departments.push(newDept);
        StorageManager.saveDepartments(departments);
        return newDept;
    },

    deleteDepartment(id) {
        const personnel = StorageManager.getPersonnel();
        const hasStaff = personnel.some(p => p.deptId === id && p.status !== 'inactive');
        if (hasStaff) {
            throw new Error('Không thể xóa phòng ban đang có nhân viên đang làm việc.');
        }

        let departments = this.getDepartments();
        departments = departments.filter(d => d.id !== id);
        StorageManager.saveDepartments(departments);

        // Update tasks that might be assigned to this department
        let tasks = StorageManager.getTasks();
        tasks = tasks.map(t => {
            if (t.deptId === id) {
                return { ...t, deptId: '' };
            }
            return t;
        });
        StorageManager.saveTasks(tasks);
    },

    getDepartmentName(id) {
        const dept = this.getDepartments().find(d => d.id === id);
        return dept ? dept.name : 'Chưa phân phòng';
    },

    populateSelectElement(selectElementId, defaultOptionText = 'Chọn phòng ban') {
        const select = document.getElementById(selectElementId);
        if (!select) return;

        const depts = this.getDepartments();
        let html = `<option value="">-- ${defaultOptionText} --</option>`;
        depts.forEach(dept => {
            html += `<option value="${dept.id}">${dept.name}</option>`;
        });
        select.innerHTML = html;
    },

    renderDepartmentsList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const depts = this.getDepartments();
        const personnel = StorageManager.getPersonnel();
        const tasks = StorageManager.getTasks();

        if (depts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏢</div>
                    <p>Chưa có phòng ban nào được tạo.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tên Phòng Ban</th>
                            <th class="text-center">Số Nhân Sự</th>
                            <th class="text-center">Công Việc Đang Chạy</th>
                            <th class="text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        depts.forEach(dept => {
            const staffCount = personnel.filter(p => p.deptId === dept.id && p.status !== 'inactive').length;
            const activeTasksCount = tasks.filter(t => t.deptId === dept.id && t.status !== 'completed').length;

            html += `
                <tr>
                    <td>
                        <div class="dept-info">
                            <span class="dept-icon-badge">🏢</span>
                            <span class="font-semibold">${dept.name}</span>
                        </div>
                    </td>
                    <td class="text-center"><span class="badge badge-info">${staffCount} nhân sự</span></td>
                    <td class="text-center"><span class="badge badge-warning">${activeTasksCount} công việc</span></td>
                    <td class="text-right">
                        <button class="btn btn-icon btn-danger btn-delete-dept" data-id="${dept.id}" title="Xóa phòng ban">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
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

        // Bind delete buttons
        container.querySelectorAll('.btn-delete-dept').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const name = this.getDepartmentName(id);
                if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}" không?`)) {
                    try {
                        this.deleteDepartment(id);
                        this.renderDepartmentsList(containerId);
                        // Show notification
                        window.showToast?.('Xóa phòng ban thành công!', 'success');
                    } catch (error) {
                        window.showToast?.(error.message, 'error');
                    }
                }
            });
        });
    }
};

window.DepartmentsManager = DepartmentsManager;
