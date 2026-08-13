document.addEventListener('DOMContentLoaded', () => {
    const CORRECT_PIN = "CoOcejoeconomi120ac?'1=+";
    const MAX_ATTEMPTS = 5;
    const COOLDOWN_MS = 30000;

    const loginOverlay = document.getElementById('login-overlay');
    const adminContent = document.getElementById('admin-content');
    const pinInput = document.getElementById('admin-pin');
    const loginBtn = document.getElementById('btn-login');
    const errorMsg = document.getElementById('login-error');
    const attemptsMsg = document.getElementById('login-attempts');
    const logoutBtn = document.getElementById('btn-logout');

    let attempts = parseInt(sessionStorage.getItem('login_attempts') || '0');
    let lockedUntil = parseInt(sessionStorage.getItem('locked_until') || '0');

    // Check session
    if (sessionStorage.getItem('admin_auth') === 'true') showDashboard();
    updateAttemptsDisplay();

    function handleLogin() {
        if (Date.now() < lockedUntil) {
            const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
            errorMsg.textContent = `Bloqueado. Espera ${secs}s`;
            errorMsg.style.display = 'block';
            return;
        }
        if (pinInput.value === CORRECT_PIN) {
            sessionStorage.setItem('admin_auth', 'true');
            sessionStorage.removeItem('login_attempts');
            sessionStorage.removeItem('locked_until');
            showDashboard();
        } else {
            attempts++;
            sessionStorage.setItem('login_attempts', attempts.toString());
            errorMsg.textContent = 'PIN Incorrecto';
            errorMsg.style.display = 'block';
            pinInput.value = '';
            if (attempts >= MAX_ATTEMPTS) {
                lockedUntil = Date.now() + COOLDOWN_MS;
                sessionStorage.setItem('locked_until', lockedUntil.toString());
                errorMsg.textContent = `Demasiados intentos. Bloqueado 30s.`;
                attempts = 0;
                sessionStorage.setItem('login_attempts', '0');
            }
            updateAttemptsDisplay();
            setTimeout(() => { errorMsg.style.display = 'none'; }, 3000);
        }
    }

    function updateAttemptsDisplay() {
        if (attemptsMsg && attempts > 0) attemptsMsg.textContent = `Intento ${attempts}/${MAX_ATTEMPTS}`;
    }

    loginBtn.addEventListener('click', handleLogin);
    pinInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('admin_auth');
        location.reload();
    });

    function showDashboard() {
        loginOverlay.style.display = 'none';
        adminContent.style.display = 'block';
        fetchStats();
        renderAdminAnnouncements();
        renderAdminCalendarEvents();
        renderChart();
    }

    // Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCjcmnvfeRoHz-m9xaA-0ExY2pgv30XwB8",
        authDomain: "estadisticas-pagina-consejo.firebaseapp.com",
        projectId: "estadisticas-pagina-consejo",
        storageBucket: "estadisticas-pagina-consejo.firebasestorage.app",
        messagingSenderId: "385511609503",
        appId: "1:385511609503:web:2cf5d4304285e5719bfeaa",
        databaseURL: "https://estadisticas-pagina-consejo-default-rtdb.firebaseio.com"
    };
    let db = null;
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    } catch (e) { console.debug('Firebase init skipped'); }

    const displays = {
        visits: document.getElementById('stat-visits'),
        parciales: document.getElementById('stat-parciales'),
        pqrs: document.getElementById('stat-pqrs'),
        calculator: document.getElementById('stat-calculator')
    };

    function fetchStats() {
        Object.values(displays).forEach(d => { if (d) d.textContent = '...'; });
        if (!db) {
            // Use localStorage fallback
            Object.values(displays).forEach(d => { if (d) d.textContent = '0'; });
            return;
        }
        db.ref('stats').on('value', snapshot => {
            const data = snapshot.val() || {};
            if (displays.visits) displays.visits.textContent = (data.visits || 0).toLocaleString();
            if (displays.parciales) displays.parciales.textContent = (data.parciales_clicks || 0).toLocaleString();
            if (displays.pqrs) displays.pqrs.textContent = (data.pqrs_clicks || 0).toLocaleString();
            if (displays.calculator) displays.calculator.textContent = (data.calculator_uses || 0).toLocaleString();
        }, error => {
            console.error('Stats error:', error);
            Object.values(displays).forEach(d => { if (d) d.textContent = '---'; });
        });
    }

    // Refresh
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        if (db) { db.ref('stats').off(); fetchStats(); }
        renderAdminAnnouncements();
        renderAdminCalendarEvents();
        renderChart();
    });

    // Reset
    const resetBtn = document.getElementById('btn-reset-stats');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (!confirm('¿Borrar TODAS las estadísticas? No se puede deshacer.')) return;
        if (db) {
            db.ref('stats').set({ visits: 0, parciales_clicks: 0, pqrs_clicks: 0, calculator_uses: 0 })
                .then(() => alert('Estadísticas reseteadas.'))
                .catch(err => alert('Error: ' + err.message));
        }
    });

    // Export CSV
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        const v = displays.visits ? displays.visits.textContent : '0';
        const p = displays.parciales ? displays.parciales.textContent : '0';
        const q = displays.pqrs ? displays.pqrs.textContent : '0';
        const c = displays.calculator ? displays.calculator.textContent : '0';
        const csv = `Métrica,Valor\nVisitas Totales,${v}\nClics Parciales,${p}\nClics PQRS,${q}\nUso Calculadora,${c}\nFecha Exportación,${new Date().toLocaleString('es-CO')}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `stats_consejo_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    });

    // Chart
    function renderChart() {
        const canvas = document.getElementById('visits-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const width = canvas.offsetWidth, height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);

        // Simulated last 7 days data (would come from Firebase daily logs in production)
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }));
        }
        const values = [12, 18, 15, 22, 28, 20, 25]; // Mock data
        const max = Math.max(...values) * 1.2;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Grid lines
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter';
            ctx.fillText(Math.round(max - (max / 4) * i), 5, y + 4);
        }

        // Gradient
        const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        grad.addColorStop(0, 'rgba(201,162,39,.3)');
        grad.addColorStop(1, 'rgba(201,162,39,.02)');

        // Area
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        values.forEach((v, i) => {
            const x = padding.left + (chartW / (values.length - 1)) * i;
            const y = padding.top + chartH - (v / max) * chartH;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding.left + chartW, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        values.forEach((v, i) => {
            const x = padding.left + (chartW / (values.length - 1)) * i;
            const y = padding.top + chartH - (v / max) * chartH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dots + Labels
        values.forEach((v, i) => {
            const x = padding.left + (chartW / (values.length - 1)) * i;
            const y = padding.top + chartH - (v / max) * chartH;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#c9a227'; ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#64748b'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
            ctx.fillText(days[i], x, height - padding.bottom + 18);
        });
    }

    // Admin Announcements
    function renderAdminAnnouncements() {
        const container = document.getElementById('admin-announcements');
        if (!container) return;
        const anns = JSON.parse(localStorage.getItem('announcements') || '[]');
        if (anns.length === 0) { container.innerHTML = '<p style="color:var(--text-gray);text-align:center;padding:1rem">No hay anuncios. Publícalos desde la página principal.</p>'; return; }
        container.innerHTML = anns.map((a, i) => `<div class="ann-manage-item">
            <div><strong>${a.pinned ? '📌 ' : ''}${a.title}</strong><br><span style="font-size:.8rem;color:var(--text-gray)">${new Date(a.date).toLocaleDateString('es-CO')}</span></div>
            <button onclick="deleteAnnouncement(${i})" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>`).join('');
    }

    window.deleteAnnouncement = function(idx) {
        if (!confirm('¿Eliminar este anuncio?')) return;
        const anns = JSON.parse(localStorage.getItem('announcements') || '[]');
        anns.splice(idx, 1);
        localStorage.setItem('announcements', JSON.stringify(anns));
        renderAdminAnnouncements();
    };

    // Admin Calendar Events
    function renderAdminCalendarEvents() {
        const container = document.getElementById('admin-calendar-events');
        if (!container) return;
        const events = JSON.parse(localStorage.getItem('custom_calendar_events') || '[]');
        if (events.length === 0) { container.innerHTML = '<p style="color:var(--text-gray);text-align:center;padding:1rem">No hay eventos personalizados. Agrégalos desde la página principal.</p>'; return; }
        container.innerHTML = events.map((e, i) => `<div class="ann-manage-item">
            <div><strong>${e.title}</strong><br><span style="font-size:.8rem;color:var(--text-gray)">${new Date(e.date).toLocaleDateString('es-CO')}</span></div>
            <button onclick="deleteCalendarEvent(${i})" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>`).join('');
    }

    window.deleteCalendarEvent = function(idx) {
        if (!confirm('¿Eliminar este evento?')) return;
        const events = JSON.parse(localStorage.getItem('custom_calendar_events') || '[]');
        events.splice(idx, 1);
        localStorage.setItem('custom_calendar_events', JSON.stringify(events));
        renderAdminCalendarEvents();
    };
});
