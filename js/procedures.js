// js/procedures.js

const ProceduresManager = {
    getProcedures() {
        return StorageManager.getProcedures();
    },

    getProcedureById(id) {
        return this.getProcedures().find(p => p.id === id);
    },

    addProcedure(data) {
        if (!data.name || !data.name.trim()) throw new Error('Tên quy trình không được để trống.');
        if (!data.steps || data.steps.length === 0) throw new Error('Quy trình phải có ít nhất 1 bước.');

        const procedures = this.getProcedures();
        const newProc = {
            id: 'proc-' + Date.now(),
            name: data.name.trim(),
            deptId: data.deptId || '',
            description: data.description.trim(),
            steps: data.steps.map((s, index) => ({
                title: `Bước ${index + 1}: ${s.title.trim()}`,
                desc: s.desc.trim()
            }))
        };

        procedures.push(newProc);
        StorageManager.saveProcedures(procedures);
        return newProc;
    },

    deleteProcedure(id) {
        let procedures = this.getProcedures();
        procedures = procedures.filter(p => p.id !== id);
        StorageManager.saveProcedures(procedures);
    },

    renderProceduresTab(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const list = this.getProcedures();
        
        let html = `
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap: 24px;">
                <!-- Left panel: List of Procedures -->
                <div class="panel-card" style="padding: 20px; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 8px;">
                        <h3 class="font-semibold text-base-size">Mục Lục Quy Trình</h3>
                        <button class="btn btn-sm btn-primary" id="btn-create-procedure-form">+ Quy trình</button>
                    </div>
                    <div id="procedure-menu-list" style="display:flex; flex-direction:column; gap:8px;">
        `;

        if (list.length === 0) {
            html += `
                <div class="empty-state-compact">
                    <p class="text-muted">Chưa có quy trình nào.</p>
                </div>
            `;
        } else {
            list.forEach((proc, index) => {
                html += `
                    <div class="proc-menu-item" data-id="${proc.id}" style="cursor:pointer; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; transition: all var(--transition-speed); display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex-grow:1; margin-right:8px;">
                            <div class="font-semibold text-base-size" style="line-height:1.3;">${proc.name}</div>
                            <span class="text-xs-size text-muted">${DepartmentsManager.getDepartmentName(proc.deptId)}</span>
                        </div>
                        <button class="btn btn-icon btn-outline-danger btn-delete-proc" data-id="${proc.id}" style="width:24px; height:24px; padding:0; flex-shrink:0;">
                            &times;
                        </button>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>

                <!-- Right panel: Active Workflow Preview or Form -->
                <div id="procedure-content-panel" class="panel-card" style="padding: 24px;">
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>Chọn một quy trình công việc ở mục lục để xem sơ đồ chi tiết hoặc tạo quy trình mới.</p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Bind delete buttons
        container.querySelectorAll('.btn-delete-proc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid selecting item
                const id = btn.getAttribute('data-id');
                const proc = this.getProcedureById(id);
                if (confirm(`Bạn có chắc muốn xóa quy trình "${proc.name}"?`)) {
                    this.deleteProcedure(id);
                    this.renderProceduresTab(containerId);
                    window.showToast?.('Xóa quy trình thành công!', 'success');
                    window.dispatchEvent(new CustomEvent('proceduresUpdated'));
                }
            });
        });

        // Bind menu items select
        container.querySelectorAll('.proc-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove active classes
                container.querySelectorAll('.proc-menu-item').forEach(i => i.style.borderColor = 'var(--border-color)');
                item.style.borderColor = 'var(--primary-color)';
                
                const id = item.getAttribute('data-id');
                this.renderProcedureDetails(id);
            });
        });

        // Bind open form button
        document.getElementById('btn-create-procedure-form').addEventListener('click', () => {
            this.renderProcedureForm();
        });
    },

    renderProcedureDetails(id) {
        const panel = document.getElementById('procedure-content-panel');
        if (!panel) return;

        const proc = this.getProcedureById(id);
        if (!proc) return;

        const deptName = DepartmentsManager.getDepartmentName(proc.deptId);

        let html = `
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
                <span class="badge badge-info" style="margin-bottom:8px;">${deptName}</span>
                <h2 class="font-semibold text-lg-size" style="font-size:20px; line-height:1.3; color: var(--text-main);">${proc.name}</h2>
                <p class="text-sm-size text-muted" style="margin-top:6px;">${proc.description || 'Không có mô tả.'}</p>
            </div>

            <h3 class="font-semibold text-base-size" style="margin-bottom:20px;">Sơ đồ quy trình thực hiện</h3>
            <div class="procedure-flowchart-stepper" style="display:flex; flex-direction:column; gap:20px; position:relative; padding-left:16px;">
        `;

        // Style the stepper steps nicely with a continuous vertical line
        html += `
            <div style="position:absolute; left:26px; top:12px; bottom:12px; width:2px; background-color: var(--border-color); z-index:0;"></div>
        `;

        proc.steps.forEach((step, index) => {
            html += `
                <div class="procedure-step-item" style="display:flex; gap:16px; align-items:flex-start; position:relative; z-index:1;">
                    <div style="width:24px; height:24px; border-radius:50%; background-color: var(--primary-color); color:var(--text-inverse); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; box-shadow: 0 0 0 4px var(--bg-secondary);">
                        ${index + 1}
                    </div>
                    <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 16px; flex-grow:1;">
                        <h4 class="font-semibold text-base-size" style="color:var(--text-main);">${step.title}</h4>
                        <p class="text-xs-size text-muted mt-1" style="line-height:1.5;">${step.desc}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        panel.innerHTML = html;
    },

    renderProcedureForm() {
        const panel = document.getElementById('procedure-content-panel');
        if (!panel) return;

        let html = `
            <h3 class="font-semibold text-lg-size" style="margin-bottom:16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">Tạo Quy Trình Công Việc Mới</h3>
            <form id="form-create-procedure">
                <div class="form-group">
                    <label for="proc-name-field" class="form-label">Tên Quy Trình <span style="color:var(--danger-color)">*</span></label>
                    <input type="text" id="proc-name-field" class="form-input" placeholder="Ví dụ: Quy trình nghỉ phép năm" required>
                </div>

                <div class="form-group row-2">
                    <div>
                        <label for="proc-dept-field" class="form-label">Phòng Ban Áp Dụng</label>
                        <select id="proc-dept-field" class="form-input">
                            <!-- Populated in JS -->
                        </select>
                    </div>
                    <div>
                        <label for="proc-desc-field" class="form-label">Mô Tả Quy Trình</label>
                        <input type="text" id="proc-desc-field" class="form-input" placeholder="Tóm tắt ngắn gọn nội dung quy trình...">
                    </div>
                </div>

                <h4 class="font-semibold text-base-size" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Danh sách các bước thực hiện</span>
                    <button type="button" class="btn btn-sm btn-secondary" id="btn-add-step-input">+ Thêm bước</button>
                </h4>
                
                <div id="proc-steps-inputs-container" style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; max-height:220px; overflow-y:auto; padding-right:8px;">
                    <!-- Step rows will be appended here -->
                    <div class="step-input-row" style="display:flex; gap:10px; align-items:flex-start;">
                        <span style="font-weight:bold; margin-top:8px; width:20px; flex-shrink:0;">1.</span>
                        <input type="text" class="form-input step-title-input" placeholder="Tiêu đề bước (Ví dụ: Điền đơn xin phép)" required style="flex:1;">
                        <input type="text" class="form-input step-desc-input" placeholder="Mô tả công việc (Ví dụ: Nhập thông tin ngày nghỉ...)" required style="flex:2;">
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border-color); padding-top:16px;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-proc-form">Hủy</button>
                    <button type="submit" class="btn btn-primary btn-sm">Tạo Quy Trình</button>
                </div>
            </form>
        `;

        panel.innerHTML = html;

        // Populate department dropdown
        DepartmentsManager.populateSelectElement('proc-dept-field', 'Áp dụng toàn công ty');

        // Bind Dynamic Steps addition
        let stepCount = 1;
        const stepsContainer = document.getElementById('proc-steps-inputs-container');
        document.getElementById('btn-add-step-input').addEventListener('click', () => {
            stepCount++;
            const row = document.createElement('div');
            row.className = 'step-input-row';
            row.style.display = 'flex';
            row.style.gap = '10px';
            row.style.alignItems = 'flex-start';
            row.innerHTML = `
                <span style="font-weight:bold; margin-top:8px; width:20px; flex-shrink:0;">${stepCount}.</span>
                <input type="text" class="form-input step-title-input" placeholder="Tiêu đề bước..." required style="flex:1;">
                <input type="text" class="form-input step-desc-input" placeholder="Mô tả công việc..." required style="flex:2;">
                <button type="button" class="btn btn-outline-danger btn-delete-step-row" style="padding: 6px 10px; font-weight:bold; font-size:14px;">&times;</button>
            `;
            stepsContainer.appendChild(row);

            // Bind delete button
            row.querySelector('.btn-delete-step-row').addEventListener('click', () => {
                row.remove();
                reindexStepRows();
            });
        });

        const reindexStepRows = () => {
            stepCount = 0;
            stepsContainer.querySelectorAll('.step-input-row').forEach(row => {
                stepCount++;
                row.querySelector('span').innerText = `${stepCount}.`;
            });
        };

        // Bind Submit
        const form = document.getElementById('form-create-procedure');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const steps = [];
            stepsContainer.querySelectorAll('.step-input-row').forEach(row => {
                const title = row.querySelector('.step-title-input').value;
                const desc = row.querySelector('.step-desc-input').value;
                if (title && desc) {
                    steps.push({ title, desc });
                }
            });

            const data = {
                name: document.getElementById('proc-name-field').value,
                deptId: document.getElementById('proc-dept-field').value,
                description: document.getElementById('proc-desc-field').value,
                steps: steps
            };

            try {
                this.addProcedure(data);
                window.showToast?.('Tạo quy trình mới thành công!', 'success');
                this.renderProceduresTab('procedures-container');
                window.dispatchEvent(new CustomEvent('proceduresUpdated'));
            } catch (error) {
                window.showToast?.(error.message, 'error');
            }
        });

        // Cancel button
        document.getElementById('btn-cancel-proc-form').addEventListener('click', () => {
            this.renderProceduresTab('procedures-container');
        });
    }
};

window.ProceduresManager = ProceduresManager;
