// js/documents.js

const DocumentsManager = {
    getDocuments() {
        return StorageManager.getDocuments();
    },

    getDocumentById(id) {
        return this.getDocuments().find(d => d.id === id);
    },

    addDocument(data) {
        this.validateDocumentData(data);

        const documents = this.getDocuments();
        const newDoc = {
            id: 'doc-' + Date.now(),
            title: data.title.trim(),
            date: data.date || new Date().toISOString().slice(0, 10),
            category: data.category,
            content: data.content.trim()
        };

        documents.push(newDoc);
        StorageManager.saveDocuments(documents);
        return newDoc;
    },

    updateDocument(id, data) {
        this.validateDocumentData(data);

        const documents = this.getDocuments();
        const index = documents.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Không tìm thấy văn bản quy định.');

        documents[index] = {
            ...documents[index],
            title: data.title.trim(),
            date: data.date,
            category: data.category,
            content: data.content.trim()
        };

        StorageManager.saveDocuments(documents);
        return documents[index];
    },

    deleteDocument(id) {
        let documents = this.getDocuments();
        documents = documents.filter(d => d.id !== id);
        StorageManager.saveDocuments(documents);
    },

    validateDocumentData(data) {
        if (!data.title || !data.title.trim()) throw new Error('Tiêu đề văn bản không được để trống.');
        if (!data.content || !data.content.trim()) throw new Error('Nội dung văn bản không được để trống.');
        if (!data.category) throw new Error('Vui lòng chọn phân loại văn bản.');
        if (!data.date) throw new Error('Vui lòng chọn ngày ban hành.');
    },

    renderDocumentsTab(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let list = this.getDocuments();

        // Apply filters
        if (filters.search) {
            const searchVal = filters.search.toLowerCase().trim();
            list = list.filter(d => 
                d.title.toLowerCase().includes(searchVal) || 
                d.content.toLowerCase().includes(searchVal)
            );
        }

        if (filters.category) {
            list = list.filter(d => d.category === filters.category);
        }

        let html = `
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap: 24px;">
                <!-- Left panel: List & Filters -->
                <div class="panel-card" style="padding: 20px; display:flex; flex-direction:column; gap:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                        <h3 class="font-semibold text-base-size">Mục Lục Văn Bản</h3>
                        <button class="btn btn-sm btn-primary" id="btn-create-document-form">+ Soạn văn bản</button>
                    </div>
                    
                    <!-- Search & Filter inputs -->
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <input type="text" id="search-doc-input" class="filter-control" placeholder="Tìm tiêu đề, nội dung..." style="min-width:100%;" value="${filters.search || ''}">
                        <select id="filter-doc-cat" class="filter-control" style="min-width:100%;">
                            <option value="">-- Tất cả phân loại --</option>
                            <option value="Quy chế" ${filters.category === 'Quy chế' ? 'selected' : ''}>Quy chế</option>
                            <option value="Quy định" ${filters.category === 'Quy định' ? 'selected' : ''}>Quy định</option>
                            <option value="Chính sách" ${filters.category === 'Chính sách' ? 'selected' : ''}>Chính sách</option>
                            <option value="Hướng dẫn" ${filters.category === 'Hướng dẫn' ? 'selected' : ''}>Hướng dẫn</option>
                        </select>
                    </div>

                    <div id="document-menu-list" style="display:flex; flex-direction:column; gap:8px; max-height: 320px; overflow-y:auto;">
        `;

        if (list.length === 0) {
            html += `
                <div class="empty-state-compact">
                    <p class="text-muted">Không tìm thấy văn bản phù hợp.</p>
                </div>
            `;
        } else {
            list.forEach(doc => {
                html += `
                    <div class="doc-menu-item" data-id="${doc.id}" style="cursor:pointer; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; transition: all var(--transition-speed); display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex-grow:1; margin-right:8px;">
                            <div class="font-semibold text-base-size" style="line-height:1.3;">${doc.title}</div>
                            <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
                                <span class="badge badge-dept" style="font-size:9px; padding:1px 4px;">${doc.category}</span>
                                <span class="text-xs-size text-muted">${PersonnelManager.formatDate(doc.date)}</span>
                            </div>
                        </div>
                        <button class="btn btn-icon btn-outline-danger btn-delete-doc" data-id="${doc.id}" style="width:24px; height:24px; padding:0; flex-shrink:0;">
                            &times;
                        </button>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>

                <!-- Right panel: Document Reader or Form -->
                <div id="document-content-panel" class="panel-card" style="padding: 24px;">
                    <div class="empty-state">
                        <div class="empty-icon">📖</div>
                        <p>Chọn một văn bản quy định ở mục lục để đọc trực tuyến hoặc soạn thảo văn bản mới.</p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Bind Search & Filters
        const searchInput = document.getElementById('search-doc-input');
        const catFilter = document.getElementById('filter-doc-cat');
        
        const triggerFilter = () => {
            const newFilters = {
                search: searchInput ? searchInput.value : '',
                category: catFilter ? catFilter.value : ''
            };
            this.renderDocumentsTab(containerId, newFilters);
        };

        if (searchInput) searchInput.addEventListener('input', triggerFilter);
        if (catFilter) catFilter.addEventListener('change', triggerFilter);

        // Bind delete buttons
        container.querySelectorAll('.btn-delete-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid selecting item
                const id = btn.getAttribute('data-id');
                const doc = this.getDocumentById(id);
                if (confirm(`Bạn có chắc muốn xóa văn bản "${doc.title}"?`)) {
                    this.deleteDocument(id);
                    this.renderDocumentsTab(containerId, filters);
                    window.showToast?.('Xóa văn bản thành công!', 'success');
                    window.dispatchEvent(new CustomEvent('documentsUpdated'));
                }
            });
        });

        // Bind menu items select
        container.querySelectorAll('.doc-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                container.querySelectorAll('.doc-menu-item').forEach(i => i.style.borderColor = 'var(--border-color)');
                item.style.borderColor = 'var(--primary-color)';
                
                const id = item.getAttribute('data-id');
                this.renderDocumentReader(id);
            });
        });

        // Bind open form button
        document.getElementById('btn-create-document-form').addEventListener('click', () => {
            this.renderDocumentForm();
        });
    },

    renderDocumentReader(id) {
        const panel = document.getElementById('document-content-panel');
        if (!panel) return;

        const doc = this.getDocumentById(id);
        if (!doc) return;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
                <div>
                    <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
                        <span class="badge badge-info">${doc.category}</span>
                        <span class="text-xs-size text-muted">Ngày ban hành: ${PersonnelManager.formatDate(doc.date)}</span>
                    </div>
                    <h2 class="font-semibold text-lg-size" style="font-size:20px; line-height:1.3; color: var(--text-main);">${doc.title}</h2>
                </div>
                <button class="btn btn-outline-primary btn-sm" id="btn-edit-current-document" data-id="${doc.id}">Sửa văn bản</button>
            </div>

            <!-- Book-like Reader style -->
            <div class="document-reader-view" style="font-family: var(--font-sans); font-size:15px; line-height:1.7; color: var(--text-main); white-space:pre-wrap; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; max-height:450px; overflow-y:auto;">${doc.content}</div>
        `;

        panel.innerHTML = html;

        // Bind edit button
        document.getElementById('btn-edit-current-document').addEventListener('click', () => {
            this.renderDocumentForm(doc.id);
        });
    },

    renderDocumentForm(id = null) {
        const panel = document.getElementById('document-content-panel');
        if (!panel) return;

        let doc = null;
        if (id) {
            doc = this.getDocumentById(id);
        }

        const titleText = id ? 'Chỉnh Sửa Văn Bản Quy Định' : 'Soạn Thảo Văn Bản Quy Định Mới';
        const submitText = id ? 'Lưu Thay Đổi' : 'Ban Hành Văn Bản';

        let html = `
            <h3 class="font-semibold text-lg-size" style="margin-bottom:16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">${titleText}</h3>
            <form id="form-create-document">
                <input type="hidden" id="doc-id-field" value="${id || ''}">
                
                <div class="form-group">
                    <label for="doc-title-field" class="form-label">Tiêu Đề Văn Bản <span style="color:var(--danger-color)">*</span></label>
                    <input type="text" id="doc-title-field" class="form-input" placeholder="Ví dụ: Quy chế chấm công làm việc..." value="${doc ? doc.title : ''}" required>
                </div>

                <div class="form-group row-2">
                    <div>
                        <label for="doc-category-field" class="form-label">Phân Loại Văn Bản <span style="color:var(--danger-color)">*</span></label>
                        <select id="doc-category-field" class="form-input" required>
                            <option value="">Chọn phân loại</option>
                            <option value="Quy chế" ${doc && doc.category === 'Quy chế' ? 'selected' : ''}>Quy chế</option>
                            <option value="Quy định" ${doc && doc.category === 'Quy định' ? 'selected' : ''}>Quy định</option>
                            <option value="Chính sách" ${doc && doc.category === 'Chính sách' ? 'selected' : ''}>Chính sách</option>
                            <option value="Hướng dẫn" ${doc && doc.category === 'Hướng dẫn' ? 'selected' : ''}>Hướng dẫn</option>
                        </select>
                    </div>
                    <div>
                        <label for="doc-date-field" class="form-label">Ngày Ban Hành <span style="color:var(--danger-color)">*</span></label>
                        <input type="date" id="doc-date-field" class="form-input" value="${doc ? doc.date : new Date().toISOString().slice(0, 10)}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="doc-content-field" class="form-label">Nội Dung Văn Bản <span style="color:var(--danger-color)">*</span></label>
                    <textarea id="doc-content-field" class="form-input" style="height: 250px; font-family: inherit; font-size:14px; line-height:1.6; resize: vertical;" placeholder="Nhập đầy đủ nội dung các điều khoản, chính sách của văn bản..." required>${doc ? doc.content : ''}</textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border-color); padding-top:16px;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-doc-form">Hủy</button>
                    <button type="submit" class="btn btn-primary btn-sm">${submitText}</button>
                </div>
            </form>
        `;

        panel.innerHTML = html;

        // Bind Submit
        const form = document.getElementById('form-create-document');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const docId = document.getElementById('doc-id-field').value;
            const data = {
                title: document.getElementById('doc-title-field').value,
                category: document.getElementById('doc-category-field').value,
                date: document.getElementById('doc-date-field').value,
                content: document.getElementById('doc-content-field').value
            };

            try {
                if (docId) {
                    this.updateDocument(docId, data);
                    window.showToast?.('Cập nhật văn bản thành công!', 'success');
                } else {
                    this.addDocument(data);
                    window.showToast?.('Ban hành văn bản mới thành công!', 'success');
                }
                
                // Go back to list
                this.renderDocumentsTab('documents-container');
                window.dispatchEvent(new CustomEvent('documentsUpdated'));
            } catch (error) {
                window.showToast?.(error.message, 'error');
            }
        });

        // Cancel button
        document.getElementById('btn-cancel-doc-form').addEventListener('click', () => {
            if (id) {
                this.renderDocumentReader(id);
            } else {
                this.renderDocumentsTab('documents-container');
            }
        });
    }
};

window.DocumentsManager = DocumentsManager;
