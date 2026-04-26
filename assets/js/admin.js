document.addEventListener('DOMContentLoaded', () => {
    const STATS_NAMESPACE = 'cee-unicartagena';
    const CORRECT_PIN = '2026';
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminContent = document.getElementById('admin-content');
    const pinInput = document.getElementById('admin-pin');
    const loginBtn = document.getElementById('btn-login');
    const errorMsg = document.getElementById('login-error');
    
    const visitsDisplay = document.getElementById('stat-visits');
    const parcialesDisplay = document.getElementById('stat-parciales');
    const pqrsDisplay = document.getElementById('stat-pqrs');
    const refreshBtn = document.getElementById('btn-refresh');

    // 1. Check if already logged in (session-like)
    if (sessionStorage.getItem('admin_auth') === 'true') {
        showDashboard();
    }

    // 2. Login Logic
    function handleLogin() {
        if (pinInput.value === CORRECT_PIN) {
            sessionStorage.setItem('admin_auth', 'true');
            showDashboard();
        } else {
            errorMsg.style.display = 'block';
            pinInput.value = '';
            setTimeout(() => { errorMsg.style.display = 'none'; }, 2000);
        }
    }

    loginBtn.addEventListener('click', handleLogin);
    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    function showDashboard() {
        loginOverlay.style.display = 'none';
        adminContent.style.display = 'block';
        fetchStats();
    }

    // 3. Fetch Stats Logic
    async function fetchStats() {
        visitsDisplay.textContent = '...';
        parcialesDisplay.textContent = '...';
        pqrsDisplay.textContent = '...';

        try {
            const keys = ['visits', 'parciales_clicks', 'pqrs_clicks'];
            const results = await Promise.all(keys.map(key => 
                fetch(`https://api.counterapi.dev/v1/${STATS_NAMESPACE}/${key}`).then(res => res.json())
            ));

            visitsDisplay.textContent = results[0].count || 0;
            parcialesDisplay.textContent = results[1].count || 0;
            pqrsDisplay.textContent = results[2].count || 0;

        } catch (error) {
            console.error('Error fetching stats:', error);
            alert('Error al conectar con la API de estadísticas.');
        }
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchStats);
    }
});
