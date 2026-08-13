/**
 * Economic Indicators Module
 * Fetches live data from datos.gov.co and renders sparklines
 * Consejo de Economía — Universidad de Cartagena
 */

const EconIndicators = (() => {
    const CACHE_KEY = 'econ_indicators_cache_v3';
    const CACHE_TTL = 3600000; // 1 hour

    // Fallback data if API fails
    const FALLBACK = {
        trm: { value: 4250, change: 0.3, trend: [4100, 4150, 4180, 4200, 4220, 4250], labels: ['1 ago 2026', '2 ago 2026', '3 ago 2026', '4 ago 2026', '5 ago 2026', '6 ago 2026'] },
        ipc: { value: 6.03, change: -0.11, trend: [7.2, 7.0, 6.8, 6.4, 6.14, 6.03], labels: ['feb 2026', 'mar 2026', 'abr 2026', 'may 2026', 'jun 2026', 'jul 2026'] },
        desempleo: { value: 9.5, change: 0.4, trend: [10.2, 9.8, 9.6, 9.4, 9.1, 9.5], labels: ['feb 2026', 'mar 2026', 'abr 2026', 'may 2026', 'jun 2026', 'jul 2026'] },
        pib: { value: 2.1, change: 0.4, trend: [1.1, 1.2, 1.3, 1.4, 1.7, 2.1], labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'] },
        tasaBanrep: { value: 12.00, change: 0.00, trend: [13.25, 13.00, 12.75, 12.25, 12.00, 12.00], labels: ['feb 2026', 'mar 2026', 'abr 2026', 'may 2026', 'jun 2026', 'jul 2026'] }
    };

    function getCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
            return parsed.data;
        } catch { return null; }
    }

    function setCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        } catch { /* quota exceeded */ }
    }

    async function fetchTRM() {
        try {
            const res = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=7&$order=vigenciahasta%20DESC');
            if (!res.ok) throw new Error('TRM API error');
            const data = await res.json();
            if (data.length > 0) {
                const values = data.map(d => parseFloat(d.valor)).reverse();
                const labels = data.map(d => {
                    const date = new Date(d.vigenciahasta);
                    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
                }).reverse();
                const current = values[values.length - 1];
                const prev = values.length > 1 ? values[values.length - 2] : current;
                return { value: current, change: ((current - prev) / prev * 100), trend: values, labels: labels };
            }
        } catch (e) { console.debug('TRM fetch failed:', e); }
        return null;
    }

    async function fetchAll() {
        const cached = getCache();
        if (cached) return cached;

        const trm = await fetchTRM();
        const result = { ...FALLBACK };
        if (trm) result.trm = trm;

        setCache(result);
        return result;
    }

    // Mini sparkline using Canvas
    function renderSparkline(canvas, data, color = '#c9a227') {
        if (!canvas || !data || data.length < 2) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const step = width / (data.length - 1);

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '05');

        ctx.beginPath();
        ctx.moveTo(0, height);
        data.forEach((val, i) => {
            const x = i * step;
            const y = height - ((val - min) / range) * (height * 0.8) - height * 0.1;
            if (i === 0) ctx.lineTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = i * step;
            const y = height - ((val - min) / range) * (height * 0.8) - height * 0.1;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // End dot
        const lastX = (data.length - 1) * step;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height * 0.8) - height * 0.1;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function formatCurrency(val) {
        return '$' + Math.round(val).toLocaleString('es-CO');
    }

    function formatPercent(val) {
        return val.toFixed(2) + '%';
    }

    return { fetchAll, renderSparkline, formatCurrency, formatPercent, FALLBACK };
})();

window.EconIndicators = EconIndicators;
