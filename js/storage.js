// js/storage.js

const KEYS = {
    DEPARTMENTS: 'taskflow_departments',
    PERSONNEL: 'taskflow_personnel',
    TASKS: 'taskflow_tasks',
    PROCUREMENTS: 'taskflow_procurements',
    CONTRACT_TEMPLATE: 'taskflow_contract_template',
    PROCEDURES: 'taskflow_procedures',
    DOCUMENTS: 'taskflow_documents',
    RECRUITMENTS: 'taskflow_recruitments',
    THEME: 'taskflow_theme'
};

const MOCK_DEPARTMENTS = [
    { id: 'dept-1', name: 'Ban giám đốc' },
    { id: 'dept-2', name: 'Phòng HCNS' },
    { id: 'dept-3', name: 'Phòng kĩ thuật' },
    { id: 'dept-4', name: 'Phòng Biên tập' },
    { id: 'dept-5', name: 'Phòng Kế toán' },
    { id: 'dept-6', name: 'Phòng Đào tạo' },
    { id: 'dept-7', name: 'Phòng Thiết kế - phần mềm' },
    { id: 'dept-8', name: 'Phòng sản xuất' },
    { id: 'dept-9', name: 'Phòng kinh doanh' },
    { id: 'dept-10', name: 'Phòng sự kiện' }
];

const MOCK_PERSONNEL = [];

const MOCK_TASKS = [];

const MOCK_PROCUREMENTS = [];

const MOCK_PROCEDURES = [
    {
        id: 'proc-1',
        name: 'Quy trình thử việc & Onboard nhân sự mới',
        deptId: 'dept-2',
        description: 'Các bước chuẩn bị và chào đón nhân viên mới gia nhập công ty.',
        steps: [
            { title: 'Bước 1: Chuẩn bị trang thiết bị', desc: 'Chuẩn bị góc làm việc, máy tính, tài khoản email và công cụ làm việc trước ngày làm 1 ngày.' },
            { title: 'Bước 2: Ký hợp đồng & Hội nhập', desc: 'Ký hợp đồng thử việc, hướng dẫn quy chế nội bộ, văn hóa công ty và giới thiệu nhân sự.' },
            { title: 'Bước 3: Đánh giá thử việc', desc: 'Trưởng bộ phận đào tạo chuyên môn, đánh giá năng lực sau 2 tháng để quyết định ký HĐ chính thức.' }
        ]
    },
    {
        id: 'proc-2',
        name: 'Quy trình xin phê duyệt ngân sách mua sắm',
        deptId: 'dept-1',
        description: 'Quy trình đề xuất chi tiêu và cấp phát ngân sách mua vật tư thiết bị nội bộ.',
        steps: [
            { title: 'Bước 1: Tạo tờ trình đề xuất', desc: 'Bộ phận đề xuất lập phiếu ghi nhận nhu cầu, số lượng, đơn giá dự kiến và lý do mua sắm.' },
            { title: 'Bước 2: Trưởng bộ phận duyệt', desc: 'Cấp quản lý phòng ban xem xét tính cần thiết của đề xuất và ký duyệt nội bộ.' },
            { title: 'Bước 3: Ban Giám Đốc phê duyệt', desc: 'Ban Giám đốc xem xét hạn mức ngân sách và duyệt chi chuyển kế toán mua sắm.' }
        ]
    }
];

const MOCK_DOCUMENTS = [
    {
        id: 'doc-1',
        title: 'Quy chế làm việc nội bộ năm 2026',
        date: '2026-01-01',
        category: 'Quy chế',
        content: `QUY CHẾ LÀM VIỆC NỘI BỘ NĂM 2026

Điều 1: Thời gian làm việc
- Giờ làm việc tiêu chuẩn: Từ 08h00 đến 17h30 hàng ngày.
- Nghỉ trưa: Từ 12h00 đến 13h30.
- Ngày làm việc: Từ thứ Hai đến hết thứ Sáu hàng tuần.
- Nhân viên thực hiện chấm công ra/vào qua ứng dụng nội bộ hoặc vân tay đúng quy định.

Điều 2: Trang phục công sở
- Yêu cầu trang phục lịch sự, gọn gàng và chuyên nghiệp.
- Thứ Hai hàng tuần: Mặc áo đồng phục công ty kết hợp quần/chân váy tối màu.

Điều 3: Quy chế Nghỉ phép
- Mỗi nhân viên chính thức có 12 ngày phép năm hưởng nguyên lương.
- Nghỉ phép từ 1 ngày trở lên phải gửi tờ trình duyệt trước ít nhất 1 ngày làm việc.`
    },
    {
        id: 'doc-2',
        title: 'Chính sách bảo mật thông tin nội bộ',
        date: '2026-02-15',
        category: 'Chính sách',
        content: `CHÍNH SÁCH BẢO MẬT THÔNG TIN NỘI BỘ

Điều 1: Bảo mật dữ liệu khách hàng
- Mọi thông tin liên hệ, dữ liệu hợp đồng và dự án của khách hàng đều là tài sản bảo mật tối mật của công ty.
- Tuyệt đối không chia sẻ thông tin khách hàng cho bất kỳ bên thứ ba nào khi chưa được phê duyệt từ Giám đốc.

Điều 2: Bảo mật hệ thống phần mềm
- Không sử dụng tài khoản làm việc trên các thiết bị công cộng mà không đăng xuất.
- Đặt mật khẩu thiết bị cá nhân có độ dài ít nhất 8 ký tự và thay đổi 3 tháng một lần.`
    }
];

const MOCK_RECRUITMENTS = [];

const DEFAULT_CONTRACT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
------------------

HỢP ĐỒNG LAO ĐỘNG
Số: {ID_HD}/HĐLĐ

Hôm nay, ngày {NGAY_KY}, chúng tôi gồm:
1. NGƯỜI SỬ DỤNG LAO ĐỘNG (Bên A):
- Đại diện: Ông/Bà Giám Đốc
- Chức vụ: Giám Đốc đại diện doanh nghiệp
- Địa chỉ công ty: Tầng 10, Tòa nhà TF, Hà Nội

2. NGƯỜI LAO ĐỘNG (Bên B):
- Họ và tên: {HO_TEN}
- Số điện thoại: {DIEN_THOAI}
- Email: {EMAIL}

Hai bên thỏa thuận ký kết hợp đồng lao động này với các điều khoản sau:
Điều 1: Công việc và địa điểm làm việc
- Bộ phận công tác: {PHONG_BAN}
- Chức danh chuyên môn (Chức vụ): {CHUC_VU}
- Địa điểm làm việc: Văn phòng chính công ty hoặc theo điều động công việc.

Điều 2: Thời hạn hợp đồng
- Loại hợp đồng: Hợp đồng lao động xác định thời hạn (12 tháng)
- Ngày bắt đầu làm việc: {NGAY_VAO}
- Ngày ký hợp đồng: {NGAY_KY_HD}

Điều 3: Quyền lợi của Người lao động
- Mức lương chính: {MUC_LUONG}
- Mã số đóng BHXH: {BHXH}
- Thời gian làm việc: 8h/ngày, từ thứ Hai đến thứ Sáu hàng tuần.
- Quyền lợi khác: Hưởng chế độ bảo hiểm, phép năm và phúc lợi theo Luật lao động.

Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.

          ĐẠI DIỆN BÊN A                                   BÊN B
           (Ký, ghi rõ họ tên)                       (Ký, ghi rõ họ tên)`;

const StorageManager = {
    init() {
        const storedDepts = localStorage.getItem(KEYS.DEPARTMENTS);
        const shouldReset = !storedDepts || JSON.parse(storedDepts).length < 10;
        
        if (shouldReset) {
            localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(MOCK_DEPARTMENTS));
            localStorage.setItem(KEYS.PERSONNEL, JSON.stringify([]));
            localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
            localStorage.setItem(KEYS.PROCUREMENTS, JSON.stringify([]));
            localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(MOCK_PROCEDURES));
            localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(MOCK_DOCUMENTS));
            localStorage.setItem(KEYS.RECRUITMENTS, JSON.stringify([]));
            localStorage.setItem(KEYS.CONTRACT_TEMPLATE, DEFAULT_CONTRACT_TEMPLATE);
        } else {
            // Auto-cleanup mock personnel if they exist in localStorage from previous versions
            try {
                let pList = JSON.parse(localStorage.getItem(KEYS.PERSONNEL)) || [];
                const mockNames = ['Nguyễn Văn An', 'Trần Thị Bình', 'Phạm Văn Cường', 'Lê Thị Dung', 'Hoàng Văn Giang', 'Lê Minh Giáo'];
                const hasMock = pList.some(p => mockNames.includes(p.name));
                if (hasMock) {
                    localStorage.setItem(KEYS.PERSONNEL, JSON.stringify([]));
                    localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
                    localStorage.setItem(KEYS.PROCUREMENTS, JSON.stringify([]));
                    localStorage.setItem(KEYS.RECRUITMENTS, JSON.stringify([]));
                }
            } catch (e) {
                console.error(e);
            }
        }
        
        if (!localStorage.getItem(KEYS.THEME)) {
            localStorage.setItem(KEYS.THEME, 'light');
        }
    },

    getDepartments() {
        return JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS)) || [];
    },

    saveDepartments(departments) {
        localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(departments));
        window.dispatchEvent(new CustomEvent('departmentsUpdated'));
    },

    getPersonnel() {
        return JSON.parse(localStorage.getItem(KEYS.PERSONNEL)) || [];
    },

    savePersonnel(personnel) {
        localStorage.setItem(KEYS.PERSONNEL, JSON.stringify(personnel));
        window.dispatchEvent(new CustomEvent('personnelUpdated'));
    },

    getTasks() {
        return JSON.parse(localStorage.getItem(KEYS.TASKS)) || [];
    },

    saveTasks(tasks) {
        localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    },

    getProcurements() {
        return JSON.parse(localStorage.getItem(KEYS.PROCUREMENTS)) || [];
    },

    saveProcurements(procurements) {
        localStorage.setItem(KEYS.PROCUREMENTS, JSON.stringify(procurements));
        window.dispatchEvent(new CustomEvent('procurementsUpdated'));
    },

    getProcedures() {
        return JSON.parse(localStorage.getItem(KEYS.PROCEDURES)) || [];
    },

    saveProcedures(procedures) {
        localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(procedures));
        window.dispatchEvent(new CustomEvent('proceduresUpdated'));
    },

    getDocuments() {
        return JSON.parse(localStorage.getItem(KEYS.DOCUMENTS)) || [];
    },

    saveDocuments(documents) {
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
        window.dispatchEvent(new CustomEvent('documentsUpdated'));
    },

    getRecruitments() {
        return JSON.parse(localStorage.getItem(KEYS.RECRUITMENTS)) || [];
    },

    saveRecruitments(recruitments) {
        localStorage.setItem(KEYS.RECRUITMENTS, JSON.stringify(recruitments));
        window.dispatchEvent(new CustomEvent('recruitmentsUpdated'));
    },

    getContractTemplate() {
        return localStorage.getItem(KEYS.CONTRACT_TEMPLATE) || DEFAULT_CONTRACT_TEMPLATE;
    },

    saveContractTemplate(template) {
        localStorage.setItem(KEYS.CONTRACT_TEMPLATE, template);
        window.dispatchEvent(new CustomEvent('contractTemplateUpdated'));
    },

    getTheme() {
        return localStorage.getItem(KEYS.THEME) || 'light';
    },

    saveTheme(theme) {
        localStorage.setItem(KEYS.THEME, theme);
    },

    exportData() {
        const data = {
            departments: this.getDepartments(),
            personnel: this.getPersonnel(),
            tasks: this.getTasks(),
            procurements: this.getProcurements(),
            procedures: this.getProcedures(),
            documents: this.getDocuments(),
            recruitments: this.getRecruitments(),
            contractTemplate: this.getContractTemplate()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importData(file, callback) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                if (parsedData.departments && parsedData.personnel && parsedData.tasks) {
                    this.saveDepartments(parsedData.departments);
                    this.savePersonnel(parsedData.personnel);
                    this.saveTasks(parsedData.tasks);
                    if (parsedData.procurements) this.saveProcurements(parsedData.procurements);
                    if (parsedData.procedures) this.saveProcedures(parsedData.procedures);
                    if (parsedData.documents) this.saveDocuments(parsedData.documents);
                    if (parsedData.recruitments) this.saveRecruitments(parsedData.recruitments);
                    if (parsedData.contractTemplate) this.saveContractTemplate(parsedData.contractTemplate);
                    if (callback) callback(true, 'Nhập dữ liệu thành công!');
                } else {
                    if (callback) callback(false, 'Định dạng file không đúng cấu trúc TaskFlow!');
                }
            } catch (e) {
                if (callback) callback(false, 'File không hợp lệ hoặc bị lỗi!');
            }
        };
        reader.readAsText(file);
    },

    clearAll() {
        localStorage.removeItem(KEYS.DEPARTMENTS);
        localStorage.removeItem(KEYS.PERSONNEL);
        localStorage.removeItem(KEYS.TASKS);
        localStorage.removeItem(KEYS.PROCUREMENTS);
        localStorage.removeItem(KEYS.PROCEDURES);
        localStorage.removeItem(KEYS.DOCUMENTS);
        localStorage.removeItem(KEYS.RECRUITMENTS);
        localStorage.removeItem(KEYS.CONTRACT_TEMPLATE);
        this.init();
        window.dispatchEvent(new CustomEvent('dataCleared'));
    }
};

// Khởi tạo ngay lập tức
StorageManager.init();
window.StorageManager = StorageManager;
