/* ==========================================================================
   CSE SGPA & CGPA SYSTEM - FULL WEB APP JAVASCRIPT ENGINE
   ========================================================================== */

// ---------- SEMESTER CURRICULUM DATA ----------
const SEMESTERS = {
    "L1T1": {
        courses: [
            ["Basic Functional English", 3],
            ["Mathematics I", 3],
            ["Intro to Biology & Chemistry", 3],
            ["Computer Fundamentals", 3]
        ],
        total_credit: 12.0
    },
    "L1T2": {
        courses: [
            ["Writing & Comprehension", 3],
            ["Mathematics II", 3],
            ["Programming & Problem Solving", 3],
            ["Programming Lab", 1.5],
            ["Physics I", 3]
        ],
        total_credit: 13.5
    },
    "L1T3": {
        courses: [
            ["Physics II", 3],
            ["Physics II Lab", 1.5],
            ["Electrical Circuits", 3],
            ["Electrical Circuits Lab", 1.5],
            ["Data Structure", 3],
            ["Data Structure Lab", 1.5]
        ],
        total_credit: 13.5
    },
    "L2T1": {
        courses: [
            ["Engineering Mathematics", 3],
            ["Discrete Mathematics", 3],
            ["Algorithms", 3],
            ["Algorithms Lab", 1.5],
            ["Bangladesh Studies", 3]
        ],
        total_credit: 13.5
    },
    "L2T2": {
        courses: [
            ["Art of Living", 3],
            ["Electronic Devices & Circuits", 3],
            ["EDC Lab", 1.5],
            ["Object Oriented Programming", 3],
            ["OOP Lab", 1.5]
        ],
        total_credit: 12.0
    },
    "L2T3": {
        courses: [
            ["Digital Logic Design", 3],
            ["DLD Lab", 1.5],
            ["Data Communication", 3],
            ["Theory of Computation", 3],
            ["Systems Analysis & Design", 3]
        ],
        total_credit: 13.5
    },
    "L3T1": {
        courses: [
            ["Numerical Methods", 3],
            ["DBMS", 3],
            ["DBMS Lab", 1.5],
            ["Compiler Design", 3],
            ["Compiler Lab", 1.5]
        ],
        total_credit: 12.0
    },
    "L3T2": {
        courses: [
            ["Software Engineering", 3],
            ["Microprocessor", 3],
            ["Computer Networks", 3],
            ["Networks Lab", 1.5],
            ["Accounting", 3]
        ],
        total_credit: 13.5
    },
    "L3T3": {
        courses: [
            ["Statistics", 3],
            ["Artificial Intelligence", 3],
            ["Operating Systems", 3],
            ["OS Lab", 1.5],
            ["Elective I", 3]
        ],
        total_credit: 13.5
    },
    "L4T1": {
        courses: [
            ["Instrumentation", 3],
            ["Professional Issues", 3],
            ["Computer Graphics", 3],
            ["Graphics Lab", 1.5],
            ["Elective II", 3]
        ],
        total_credit: 13.5
    },
    "L4T2": {
        courses: [
            ["Computer Architecture", 3],
            ["Elective III", 3],
            ["Elective IV", 3],
            ["Capstone I", 3]
        ],
        total_credit: 12.0
    },
    "L4T3": {
        courses: [
            ["Engineering Economics", 3],
            ["Elective V", 3],
            ["Elective VI", 3],
            ["Capstone II", 3]
        ],
        total_credit: 12.0
    }
};

// Total curriculum credits
const TOTAL_CURRICULUM_CREDITS = 154.5;

// ---------- GLOBAL STATE ----------
let currentUser = null; // { studentId: string, isGuest: boolean }
let appData = {}; // Stores all registered users & records in localStorage

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    setupEventListeners();
    populateSemesterDropdown();
    renderManualTable();
    checkActiveSession();
});

// ---------- DATABASE / LOCALSTORAGE HANDLERS ----------
function loadDatabase() {
    const stored = localStorage.getItem('cse_cgpa_database');
    if (stored) {
        try {
            appData = JSON.parse(stored);
        } catch (e) {
            appData = {};
        }
    }
}

function saveDatabase() {
    localStorage.setItem('cse_cgpa_database', JSON.stringify(appData));
}

function checkActiveSession() {
    const savedSession = localStorage.getItem('cse_cgpa_active_session');
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            launchApp();
        } catch (e) {
            currentUser = null;
        }
    }
}

function getUserRecords() {
    if (!currentUser || currentUser.isGuest) return {};
    if (!appData[currentUser.studentId]) {
        appData[currentUser.studentId] = { password: '', records: {} };
    }
    return appData[currentUser.studentId].records || {};
}

// ---------- AUTHENTICATION LOGIC ----------
function validateStudentId(id) {
    const pattern = /^\d{3}-\d{2}-\d{3}$/;
    return pattern.test(id);
}

function showAuthAlert(msg, type = 'danger') {
    const alertEl = document.getElementById('auth-alert');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = msg;
    alertEl.classList.remove('hidden');
}

function clearAuthAlert() {
    document.getElementById('auth-alert').classList.add('hidden');
}

function handleLogin() {
    const sid = document.getElementById('student-id').value.trim();
    const pwd = document.getElementById('password').value.trim();

    if (!validateStudentId(sid)) {
        showAuthAlert('❌ Invalid Student ID format! Format: 251-15-065');
        return;
    }
    if (!pwd) {
        showAuthAlert('❌ Password is required');
        return;
    }

    if (!appData[sid]) {
        showAuthAlert('❌ Student ID not registered');
        return;
    }

    if (appData[sid].password !== pwd) {
        showAuthAlert('❌ Wrong password');
        return;
    }

    // Success
    currentUser = { studentId: sid, isGuest: false };
    launchApp();
}

function handleRegister() {
    const sid = document.getElementById('student-id').value.trim();
    const pwd = document.getElementById('password').value.trim();

    if (!validateStudentId(sid)) {
        showAuthAlert('❌ Invalid Student ID format! Format: 251-15-065');
        return;
    }
    if (!pwd) {
        showAuthAlert('❌ Password is required');
        return;
    }

    if (appData[sid]) {
        showAuthAlert('❌ Student ID already registered');
        return;
    }

    // Register
    appData[sid] = { password: pwd, records: {} };
    saveDatabase();
    showAuthAlert('✔ Account created! Logging in...', 'success');

    setTimeout(() => {
        currentUser = { studentId: sid, isGuest: false };
        launchApp();
    }, 600);
}

function handleGuest() {
    currentUser = { studentId: null, isGuest: true };
    launchApp();
}

function launchApp() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // Update User Badge & Navigation
    const displayId = document.getElementById('display-student-id');
    const statusPill = document.getElementById('user-status-pill');
    const welcomeMsg = document.getElementById('welcome-message');

    if (currentUser.isGuest) {
        displayId.textContent = "Guest User";
        statusPill.textContent = "Guest Mode";
        statusPill.style.color = "#f59e0b";
        welcomeMsg.textContent = "Welcome, Guest User!";

        // Disable guest restricted features in nav
        document.querySelectorAll('.nav-item.guest-disabled').forEach(el => {
            el.classList.add('disabled');
        });
        document.querySelectorAll('.guest-disabled').forEach(el => {
            el.classList.add('disabled');
        });
    } else {
        displayId.textContent = currentUser.studentId;
        statusPill.textContent = "Active";
        statusPill.style.color = "#10b981";
        welcomeMsg.textContent = `Welcome, ${currentUser.studentId}!`;

        document.querySelectorAll('.nav-item.guest-disabled').forEach(el => {
            el.classList.remove('disabled');
        });
        document.querySelectorAll('.guest-disabled').forEach(el => {
            el.classList.remove('disabled');
        });
    }

    // Persist active session across page refreshes
    localStorage.setItem('cse_cgpa_active_session', JSON.stringify(currentUser));

    switchTab('dashboard');
    updateDashboardStats();
    showToast(`Logged in successfully as ${currentUser.isGuest ? 'Guest' : currentUser.studentId}`, 'success');
}

function handleLogout() {
    localStorage.removeItem('cse_cgpa_active_session');
    currentUser = null;
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('student-id').value = '';
    document.getElementById('password').value = '';
    clearAuthAlert();
}

// ---------- NAVIGATION & TABS ----------
function setupEventListeners() {
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-register').addEventListener('click', handleRegister);
    document.getElementById('btn-guest').addEventListener('click', handleGuest);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.tab;
            if (currentUser.isGuest && btn.classList.contains('guest-disabled')) {
                showToast("This feature is disabled in Guest mode. Please login.", "error");
                return;
            }
            switchTab(target);
        });
    });

    // Mobile Toggle
    document.getElementById('mobile-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });

    document.getElementById('btn-quick-export').addEventListener('click', exportSummary);
}

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    // Show active pane & nav
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) activePane.classList.add('active');

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update Header Title
    const titles = {
        'dashboard': 'Dashboard',
        'theory-result': 'Theory Course Calculator',
        'sgpa-entry': 'Enter / Update SGPA',
        'view-sgpa': 'SGPA Records',
        'cgpa-result': 'CGPA Overview',
        'manual-cgpa': 'Manual CGPA Calculator',
        'target-cgpa': 'Target CGPA Planner'
    };
    document.getElementById('current-tab-title').textContent = titles[tabId] || 'Dashboard';

    // On-Demand Tab Refresh
    if (tabId === 'dashboard') updateDashboardStats();
    if (tabId === 'sgpa-entry') loadSemesterCourses();
    if (tabId === 'view-sgpa') renderSGPARecords();
    if (tabId === 'cgpa-result') renderCGPAOverview();

    // Close mobile menu if open
    document.querySelector('.sidebar').classList.remove('open');
}

// ---------- GRADE FORMULAS & CALCULATION ENGINES ----------
function pointToGrade(point) {
    if (point === 4.00) return "A+";
    if (point >= 3.75) return "A";
    if (point >= 3.50) return "A-";
    if (point >= 3.25) return "B+";
    if (point >= 3.00) return "B";
    if (point >= 2.25) return "C";
    if (point >= 2.00) return "D";
    return "F";
}

function calculateCGPAFromRecords(records) {
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const semKey in records) {
        const r = records[semKey];
        totalWeightedPoints += r.sgpa * r.credit;
        totalCredits += r.credit;
    }

    if (totalCredits === 0) return { cgpa: null, grade: null, credits: 0 };

    const cgpa = Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
    return { cgpa, grade: pointToGrade(cgpa), credits: totalCredits };
}

// ---------- DASHBOARD UPDATES ----------
function updateDashboardStats() {
    const cgpaEl = document.getElementById('dash-cgpa');
    const gradeEl = document.getElementById('dash-grade');
    const creditsEl = document.getElementById('dash-credits');

    if (currentUser.isGuest) {
        cgpaEl.textContent = "N/A";
        gradeEl.textContent = "Guest Mode";
        creditsEl.textContent = "0.0 / 154.5";
        return;
    }

    const records = getUserRecords();
    const { cgpa, grade, credits } = calculateCGPAFromRecords(records);

    if (cgpa === null) {
        cgpaEl.textContent = "0.00";
        gradeEl.textContent = "No Records";
        creditsEl.textContent = "0.0 / 154.5";
    } else {
        cgpaEl.textContent = cgpa.toFixed(2);
        gradeEl.textContent = `Grade: ${grade}`;
        creditsEl.textContent = `${credits} / 154.5`;
    }
}

// ---------- 1. THEORY RESULT CALCULATOR ----------
function calculateTheoryResult() {
    const getVal = (id, max) => {
        const val = parseFloat(document.getElementById(id).value.trim());
        if (isNaN(val) || val < 0 || val > max) {
            throw new Error(`Invalid score for ${id}. Must be between 0 and ${max}.`);
        }
        return val;
    };

    try {
        const attendance = getVal('th-attendance', 7);
        const assignment = getVal('th-assignment', 5);
        const presentation = getVal('th-presentation', 8);

        const q1 = getVal('th-q1', 15);
        const q2 = getVal('th-q2', 15);
        const q3 = getVal('th-q3', 15);
        const quizAvg = (q1 + q2 + q3) / 3;

        const midterm = getVal('th-midterm', 25);
        const finalExam = getVal('th-final', 40);

        const total = attendance + assignment + presentation + quizAvg + midterm + finalExam;
        const totalRounded = Math.round(total * 100) / 100;

        // Grade conversion based on 100 marks
        let gradePoint = 0.0;
        if (totalRounded >= 80) gradePoint = 4.00;
        else if (totalRounded >= 75) gradePoint = 3.75;
        else if (totalRounded >= 70) gradePoint = 3.50;
        else if (totalRounded >= 65) gradePoint = 3.25;
        else if (totalRounded >= 60) gradePoint = 3.00;
        else if (totalRounded >= 55) gradePoint = 2.75;
        else if (totalRounded >= 50) gradePoint = 2.50;
        else if (totalRounded >= 45) gradePoint = 2.25;
        else if (totalRounded >= 40) gradePoint = 2.00;
        else gradePoint = 0.00;

        const letterGrade = pointToGrade(gradePoint);

        const resBox = document.getElementById('theory-result-box');
        document.getElementById('theory-total-marks').textContent = `${totalRounded.toFixed(2)} / 100`;
        document.getElementById('theory-grade-pill').textContent = `Grade Point: ${gradePoint.toFixed(2)} (${letterGrade})`;
        resBox.classList.remove('hidden');

        showToast("Theory marks calculated successfully!", "success");

    } catch (err) {
        showToast(err.message || "Please fill all fields correctly", "error");
    }
}

function resetTheoryForm() {
    ['th-attendance', 'th-assignment', 'th-presentation', 'th-q1', 'th-q2', 'th-q3', 'th-midterm', 'th-final'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('theory-result-box').classList.add('hidden');
}

// ---------- 2. SGPA CALCULATOR & ENTRY ----------
function populateSemesterDropdown() {
    const select = document.getElementById('sem-dropdown');
    select.innerHTML = '';
    Object.keys(SEMESTERS).forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem;
        opt.textContent = `${sem} (${SEMESTERS[sem].total_credit} Credits)`;
        select.appendChild(opt);
    });
}

function loadSemesterCourses() {
    const sem = document.getElementById('sem-dropdown').value || "L1T1";
    const tbody = document.getElementById('sgpa-table-body');
    tbody.innerHTML = '';

    const courses = SEMESTERS[sem].courses;

    // Check if user already has saved values for this semester
    const records = getUserRecords();
    const existingSem = records[sem];

    courses.forEach((c, idx) => {
        const [courseName, credit] = c;
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><strong>${courseName}</strong></td>
            <td><span class="badge">${credit} Credit</span></td>
            <td>
                <input type="number" class="course-point-input" data-course="${courseName}" data-credit="${credit}" 
                       min="0" max="4" step="0.01" placeholder="e.g. 3.75">
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('sgpa-result-box').classList.add('hidden');
}

function calculateAndSaveSGPA() {
    const sem = document.getElementById('sem-dropdown').value;
    const inputs = document.querySelectorAll('.course-point-input');
    const semData = SEMESTERS[sem];

    let totalWeighted = 0;

    try {
        inputs.forEach(input => {
            const val = parseFloat(input.value.trim());
            const credit = parseFloat(input.dataset.credit);

            if (isNaN(val) || val < 0.0 || val > 4.0) {
                throw new Error("Enter valid grade point (0.00 to 4.00) for all subjects.");
            }

            totalWeighted += val * credit;
        });

        const sgpa = Math.round((totalWeighted / semData.total_credit) * 100) / 100;
        const grade = pointToGrade(sgpa);

        // Display result
        document.getElementById('sgpa-res-title').textContent = `SGPA for ${sem}`;
        document.getElementById('sgpa-res-val').textContent = sgpa.toFixed(2);
        document.getElementById('sgpa-res-grade').textContent = `Grade: ${grade}`;
        document.getElementById('sgpa-result-box').classList.remove('hidden');

        // Save if not guest
        if (!currentUser.isGuest) {
            const records = getUserRecords();
            records[sem] = {
                sgpa: sgpa,
                grade: grade,
                credit: semData.total_credit
            };
            saveDatabase();
            showToast(`SGPA saved for ${sem}!`, "success");
        } else {
            showToast(`Calculated SGPA for ${sem} (Guest Mode - Not Saved)`, "success");
        }

    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------- 3. VIEW SGPA RECORDS ----------
function renderSGPARecords() {
    const tbody = document.getElementById('records-table-body');
    const emptyState = document.getElementById('no-sgpa-msg');
    const tableContainer = document.getElementById('sgpa-records-table-container');

    tbody.innerHTML = '';

    if (currentUser.isGuest) {
        emptyState.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        return;
    }

    const records = getUserRecords();
    const keys = Object.keys(records);

    if (keys.length === 0) {
        emptyState.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableContainer.classList.remove('hidden');

    keys.forEach(sem => {
        const r = records[sem];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sem}</strong></td>
            <td>${r.credit}</td>
            <td><span class="stat-value" style="font-size: 1.1rem">${r.sgpa.toFixed(2)}</span></td>
            <td><span class="res-grade-pill">${r.grade}</span></td>
            <td>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteSGPARecord('${sem}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteSGPARecord(sem) {
    if (currentUser.isGuest) return;
    const records = getUserRecords();
    delete records[sem];
    saveDatabase();
    renderSGPARecords();
    updateDashboardStats();
    showToast(`Record for ${sem} deleted.`, "success");
}

// ---------- 4. CGPA OVERVIEW ----------
function renderCGPAOverview() {
    const records = getUserRecords();
    const { cgpa, grade, credits } = calculateCGPAFromRecords(records);

    document.getElementById('overview-cgpa-val').textContent = cgpa ? cgpa.toFixed(2) : "0.00";
    document.getElementById('overview-grade-val').textContent = grade ? `Overall Grade: ${grade}` : "Overall Grade: N/A";
    document.getElementById('overview-completed-credits').textContent = credits.toFixed(1);
    document.getElementById('overview-total-sems').textContent = Object.keys(records).length;
}

// ---------- 5. MANUAL CGPA CALCULATOR ----------
function renderManualTable() {
    const tbody = document.getElementById('manual-cgpa-table-body');
    tbody.innerHTML = '';

    Object.keys(SEMESTERS).forEach(sem => {
        const credit = SEMESTERS[sem].total_credit;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sem}</strong></td>
            <td>
                <input type="number" class="manual-sgpa-input" data-sem="${sem}" data-credit="${credit}" 
                       min="0" max="4" step="0.01" placeholder="e.g. 3.50">
            </td>
            <td>${credit} Credits</td>
        `;
        tbody.appendChild(tr);
    });
}

function calculateManualCGPA() {
    const inputs = document.querySelectorAll('.manual-sgpa-input');
    let totalWeighted = 0;
    let totalCredits = 0;
    let hasInput = false;

    try {
        inputs.forEach(input => {
            const valStr = input.value.trim();
            if (valStr !== '') {
                const val = parseFloat(valStr);
                const credit = parseFloat(input.dataset.credit);

                if (isNaN(val) || val < 0.0 || val > 4.0) {
                    throw new Error("SGPA values must be between 0.00 and 4.00");
                }

                totalWeighted += val * credit;
                totalCredits += credit;
                hasInput = true;
            }
        });

        if (!hasInput || totalCredits === 0) {
            throw new Error("Please enter SGPA for at least one semester.");
        }

        const cgpa = Math.round((totalWeighted / totalCredits) * 100) / 100;
        const grade = pointToGrade(cgpa);

        document.getElementById('manual-cgpa-val').textContent = cgpa.toFixed(2);
        document.getElementById('manual-grade-val').textContent = `Grade: ${grade}`;
        document.getElementById('manual-result-box').classList.remove('hidden');
        showToast("Cumulative CGPA calculated!", "success");

    } catch (err) {
        showToast(err.message, "error");
    }
}

function resetManualForm() {
    document.querySelectorAll('.manual-sgpa-input').forEach(input => input.value = '');
    document.getElementById('manual-result-box').classList.add('hidden');
}

// ---------- 6. TARGET CGPA PLANNER ----------
function calculateTargetCGPA() {
    const targetStr = document.getElementById('target-cgpa-input').value.trim();
    const remStr = document.getElementById('target-rem-sems').value.trim();

    const target = parseFloat(targetStr);
    const remainingCount = parseInt(remStr);

    if (isNaN(target) || target < 0 || target > 4.0) {
        showToast("Target CGPA must be between 0.00 and 4.00", "error");
        return;
    }

    if (isNaN(remainingCount) || remainingCount <= 0) {
        showToast("Remaining semesters must be at least 1", "error");
        return;
    }

    const records = currentUser.isGuest ? {} : getUserRecords();
    const semKeys = Object.keys(SEMESTERS);

    // Track completed vs uncompleted semesters
    let doneCredit = 0;
    let doneWeighted = 0;
    let completedCount = 0;
    const uncompletedSems = [];

    semKeys.forEach(sem => {
        if (records[sem]) {
            doneCredit += records[sem].credit;
            doneWeighted += records[sem].sgpa * records[sem].credit;
            completedCount++;
        } else {
            uncompletedSems.push(sem);
        }
    });

    const maxRemaining = uncompletedSems.length;

    if (maxRemaining === 0) {
        showToast("You have completed all 12 semesters in the curriculum!", "error");
        return;
    }

    // Input Validation: Check if remaining semesters requested exceeds actual remaining semesters
    if (remainingCount > maxRemaining) {
        const resBox = document.getElementById('target-result-box');
        const valEl = document.getElementById('target-required-val');
        const adviceEl = document.getElementById('target-advice-text');

        resBox.classList.remove('hidden');
        valEl.textContent = `Input Warning`;
        valEl.style.color = "#f43f5e";
        if (completedCount > 0) {
            adviceEl.textContent = `⚠️ You have already completed ${completedCount} semesters! Only ${maxRemaining} semester(s) remain in the 12-semester curriculum.`;
        } else {
            adviceEl.textContent = `⚠️ Maximum 12 semesters exist in the CSE curriculum. Please enter a number between 1 and 12.`;
        }
        return;
    }

    // Dynamically calculate credits for the next N uncompleted semesters
    let remainingCredit = 0;
    for (let i = 0; i < remainingCount; i++) {
        const sem = uncompletedSems[i];
        remainingCredit += SEMESTERS[sem].total_credit;
    }

    const newTotalCredit = doneCredit + remainingCredit;
    const totalRequiredWeighted = target * newTotalCredit;
    const requiredWeighted = totalRequiredWeighted - doneWeighted;
    const requiredSGPA = requiredWeighted / remainingCredit;
    const requiredRounded = Math.round(requiredSGPA * 100) / 100;

    const resBox = document.getElementById('target-result-box');
    const valEl = document.getElementById('target-required-val');
    const adviceEl = document.getElementById('target-advice-text');

    resBox.classList.remove('hidden');

    const currentCGPA = doneCredit > 0 ? (doneWeighted / doneCredit) : 0;

    if (requiredRounded > 4.00) {
        valEl.textContent = `Avg SGPA ≥ ${requiredRounded.toFixed(2)}`;
        valEl.style.color = "#f43f5e";
        adviceEl.textContent = `⚠️ Mathematically impossible! You need ${requiredRounded.toFixed(2)} SGPA, which exceeds the 4.00 maximum limit.`;
    } else if (requiredRounded <= 0) {
        valEl.textContent = `Avg SGPA ≥ 2.00`;
        valEl.style.color = "#10b981";
        adviceEl.textContent = `🎉 You have already secured your target CGPA! Just maintain passing grades (>= 2.00).`;
    } else {
        valEl.textContent = `Avg SGPA ≥ ${requiredRounded.toFixed(2)}`;
        valEl.style.color = "#3b82f6";
        if (doneCredit > 0) {
            adviceEl.textContent = `🎯 Completed: ${completedCount} Semesters (${doneCredit} Credits, Current CGPA: ${currentCGPA.toFixed(2)}). To reach CGPA ${target.toFixed(2)} across next ${remainingCount} semester(s) (${remainingCredit} Credits), you need an average SGPA of ${requiredRounded.toFixed(2)}.`;
        } else {
            adviceEl.textContent = `🎯 To achieve a target CGPA of ${target.toFixed(2)} over the next ${remainingCount} semester(s) (${remainingCredit} Credits), you need an average SGPA of ${requiredRounded.toFixed(2)}.`;
        }
    }

    showToast("Target SGPA requirement calculated!", "success");
}

// ---------- 7. EXPORT SUMMARY REPORT ----------
function exportSummary() {
    if (currentUser.isGuest) {
        showToast("Export is disabled in Guest Mode.", "error");
        return;
    }

    const records = getUserRecords();
    const { cgpa, grade, credits } = calculateCGPAFromRecords(records);

    if (Object.keys(records).length === 0) {
        showToast("No semester records available to export.", "error");
        return;
    }

    const dateStr = new Date().toLocaleString();
    let text = `============================================\n`;
    text += `    CSE DEPARTMENT - RESULT SUMMARY REPORT   \n`;
    text += `============================================\n\n`;
    text += `Student ID   : ${currentUser.studentId}\n`;
    text += `Generated On : ${dateStr}\n`;
    text += `Overall CGPA : ${cgpa ? cgpa.toFixed(2) : "N/A"} (${grade || "N/A"})\n`;
    text += `Credits Done : ${credits} / ${TOTAL_CURRICULUM_CREDITS}\n\n`;
    text += `--------------------------------------------\n`;
    text += `SEMESTER-WISE BREAKDOWN:\n`;
    text += `--------------------------------------------\n`;

    for (const sem in records) {
        const r = records[sem];
        text += `${sem.padEnd(8)} | SGPA: ${r.sgpa.toFixed(2).padEnd(5)} | Grade: ${r.grade.padEnd(4)} | Credits: ${r.credit}\n`;
    }

    text += `\n============================================\n`;

    // Trigger Browser Download
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Result_Summary_${currentUser.studentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    showToast("Result summary report downloaded!", "success");
}

// ---------- 8. CHART.JS PERFORMANCE TRAJECTORY RENDERER ----------
let sgpaChartInstance = null;

function renderSGPAChart() {
    const canvas = document.getElementById('sgpa-chart');
    if (!canvas) return;

    const records = getUserRecords();
    const semKeys = Object.keys(SEMESTERS);
    const labels = [];
    const dataPoints = [];

    semKeys.forEach(sem => {
        if (records[sem]) {
            labels.push(sem);
            dataPoints.push(records[sem].sgpa);
        }
    });

    if (sgpaChartInstance) {
        sgpaChartInstance.destroy();
    }

    if (labels.length === 0) {
        labels.push('L1T1');
        dataPoints.push(0);
    }

    const ctx = canvas.getContext('2d');
    
    // Theme accent color getter
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#3b82f6';

    sgpaChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'SGPA Score',
                data: dataPoints,
                borderColor: accentColor,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointBackgroundColor: accentColor,
                pointBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0.0,
                    max: 4.0,
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ---------- 9. JSON DATA BACKUP & RESTORE ----------
function exportJSONBackup() {
    if (currentUser.isGuest) {
        showToast("Backup is disabled in Guest Mode.", "error");
        return;
    }

    const records = getUserRecords();
    const backupObj = {
        studentId: currentUser.studentId,
        exportedAt: new Date().toISOString(),
        records: records
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIU_CSE_CGPA_Backup_${currentUser.studentId}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast("JSON Data Backup downloaded!", "success");
}

function importJSONBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (currentUser.isGuest) {
        showToast("Restore is disabled in Guest Mode.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.records || typeof data.records !== 'object') {
                throw new Error("Invalid backup file structure");
            }

            if (!appData[currentUser.studentId]) {
                appData[currentUser.studentId] = { password: '', records: {} };
            }

            appData[currentUser.studentId].records = data.records;
            saveDatabase();

            updateDashboardStats();
            renderSGPARecords();
            renderCGPAOverview();
            renderSGPAChart();

            showToast("JSON Backup restored successfully!", "success");
        } catch (err) {
            showToast("Failed to restore backup file. Invalid format.", "error");
        }
    };
    reader.readAsText(file);
}

// ---------- 10. THEME ACCENT SWITCHER ----------
const THEME_ACCENTS = {
    'blue': { primary: '#3b82f6', hover: '#2563eb', glow: 'rgba(59, 130, 246, 0.35)' },
    'emerald': { primary: '#10b981', hover: '#059669', glow: 'rgba(16, 185, 129, 0.35)' },
    'purple': { primary: '#8b5cf6', hover: '#7c3aed', glow: 'rgba(139, 92, 246, 0.35)' },
    'cyan': { primary: '#06b6d4', hover: '#0891b2', glow: 'rgba(6, 182, 212, 0.35)' },
    'amber': { primary: '#f59e0b', hover: '#d97706', glow: 'rgba(245, 158, 11, 0.35)' }
};

function setThemeAccent(themeKey) {
    const theme = THEME_ACCENTS[themeKey];
    if (!theme) return;

    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-hover', theme.hover);
    document.documentElement.style.setProperty('--primary-glow', theme.glow);

    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.classList.toggle('active', dot.classList.contains(themeKey));
    });

    localStorage.setItem('cse_cgpa_theme_accent', themeKey);
    renderSGPAChart();
}

function loadSavedThemeAccent() {
    const saved = localStorage.getItem('cse_cgpa_theme_accent') || 'blue';
    setThemeAccent(saved);
}

// Update Dashboard Refresh to include Chart
const origUpdateDash = updateDashboardStats;
updateDashboardStats = function() {
    origUpdateDash();
    renderSGPAChart();
};

// Apply theme on load & register PWA Service Worker
document.addEventListener('DOMContentLoaded', () => {
    loadSavedThemeAccent();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => {});
    }
});

// ---------- UTILS: TOAST SYSTEM ----------
function showToast(msg, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
