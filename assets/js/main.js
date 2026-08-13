document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_PIN = "CoOcejoeconomi120ac?'1=+";

    // === 1. SCROLL REVEAL ANIMATION ===
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => revealObserver.observe(el));
    // Enable animations only after observer is ready
    requestAnimationFrame(() => document.body.classList.add('js-ready'));

    // === 2. NAVBAR SCROLL ===
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // === 3. HERO PARTICLES ===
    const particlesContainer = document.getElementById('hero-particles');
    if (particlesContainer) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'hero-particle';
            p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--tx:${(Math.random()-0.5)*200}px;--ty:${(Math.random()-0.5)*200}px;animation-delay:${Math.random()*8}s;animation-duration:${6+Math.random()*6}s;width:${2+Math.random()*4}px;height:${2+Math.random()*4}px`;
            particlesContainer.appendChild(p);
        }
    }

    // === 4. ECONOMIC TICKER ===
    const tickerTrack = document.getElementById('ticker-track');
    if (tickerTrack && typeof EconIndicators !== 'undefined') {
        EconIndicators.fetchAll().then(data => {
            const items = [
                { label: 'TRM (USD)', value: EconIndicators.formatCurrency(data.trm.value), change: data.trm.change },
                { label: 'IPC Anual', value: EconIndicators.formatPercent(data.ipc.value), change: data.ipc.change },
                { label: 'Desempleo', value: EconIndicators.formatPercent(data.desempleo.value), change: data.desempleo.change },
                { label: 'PIB', value: '+' + EconIndicators.formatPercent(data.pib.value), change: data.pib.change },
                { label: 'Tasa BanRep', value: EconIndicators.formatPercent(data.tasaBanrep.value), change: data.tasaBanrep.change }
            ];
            let html = '';
            // Duplicate for infinite scroll
            for (let s = 0; s < 2; s++) {
                items.forEach(item => {
                    const cls = item.change >= 0 ? 'text-success' : 'text-danger';
                    const icon = item.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                    html += `<span class="ticker-item">${item.label}: <strong>${item.value}</strong> <i class="fas ${icon} ${cls}"></i></span>`;
                });
            }
            tickerTrack.innerHTML = html;
        });
    }

    // === 5. INDICATORS DASHBOARD ===
    const indicatorsGrid = document.getElementById('indicators-grid');
    const indicatorDescriptions = {
        trm: { name: 'Tasa Representativa del Mercado (TRM)', desc: 'Precio oficial del dólar en Colombia. Publicada diariamente por la Superintendencia Financiera. Es fundamental para comercio exterior, deuda externa e inversión extranjera.', source: 'Superintendencia Financiera de Colombia', unit: 'COP por 1 USD' },
        ipc: { name: 'Índice de Precios al Consumidor (IPC)', desc: 'Mide la variación porcentual del costo de una canasta representativa de bienes y servicios que consume la población. Es el indicador más usado para medir inflación.', source: 'DANE', unit: 'Variación anual %' },
        desempleo: { name: 'Tasa de Desempleo', desc: 'Porcentaje de la población económicamente activa que se encuentra buscando empleo sin conseguirlo. Se mide con la Gran Encuesta Integrada de Hogares (GEIH).', source: 'DANE - GEIH', unit: '% de la PEA' },
        pib: { name: 'Crecimiento del PIB', desc: 'Variación porcentual del Producto Interno Bruto, que mide el valor total de bienes y servicios producidos en el país. Es la medida más amplia de actividad económica.', source: 'DANE - Cuentas Nacionales', unit: 'Variación trimestral anualizada %' },
        tasaBanrep: { name: 'Tasa de Política Monetaria', desc: 'Tasa de interés de referencia del Banco de la República. Es el principal instrumento de política monetaria para controlar la inflación y estabilizar la economía.', source: 'Banco de la República', unit: '% efectivo anual' }
    };
    if (indicatorsGrid && typeof EconIndicators !== 'undefined') {
        EconIndicators.fetchAll().then(data => {
            const cards = [
                { key: 'trm', label: 'TRM (USD/COP)', format: 'currency', color: '#c9a227' },
                { key: 'ipc', label: 'IPC Anual', format: 'percent', color: '#3b82f6' },
                { key: 'desempleo', label: 'Tasa Desempleo', format: 'percent', color: '#ef4444' },
                { key: 'pib', label: 'Crecimiento PIB', format: 'percent', color: '#22c55e' },
                { key: 'tasaBanrep', label: 'Tasa Política BanRep', format: 'percent', color: '#8b5cf6' }
            ];
            indicatorsGrid.innerHTML = cards.map(c => {
                const d = data[c.key];
                const val = c.format === 'currency' ? EconIndicators.formatCurrency(d.value) : EconIndicators.formatPercent(d.value);
                const changeClass = d.change >= 0 ? 'up' : 'down';
                const changeIcon = d.change >= 0 ? '▲' : '▼';
                return `<div class="indicator-card reveal-scale" data-key="${c.key}" style="cursor:pointer" title="Click para ver datos históricos">
                    <div class="indicator-label">${c.label}</div>
                    <div class="indicator-value" style="color:${c.color}">${val}</div>
                    <div class="indicator-change ${changeClass}">${changeIcon} ${Math.abs(d.change).toFixed(2)}%</div>
                    <canvas class="indicator-sparkline" data-values='${JSON.stringify(d.trend)}' data-color="${c.color}"></canvas>
                    <div style="font-size:.7rem;color:rgba(0,0,0,.35);margin-top:.3rem;text-align:center"><i class="fas fa-chart-bar"></i> Click para histórico</div>
                </div>`;
            }).join('');
            // Render sparklines
            document.querySelectorAll('.indicator-sparkline').forEach(canvas => {
                const values = JSON.parse(canvas.dataset.values);
                const color = canvas.dataset.color;
                setTimeout(() => EconIndicators.renderSparkline(canvas, values, color), 100);
            });
            // Re-observe new reveals
            document.querySelectorAll('.reveal-scale:not(.visible)').forEach(el => revealObserver.observe(el));
            // Click handler for indicator details
            document.querySelectorAll('.indicator-card[data-key]').forEach(card => {
                card.addEventListener('click', () => {
                    const key = card.dataset.key;
                    const info = indicatorDescriptions[key];
                    const d = data[key];
                    const modal = document.getElementById('indicator-modal');
                    const title = document.getElementById('indicator-modal-title');
                    const body = document.getElementById('indicator-modal-body');
                    title.textContent = info.name;
                    body.innerHTML = `
                        <p style="color:var(--text-gray);line-height:1.7;margin-bottom:1.5rem">${info.desc}</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
                            <div style="background:var(--bg-offset);padding:1rem;border-radius:var(--radius-sm)">
                                <div style="font-size:.8rem;color:var(--text-gray);text-transform:uppercase;letter-spacing:1px">Valor Actual</div>
                                <div style="font-size:1.6rem;font-weight:700;color:var(--primary);font-family:'JetBrains Mono',monospace">${card.querySelector('.indicator-value').textContent}</div>
                            </div>
                            <div style="background:var(--bg-offset);padding:1rem;border-radius:var(--radius-sm)">
                                <div style="font-size:.8rem;color:var(--text-gray);text-transform:uppercase;letter-spacing:1px">Variación</div>
                                <div style="font-size:1.6rem;font-weight:700;color:${d.change >= 0 ? '#22c55e' : '#ef4444'};font-family:'JetBrains Mono',monospace">${d.change >= 0 ? '+' : ''}${d.change.toFixed(2)}%</div>
                            </div>
                        </div>
                        <h4 style="margin-bottom:.8rem;font-size:1rem"><i class="fas fa-chart-line" style="color:var(--gold)"></i> Tendencia Histórica</h4>
                        <canvas id="indicator-detail-chart" style="width:100%;height:180px"></canvas>
                        <div style="display:grid;grid-template-columns:repeat(${d.trend.length}, 1fr);gap:0;text-align:center;margin-top:.5rem;font-size:.75rem;color:var(--text-gray);font-family:'JetBrains Mono',monospace">
                            ${d.trend.map((v, i) => `<div>
                                <div>${typeof v === 'number' && v > 100 ? Math.round(v).toLocaleString('es-CO') : v.toFixed(2)}</div>
                                ${d.labels && d.labels[i] ? `<div style="font-size:.65rem;opacity:0.7;margin-top:2px">${d.labels[i]}</div>` : ''}
                            </div>`).join('')}
                        </div>
                        <div style="margin-top:1.5rem;padding:1rem;background:var(--bg-offset);border-radius:var(--radius-sm);font-size:.85rem;color:var(--text-gray)">
                            <p><strong>Fuente:</strong> ${info.source}</p>
                            <p><strong>Unidad:</strong> ${info.unit}</p>
                        </div>`;
                    modal.style.display = 'flex';
                    // Render large chart using direct canvas drawing (not sparkline which depends on offsetWidth)
                    setTimeout(() => {
                        const canvas = document.getElementById('indicator-detail-chart');
                        if (!canvas || !d.trend || d.trend.length < 2) return;
                        // Use the card's data-key to get the original hex color from the cards definition
                        const colorMap = {trm:'#c9a227',ipc:'#3b82f6',desempleo:'#ef4444',pib:'#22c55e',tasaBanrep:'#8b5cf6'};
                        const color = colorMap[key] || '#c9a227';
                        const W = 560, H = 180;
                        const dpr = window.devicePixelRatio || 1;
                        canvas.width = W * dpr;
                        canvas.height = H * dpr;
                        canvas.style.width = W + 'px';
                        canvas.style.height = H + 'px';
                        const ctx = canvas.getContext('2d');
                        ctx.scale(dpr, dpr);
                        const data = d.trend;
                        const min = Math.min(...data);
                        const max = Math.max(...data);
                        const range = max - min || 1;
                        const step = W / (data.length - 1);
                        // Gradient fill (use hex + alpha)
                        const gradient = ctx.createLinearGradient(0, 0, 0, H);
                        gradient.addColorStop(0, color + '60');
                        gradient.addColorStop(1, color + '05');
                        ctx.beginPath();
                        ctx.moveTo(0, H);
                        data.forEach((val, i) => {
                            const x = i * step;
                            const y = H - ((val - min) / range) * (H * 0.7) - H * 0.12;
                            ctx.lineTo(x, y);
                        });
                        ctx.lineTo(W, H);
                        ctx.closePath();
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        // Line
                        ctx.beginPath();
                        data.forEach((val, i) => {
                            const x = i * step;
                            const y = H - ((val - min) / range) * (H * 0.7) - H * 0.12;
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        });
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.lineJoin = 'round';
                        ctx.stroke();
                        // Dots
                        data.forEach((val, i) => {
                            const x = i * step;
                            const y = H - ((val - min) / range) * (H * 0.7) - H * 0.12;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.fill();
                            ctx.strokeStyle = '#fff';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        });
                    }, 250);
                });
            });
        });
    }
    // Indicator modal close
    const indModal = document.getElementById('indicator-modal');
    const closeIndModal = document.getElementById('close-indicator-modal');
    if (closeIndModal) closeIndModal.addEventListener('click', () => { indModal.style.display = 'none'; });
    if (indModal) indModal.addEventListener('click', e => { if (e.target === indModal) indModal.style.display = 'none'; });

    // === 6. ANIMATED COUNTERS ===
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const increment = Math.max(1, Math.ceil(target / 60));
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = current.toLocaleString('es-CO');
                    if (target > 100) el.textContent += '+';
                }, 30);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.impact-number[data-target]').forEach(el => counterObserver.observe(el));

    // === 7. LIGHTBOX ===
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            lightboxImg.src = item.dataset.img;
            lightbox.classList.add('active');
        });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('active'); });

    // === 8. Q&A ===
    const qaData = [
        { question: "¿Cuáles son las materias con mayor nivel de prerrequisitos?", answer: "Las líneas más largas son Matemáticas e Inglés. Para cursar Econometría I (5to), debes haber aprobado Estadística II y Economía Matemática. Recomendamos no atrasarse en el área cuantitativa." },
        { question: "¿Cuántos niveles de inglés debo cursar?", answer: "El programa contempla 6 niveles de inglés obligatorios (I al VI). Cada uno es prerrequisito del siguiente." },
        { question: "¿Qué software se usa en la carrera?", answer: "Principalmente R, Stata y Python para econometría y analítica de datos. Excel avanzado para finanzas. También se trabaja con EViews y SPSS en algunas materias." },
        { question: "¿Puedo perder una materia por inasistencia?", answer: "Sí. Una inasistencia injustificada superior al 20% conlleva la pérdida de la asignatura con nota 0.0." },
        { question: "¿Qué es un modelo Probit y Logit?", answer: "Son modelos econométricos de elección discreta que se estudian en Econometría II. El Probit usa la distribución normal acumulada y el Logit la función logística para modelar probabilidades de variables binarias." },
        { question: "¿Qué son los MCO (Mínimos Cuadrados Ordinarios)?", answer: "Es el método fundamental de estimación en econometría, estudiado desde Econometría I. Busca minimizar la suma de los errores al cuadrado para encontrar la mejor línea de ajuste." }
    ];
    const qaContainer = document.getElementById('qa-container');
    if (qaContainer) {
        qaData.forEach(item => {
            const qaItem = document.createElement('div');
            qaItem.className = 'qa-item';
            qaItem.innerHTML = `<div class="qa-question"><h4>${item.question}</h4><i class="fas fa-plus"></i></div><div class="qa-answer"><p>${item.answer}</p></div>`;
            qaContainer.appendChild(qaItem);
            qaItem.querySelector('.qa-question').addEventListener('click', () => {
                const answer = qaItem.querySelector('.qa-answer');
                const icon = qaItem.querySelector('.qa-question i');
                const isOpen = answer.style.maxHeight;
                document.querySelectorAll('.qa-answer').forEach(a => a.style.maxHeight = null);
                document.querySelectorAll('.qa-question i').forEach(i => i.classList.replace('fa-minus', 'fa-plus'));
                if (!isOpen) { answer.style.maxHeight = answer.scrollHeight + 'px'; icon.classList.replace('fa-plus', 'fa-minus'); }
            });
        });
    }
    // === 9. CURRICULUM INTERACTION ===
    initCurriculumInteraction();
    initProfessorGrid();

    function initProfessorGrid() {
        const container = document.getElementById('professors-container');
        if (!container || typeof subjectData === 'undefined') return;
        const allProfs = new Set();
        Object.values(subjectData).forEach(data => { if (data.professors) data.professors.forEach(p => allProfs.add(p)); });
        Array.from(allProfs).sort().forEach(pName => {
            const card = document.createElement('div');
            card.className = 'professor-card';
            card.innerHTML = `<div class="prof-icon"><i class="fas fa-user-tie"></i></div><h4>${pName}</h4><p>Docente</p><div style="font-size:.75rem;color:var(--gold);margin-top:.5rem">Ver Materias <i class="fas fa-chevron-right"></i></div>`;
            card.addEventListener('click', () => showProfessorDetails(pName));
            container.appendChild(card);
        });
    }

    function showProfessorDetails(pName) {
        const taughtSubjects = [];
        Object.keys(subjectData).forEach(key => {
            const data = subjectData[key];
            if (data.professors && data.professors.includes(pName)) {
                const el = document.getElementById(key);
                const name = el ? el.innerText.split('\n')[0].trim() : key.toUpperCase();
                taughtSubjects.push({ name, code: data.code });
            }
        });
        const modal = document.getElementById('subject-modal');
        document.getElementById('modal-title').textContent = pName;
        document.getElementById('modal-code').textContent = 'Docente';
        document.getElementById('modal-credits').textContent = '';
        let html = '<ul style="list-style:none;padding:0">';
        taughtSubjects.forEach(s => { html += `<li style="margin-bottom:.5rem;border-bottom:1px solid #eee;padding-bottom:.25rem"><strong>${s.name}</strong> <span class="badge" style="font-size:.7em">${s.code}</span></li>`; });
        html += '</ul>';
        document.getElementById('modal-desc').innerHTML = `<p>Materias impartidas:</p>${html}`;
        document.getElementById('modal-prereqs').innerHTML = '';
        const profSection = document.getElementById('modal-profs-section');
        if (profSection) profSection.innerHTML = '';
        modal.style.display = 'flex';
    }

    function initCurriculumInteraction() {
        const cards = document.querySelectorAll('.subject-card');
        const modal = document.getElementById('subject-modal');
        const closeModalBtn = modal ? modal.querySelector('.close-modal') : null;
        if (!modal) return;
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; clearHighlights(); });
        modal.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; clearHighlights(); } });

        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (selectionMode) {
                    card.classList.toggle('selected');
                    const id = card.id;
                    if (selectedSubjects.has(id)) { selectedSubjects.delete(id); }
                    else {
                        const title = card.childNodes[0].textContent.trim();
                        const creditsBadge = card.querySelector('.badge');
                        const credits = creditsBadge ? creditsBadge.textContent.replace(/[^0-9]/g, '') : '0';
                        const code = (typeof subjectData !== 'undefined' && subjectData[id]) ? subjectData[id].code : '---';
                        card.dataset.selName = title; card.dataset.selCode = code; card.dataset.selCredits = credits;
                        selectedSubjects.add(id);
                    }
                    updateFloatingBar();
                    return;
                }
                const subjectId = card.id;
                const prereqs = card.dataset.prereqs ? card.dataset.prereqs.split(' ') : [];
                const description = card.dataset.desc || 'Información del plan de estudios.';
                const title = card.childNodes[0].textContent.trim();
                const credits = card.querySelector('.badge') ? card.querySelector('.badge').textContent : '';
                let realCode = '---', realProfs = [];
                if (typeof subjectData !== 'undefined' && subjectData[subjectId]) { realCode = subjectData[subjectId].code; realProfs = subjectData[subjectId].professors || []; }
                clearHighlights();
                document.body.classList.add('interacting');
                card.classList.add('highlight-active');
                const prereqNames = [];
                prereqs.forEach(pid => { const pCard = document.getElementById(pid); if (pCard) { pCard.classList.add('highlight-prereq'); prereqNames.push(pCard.childNodes[0].textContent.trim()); } });
                document.getElementById('modal-title').textContent = title;
                document.getElementById('modal-credits').textContent = credits;
                document.getElementById('modal-desc').textContent = description;
                document.getElementById('modal-code').textContent = realCode;
                const prereqList = document.getElementById('modal-prereqs');
                prereqList.innerHTML = '';
                let profSection = document.getElementById('modal-profs-section');
                if (!profSection) { profSection = document.createElement('div'); profSection.id = 'modal-profs-section'; profSection.className = 'modal-section'; document.getElementById('modal-desc').after(profSection); }
                profSection.innerHTML = realProfs.length > 0 ? `<h4><i class="fas fa-chalkboard-teacher"></i> Docente(s):</h4><p>${realProfs.join(', ')}</p>` : '';
                if (prereqNames.length > 0) { prereqNames.forEach(name => { const li = document.createElement('li'); li.textContent = name; prereqList.appendChild(li); }); }
                else { const li = document.createElement('li'); li.textContent = 'Ninguno'; prereqList.appendChild(li); }
                modal.style.display = 'flex';
            });
        });
    }

    function clearHighlights() {
        document.body.classList.remove('interacting');
        document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('highlight-active', 'highlight-prereq'));
    }

    // === 10. TABS ===
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // === 11. MOBILE MENU ===
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', e => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            });
        });
        document.addEventListener('click', e => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
            }
        });
    }

    // === 12. GRADE CALCULATOR ===
    const calcBtn = document.getElementById('btn-calculate');
    const resetBtn = document.getElementById('btn-reset');
    const display = document.getElementById('calc-display');
    const feedback = document.getElementById('calc-feedback');
    const resultBox = document.getElementById('calc-result-box');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const c1 = parseFloat(document.getElementById('note-c1').value);
            const c2 = parseFloat(document.getElementById('note-c2').value);
            const c3 = parseFloat(document.getElementById('note-c3').value);
            let target = parseFloat(document.getElementById('note-target').value);
            if (isNaN(target) || target <= 0) target = 3.0;
            if (!isNaN(c1) && isNaN(c2) && isNaN(c3)) {
                const needed = (target - c1 * 0.3) / 0.7;
                display.textContent = needed.toFixed(2);
                if (needed > 5.0) { display.style.color = '#ef4444'; feedback.innerHTML = `Necesitas promediar más de <b>5.0</b>. Imposible 😢`; resultBox.style.borderColor = '#ef4444'; }
                else { display.style.color = '#f59e0b'; feedback.innerHTML = `Necesitas promediar <b>${needed.toFixed(2)}</b> entre 2do y 3er corte para ${target}.`; resultBox.style.borderColor = '#f59e0b'; }
            } else if (!isNaN(c1) && !isNaN(c2) && isNaN(c3)) {
                const needed = (target - c1 * 0.3 - c2 * 0.3) / 0.4;
                display.textContent = needed.toFixed(2);
                if (needed > 5.0) { display.style.color = '#ef4444'; feedback.innerHTML = `Necesitas <b>${needed.toFixed(2)}</b> en el final. Imposible 😢`; resultBox.style.borderColor = '#ef4444'; }
                else if (needed < 0) { display.textContent = '0.0'; display.style.color = '#22c55e'; feedback.innerHTML = '¡Ya la pasaste! 🎉'; resultBox.style.borderColor = '#22c55e'; }
                else { display.style.color = '#f59e0b'; feedback.innerHTML = `Necesitas <b>${needed.toFixed(2)}</b> en el Tercer Corte para ${target}.`; resultBox.style.borderColor = '#f59e0b'; }
            } else if (!isNaN(c1) && !isNaN(c2) && !isNaN(c3)) {
                const final_ = c1 * 0.3 + c2 * 0.3 + c3 * 0.4;
                display.textContent = final_.toFixed(2);
                if (final_ >= target) { display.style.color = '#22c55e'; feedback.textContent = `¡Objetivo Cumplido! 🎉 (Meta: ${target})`; resultBox.style.borderColor = '#22c55e'; }
                else { display.style.color = '#ef4444'; feedback.textContent = `No alcanzaste el objetivo de ${target}. 😢`; resultBox.style.borderColor = '#ef4444'; }
            } else { feedback.textContent = 'Ingresa al menos la nota del Primer Corte.'; }
            trackStat('calculator_uses');
        });
        resetBtn.addEventListener('click', () => {
            ['note-c1','note-c2','note-c3'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('note-target').value = '3.0';
            display.textContent = '---'; display.style.color = 'var(--text-gray)';
            feedback.textContent = 'Ingresa tus notas para ver el resultado';
            resultBox.style.borderColor = 'rgba(0,0,0,.04)';
        });
    }

    // === 13. SCROLL TO TOP ===
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => { scrollBtn.classList.toggle('visible', window.scrollY > 300); });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // === 14. CURRICULUM SCROLL ARROWS ===
    const scrollLeftBtn = document.getElementById('scrollLeftBtn');
    const scrollRightBtn = document.getElementById('scrollRightBtn');
    const curriculumGrid = document.getElementById('curriculum-grid');
    if (scrollLeftBtn && scrollRightBtn && curriculumGrid) {
        scrollLeftBtn.addEventListener('click', () => curriculumGrid.scrollBy({ left: -350, behavior: 'smooth' }));
        scrollRightBtn.addEventListener('click', () => curriculumGrid.scrollBy({ left: 350, behavior: 'smooth' }));
    }

    // === 15. COPY CODE ===
    const copyBtn = document.getElementById('copy-code-btn');
    const codeBadge = document.getElementById('modal-code');
    if (copyBtn && codeBadge) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBadge.textContent).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');
                setTimeout(() => { copyBtn.innerHTML = '<i class="far fa-copy"></i>'; copyBtn.classList.remove('copied'); }, 2000);
            });
        });
    }
    // === 16. PREMATRICULA ===
    let selectionMode = false;
    const selectedSubjects = new Set();
    const toggleModeBtn = document.getElementById('toggle-selection-mode');
    const floatingBar = document.getElementById('prematricula-bar');
    const selectedCountSpan = document.getElementById('selected-count');
    const openFormBtn = document.getElementById('btn-open-form');
    const formModal = document.getElementById('prematricula-modal');
    const formClose = document.getElementById('close-prematricula');
    const form = document.getElementById('prematricula-form');
    const toast = document.getElementById('selection-toast');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const closeTutorialBtn = document.getElementById('btn-close-tutorial');

    if (closeTutorialBtn && tutorialOverlay) {
        closeTutorialBtn.addEventListener('click', () => { tutorialOverlay.classList.remove('visible'); localStorage.setItem('hasSeenTutorial', 'true'); });
        tutorialOverlay.addEventListener('click', e => { if (e.target === tutorialOverlay) { tutorialOverlay.classList.remove('visible'); localStorage.setItem('hasSeenTutorial', 'true'); } });
    }

    function enableSelectionMode() {
        selectionMode = true;
        toggleModeBtn.classList.add('active');
        toggleModeBtn.innerHTML = '<i class="fas fa-check-square"></i> Finalizar Selección';
        document.body.classList.add('selection-active');
        if (!localStorage.getItem('hasSeenTutorial') && tutorialOverlay) tutorialOverlay.classList.add('visible');
        else if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000); }
    }
    function disableSelectionMode() {
        selectionMode = false;
        if (toggleModeBtn) { toggleModeBtn.classList.remove('active'); toggleModeBtn.innerHTML = '<i class="far fa-square-check"></i> Generar Prematrícula'; }
        document.body.classList.remove('selection-active');
        if (floatingBar) floatingBar.classList.remove('visible');
        selectedSubjects.clear();
        document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('selected'));
        if (selectedCountSpan) selectedCountSpan.textContent = '0 materias seleccionadas';
        if (toast) toast.classList.remove('show');
    }
    if (toggleModeBtn) toggleModeBtn.addEventListener('click', () => { selectionMode ? disableSelectionMode() : enableSelectionMode(); });
    function updateFloatingBar() {
        if (selectedSubjects.size > 0) { floatingBar.classList.add('visible'); selectedCountSpan.textContent = `${selectedSubjects.size} materias seleccionadas`; }
        else floatingBar.classList.remove('visible');
    }
    const cancelBtn = document.getElementById('btn-cancel-selection');
    if (cancelBtn) cancelBtn.addEventListener('click', () => disableSelectionMode());
    if (openFormBtn) openFormBtn.addEventListener('click', () => { formModal.style.display = 'flex'; });
    if (formClose) formClose.addEventListener('click', () => { formModal.style.display = 'none'; });
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const user = { apellido: document.getElementById('pm-apellidos').value.toUpperCase(), nombre: document.getElementById('pm-nombres').value.toUpperCase(), codigo: document.getElementById('pm-codigo').value, celular: document.getElementById('pm-celular').value };
            generateExcel(user);
            formModal.style.display = 'none';
        });
    }
    async function generateExcel(user) {
        try {
            if (typeof XLSX === 'undefined') { alert('Error: Librería de Excel no cargada.'); return; }
            const response = await fetch('resources/FORMATO DE PREMATRICULA PARA EL PERIODO 2026-01.xlsx');
            if (!response.ok) throw new Error('No se pudo cargar el formato.');
            const ab = await response.arrayBuffer();
            const wb = XLSX.read(ab, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            function updateCell(c, r, v) { const ref = XLSX.utils.encode_cell({ c, r }); if (!ws[ref]) ws[ref] = { t: 's', v: '' }; ws[ref].v = v; }
            updateCell(2, 2, user.apellido); updateCell(2, 3, user.nombre); updateCell(3, 4, user.codigo); updateCell(3, 5, user.celular);
            let rowIdx = 8;
            selectedSubjects.forEach(id => {
                const card = document.getElementById(id);
                updateCell(2, rowIdx, card.dataset.selName); updateCell(3, rowIdx, card.dataset.selCode); updateCell(5, rowIdx, parseInt(card.dataset.selCredits));
                rowIdx++;
            });
            XLSX.writeFile(wb, `Prematricula_${user.apellido}_2026.xlsx`);
            disableSelectionMode();
        } catch (err) {
            console.error(err);
            alert('Error generando el archivo. Si estás en local, necesitas un servidor (GitHub Pages).');
            disableSelectionMode(); formModal.style.display = 'none';
        }
    }

    // === 17. CALENDAR ===
    const timelineTrackEl = document.getElementById('timeline-track');
    const countdownContainer = document.getElementById('calendar-countdown');
    const nextEventLabel = document.getElementById('next-event-name');
    const defaultEvents = [
        { title: "Límite Matrícula Ordinaria", date: "2026-02-11T12:00:00", icon: "fa-money-bill-wave" },
        { title: "Inicio de Clases", date: "2026-02-16T12:00:00", icon: "fa-chalkboard-teacher" },
        { title: "Parciales 1er Corte", date: "2026-03-24T12:00:00", icon: "fa-edit" },
        { title: "Supletorios 1er Corte", date: "2026-04-13T12:00:00", icon: "fa-user-clock" },
        { title: "Parciales 2do Corte", date: "2026-05-04T12:00:00", icon: "fa-file-alt" },
        { title: "Supletorios 2do Corte", date: "2026-05-18T12:00:00", icon: "fa-history" },
        { title: "Parciales Finales", date: "2026-06-16T12:00:00", icon: "fa-flag-checkered" },
        { title: "Supletorios Finales", date: "2026-06-29T12:00:00", icon: "fa-user-clock" },
        { title: "Habilitaciones", date: "2026-07-07T12:00:00", icon: "fa-skull-crossbones" },
        { title: "Cierre Semestre", date: "2026-07-15T12:00:00", icon: "fa-door-closed" }
    ];

    function getCalendarEvents() {
        const custom = JSON.parse(localStorage.getItem('custom_calendar_events') || '[]');
        return [...defaultEvents, ...custom].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    function renderCalendar() {
        if (!timelineTrackEl || !countdownContainer) return;
        const events = getCalendarEvents();
        const today = new Date();
        let nextEvent = null;
        timelineTrackEl.innerHTML = '';
        events.forEach(evt => {
            const evtDate = new Date(evt.date);
            const isPast = evtDate < today;
            if (!nextEvent && !isPast) nextEvent = evt;
            const item = document.createElement('div');
            item.className = `timeline-item ${isPast ? 'past-event' : ''} ${!isPast && evt === nextEvent ? 'active-event' : ''}`;
            item.innerHTML = `<span class="timeline-date">${evtDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span><span class="timeline-title">${evt.title}</span>`;
            timelineTrackEl.appendChild(item);
        });
        if (nextEvent) {
            nextEventLabel.textContent = `Para: ${nextEvent.title}`;
            updateCountdown(nextEvent.date);
            setInterval(() => updateCountdown(nextEvent.date), 60000);
        } else {
            nextEventLabel.textContent = 'Semestre Finalizado';
            countdownContainer.innerHTML = '00 días';
        }
    }
    function updateCountdown(targetStr) {
        const diff = new Date(targetStr).getTime() - Date.now();
        if (diff < 0) { countdownContainer.innerHTML = '00 d 00 h'; return; }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        countdownContainer.innerHTML = `<span class="days">${days}</span> días <span class="hours">${hours}</span> hrs`;
    }
    renderCalendar();

    // Calendar add event
    const btnAddCalEvent = document.getElementById('btn-add-calendar-event');
    const calModal = document.getElementById('calendar-modal');
    const closeCalModal = document.getElementById('close-calendar-modal');
    const calForm = document.getElementById('calendar-form');
    if (btnAddCalEvent) btnAddCalEvent.addEventListener('click', () => { calModal.style.display = 'flex'; });
    if (closeCalModal) closeCalModal.addEventListener('click', () => { calModal.style.display = 'none'; });
    if (calModal) calModal.addEventListener('click', e => { if (e.target === calModal) calModal.style.display = 'none'; });
    if (calForm) {
        calForm.addEventListener('submit', e => {
            e.preventDefault();
            if (document.getElementById('cal-password').value !== ADMIN_PIN) { alert('Contraseña incorrecta'); return; }
            const events = JSON.parse(localStorage.getItem('custom_calendar_events') || '[]');
            events.push({ title: document.getElementById('cal-title').value, date: document.getElementById('cal-date').value + 'T12:00:00', icon: document.getElementById('cal-icon').value });
            localStorage.setItem('custom_calendar_events', JSON.stringify(events));
            calForm.reset(); calModal.style.display = 'none'; renderCalendar();
            alert('✅ Evento agregado al calendario');
        });
    }

    // === 18. ANNOUNCEMENTS ===
    function getAnnouncements() {
        return JSON.parse(localStorage.getItem('announcements') || '[]').sort((a, b) => {
            if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });
    }
    function renderAnnouncements() {
        const feed = document.getElementById('announcements-feed');
        if (!feed) return;
        const anns = getAnnouncements();
        if (anns.length === 0) {
            feed.innerHTML = '<div class="empty-announcements"><i class="fas fa-bullhorn" style="font-size:2rem;color:var(--gold);margin-bottom:1rem;display:block"></i><p>No hay anuncios publicados aún.</p></div>';
            return;
        }
        feed.innerHTML = anns.map((a, i) => `<div class="announcement-card ${a.pinned ? 'pinned' : ''}" style="position:relative">
            <button onclick="deleteAnnouncement(${a.id})" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--text-light);cursor:pointer;font-size:1.1rem" title="Borrar Anuncio"><i class="fas fa-trash-alt"></i></button>
            ${a.pinned ? '<div class="announcement-badge">📌 Fijado</div>' : ''}
            <div class="announcement-date">${new Date(a.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div class="announcement-title">${a.title}</div>
            ${a.imageUrl ? `<img src="${a.imageUrl}" style="max-width:100%;border-radius:var(--radius-sm);margin-top:1rem;margin-bottom:1rem;display:block" alt="Anuncio imagen">` : ''}
            <div class="announcement-body">${a.body}</div>
            ${a.linkUrl ? `<a href="${a.linkUrl}" target="_blank" class="btn btn-outline" style="margin-top:1rem;font-size:.8rem;padding:.4rem 1rem">Ver Más <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>`).join('');
    }
    renderAnnouncements();

    const btnAddAnn = document.getElementById('btn-add-announcement');
    const annModal = document.getElementById('announcement-modal');
    const closeAnnModal = document.getElementById('close-announcement-modal');
    const annForm = document.getElementById('announcement-form');
    if (btnAddAnn) btnAddAnn.addEventListener('click', () => { annModal.style.display = 'flex'; });
    if (closeAnnModal) closeAnnModal.addEventListener('click', () => { annModal.style.display = 'none'; });
    if (annModal) annModal.addEventListener('click', e => { if (e.target === annModal) annModal.style.display = 'none'; });
    window.deleteAnnouncement = function(id) {
        const pin = prompt('Ingrese PIN de Administrador para borrar este anuncio:');
        if (pin !== ADMIN_PIN) {
            if (pin !== null) alert('Contraseña incorrecta');
            return;
        }
        let anns = getAnnouncements();
        anns = anns.filter(a => a.id !== id);
        localStorage.setItem('announcements', JSON.stringify(anns));
        renderAnnouncements();
    };

    if (annForm) {
        annForm.addEventListener('submit', e => {
            e.preventDefault();
            if (document.getElementById('ann-password').value !== ADMIN_PIN) { alert('Contraseña incorrecta'); return; }
            
            const title = document.getElementById('ann-title').value;
            const body = document.getElementById('ann-body').value;
            const pinned = document.getElementById('ann-pinned').checked;
            const linkInput = document.getElementById('ann-link');
            const linkUrl = linkInput ? linkInput.value : '';
            
            const fileInput = document.getElementById('ann-image');
            const file = fileInput && fileInput.files[0];
            
            const saveAnn = (imageUrl) => {
                const anns = getAnnouncements();
                anns.push({ 
                    id: Date.now(),
                    title, body, pinned, imageUrl, linkUrl,
                    date: new Date().toISOString() 
                });
                try {
                    localStorage.setItem('announcements', JSON.stringify(anns));
                    annForm.reset(); annModal.style.display = 'none'; renderAnnouncements();
                    alert('✅ Anuncio publicado exitosamente');
                } catch(err) {
                    alert('Error: La imagen sigue siendo muy pesada o el almacenamiento está lleno. Intenta con una imagen más pequeña o borra anuncios antiguos.');
                }
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let w = img.width, h = img.height;
                        if (w > 800) { h = h * (800 / w); w = 800; }
                        canvas.width = w; canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                        saveAnn(dataUrl);
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                saveAnn('');
            }
        });
    }

    // === 19. ECONOMETRICS TOOL MODALS ===
    const toolModal = document.getElementById('tool-modal');
    const closeToolModal = document.getElementById('close-tool-modal');
    const toolContent = document.getElementById('tool-modal-content');
    if (closeToolModal) closeToolModal.addEventListener('click', () => { toolModal.style.display = 'none'; });
    if (toolModal) toolModal.addEventListener('click', e => { if (e.target === toolModal) toolModal.style.display = 'none'; });

    const toolTemplates = {
        'tool-ols': { title: 'Simulador OLS (MCO)', html: `<h3>Regresión por Mínimos Cuadrados Ordinarios</h3><p style="color:var(--text-gray);margin:1rem 0">Ingresa pares de datos (X, Y) separados por coma, uno por línea.</p><textarea id="ols-data" class="form-control" rows="6" placeholder="1, 2.5\n2, 4.1\n3, 5.8\n4, 7.2\n5, 9.0" style="font-family:'JetBrains Mono',monospace;font-size:.9rem;resize:vertical"></textarea><button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="runOLS()">Estimar Modelo</button><div id="ols-results" style="margin-top:1.5rem"></div>` },
        'tool-probit': { title: 'Modelos Probit & Logit', html: `<h3>Visualización Probit vs Logit</h3><p style="color:var(--text-gray);margin:1rem 0">Compara las funciones de distribución acumulada.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0"><div><label style="font-weight:600;font-size:.85rem">Media (μ)</label><input type="number" id="pl-mean" class="form-control" value="0" step="0.1"></div><div><label style="font-weight:600;font-size:.85rem">Desv. Estándar (σ)</label><input type="number" id="pl-sd" class="form-control" value="1" step="0.1" min="0.1"></div></div><canvas id="probit-canvas" style="width:100%;height:250px;margin-top:1rem"></canvas><button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="drawProbitLogit()">Graficar</button><div style="margin-top:1rem;font-size:.85rem;color:var(--text-gray)"><p><strong>Probit:</strong> Φ(x) = CDF Normal estándar</p><p><strong>Logit:</strong> Λ(x) = 1/(1+e⁻ˣ)</p></div>` },
        'tool-distributions': { title: 'Distribuciones Estadísticas', html: `<h3>Calculadora de Distribuciones</h3><div style="margin:1rem 0"><label style="font-weight:600;font-size:.85rem">Distribución</label><select id="dist-type" class="form-control"><option value="normal">Normal (Z)</option><option value="t">t-Student</option><option value="chi2">Chi-cuadrado</option></select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="font-weight:600;font-size:.85rem">Valor</label><input type="number" id="dist-value" class="form-control" value="1.96" step="0.01"></div><div><label style="font-weight:600;font-size:.85rem">GL (si aplica)</label><input type="number" id="dist-df" class="form-control" value="30" min="1"></div></div><button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="calcDistribution()">Calcular</button><canvas id="dist-canvas" width="400" height="200" style="width:100%;height:auto;margin-top:1.5rem;background:transparent;display:none;"></canvas><div id="dist-results" style="margin-top:1rem"></div>` },
        'tool-references': { title: 'Cheat Sheets', html: `<h3>Guías Rápidas de Software</h3><div class="tabs" style="margin:1.5rem 0"><button class="tab-btn active" onclick="showCheat('r')">R</button><button class="tab-btn" onclick="showCheat('stata')">Stata</button><button class="tab-btn" onclick="showCheat('python')">Python</button></div><div id="cheat-content" style="background:var(--primary);color:#e2e8f0;padding:1.5rem;border-radius:var(--radius-sm);font-family:'JetBrains Mono',monospace;font-size:.82rem;white-space:pre-wrap;max-height:400px;overflow-y:auto"></div>` },
        'tool-concepts': { title: 'Glosario Económico', html: `<h3>Conceptos Clave</h3><input type="text" id="glossary-search" class="form-control" placeholder="Buscar concepto..." style="margin:1rem 0" oninput="filterGlossary()"><div id="glossary-list" style="max-height:400px;overflow-y:auto"></div>` },
        'tool-hypothesis': { title: 'Pruebas de Hipótesis', html: `<h3>Calculadora de Pruebas</h3><div style="margin:1rem 0"><label style="font-weight:600;font-size:.85rem">Tipo de Prueba</label><select id="hyp-type" class="form-control"><option value="z">Prueba Z (proporciones)</option><option value="t1">Prueba t (una muestra)</option><option value="t2">Prueba t (dos muestras)</option></select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="font-weight:600;font-size:.85rem">Estadístico</label><input type="number" id="hyp-stat" class="form-control" value="2.1" step="0.01"></div><div><label style="font-weight:600;font-size:.85rem">Nivel de Significancia</label><select id="hyp-alpha" class="form-control"><option value="0.01">1%</option><option value="0.05" selected>5%</option><option value="0.10">10%</option></select></div></div><button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="testHypothesis()">Evaluar</button><div id="hyp-results" style="margin-top:1rem"></div>` },
        'tool-timeseries': { title: 'Series de Tiempo', html: `<h3>Modelos de Series de Tiempo</h3><p style="color:var(--text-gray);margin:1rem 0">Comprende los modelos autoregresivos usados en econometría.</p>
            <div style="display:grid;gap:1.5rem">
                <div style="background:var(--bg-offset);padding:1.5rem;border-radius:var(--radius-sm);border-left:4px solid var(--gold)">
                    <h4 style="color:var(--primary);margin-bottom:.5rem">AR(p) — Autoregresivo</h4>
                    <p style="font-size:.9rem;color:var(--text-gray)">Y<sub>t</sub> = c + φ₁Y<sub>t-1</sub> + ... + φ<sub>p</sub>Y<sub>t-p</sub> + ε<sub>t</sub></p>
                    <p style="font-size:.85rem;color:var(--text-gray);margin-top:.5rem">Se identifica con la PACF.</p>
                    <code style="display:block;margin-top:.5rem;padding:.5rem;background:var(--primary);color:#e2e8f0;border-radius:4px;font-size:.8rem">R: arima(y, order=c(p,0,0))<br>Stata: arima y, ar(1/p)<br>Python: ARIMA(y, order=(p,0,0)).fit()</code>
                </div>
                <div style="background:var(--bg-offset);padding:1.5rem;border-radius:var(--radius-sm);border-left:4px solid #3b82f6">
                    <h4 style="color:var(--primary);margin-bottom:.5rem">MA(q) — Media Móvil</h4>
                    <p style="font-size:.9rem;color:var(--text-gray)">Y<sub>t</sub> = c + ε<sub>t</sub> + θ₁ε<sub>t-1</sub> + ... + θ<sub>q</sub>ε<sub>t-q</sub></p>
                    <p style="font-size:.85rem;color:var(--text-gray);margin-top:.5rem">Se identifica con la ACF.</p>
                </div>
                <div style="background:var(--bg-offset);padding:1.5rem;border-radius:var(--radius-sm);border-left:4px solid #22c55e">
                    <h4 style="color:var(--primary);margin-bottom:.5rem">ARIMA(p,d,q) — Integrado</h4>
                    <p style="font-size:.9rem;color:var(--text-gray)">Combina AR y MA con diferenciación de orden d.</p>
                    <p style="font-size:.85rem;color:var(--text-gray);margin-top:.5rem"><strong>Box-Jenkins:</strong> Identificación → Estimación → Diagnóstico → Pronóstico.</p>
                    <code style="display:block;margin-top:.5rem;padding:.5rem;background:var(--primary);color:#e2e8f0;border-radius:4px;font-size:.8rem">R: auto.arima(y)<br>Stata: arima y, arima(p,d,q)<br>Python: auto_arima(y)  # pmdarima</code>
                </div>
                <div style="background:var(--bg-offset);padding:1.5rem;border-radius:var(--radius-sm);border-left:4px solid #8b5cf6">
                    <h4 style="color:var(--primary);margin-bottom:.5rem">VAR — Vector Autoregresivo</h4>
                    <p style="font-size:.9rem;color:var(--text-gray)">Sistema multiecuacional con rezagos cruzados.</p>
                    <code style="display:block;margin-top:.5rem;padding:.5rem;background:var(--primary);color:#e2e8f0;border-radius:4px;font-size:.8rem">R: VAR(data, p=2)<br>Stata: var y1 y2, lags(1/2)<br>Python: VAR(data).fit(2)</code>
                </div>
            </div>
            <div style="margin-top:1.5rem;padding:1rem;background:var(--bg-offset);border-radius:var(--radius-sm);font-size:.85rem">
                <h4 style="margin-bottom:.5rem"><i class="fas fa-lightbulb" style="color:var(--gold)"></i> Tests clave</h4>
                <ul style="color:var(--text-gray);padding-left:1.2rem">
                    <li><strong>ADF:</strong> Raíz unitaria</li><li><strong>Ljung-Box:</strong> Autocorrelación residual</li>
                    <li><strong>Granger:</strong> Causalidad temporal</li><li><strong>Johansen:</strong> Cointegración</li>
                </ul>
            </div>` },
        'tool-micro': { title: 'Simulador Microeconómico', html: `<h3><i class="fas fa-balance-scale" style="color:var(--gold)"></i> Oferta y Demanda</h3>
            <p style="color:var(--text-gray);margin:.5rem 0 1rem">Ajusta los parámetros y observa cómo cambian el equilibrio, excedentes y precio.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                <div><label style="font-weight:600;font-size:.85rem">Intercepto Demanda (a)</label><input type="range" id="micro-dem-a" min="20" max="100" value="60" oninput="drawMicro()"><span id="micro-dem-a-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">60</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Pendiente Demanda (b)</label><input type="range" id="micro-dem-b" min="5" max="30" value="10" oninput="drawMicro()"><span id="micro-dem-b-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">10</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Intercepto Oferta (c)</label><input type="range" id="micro-sup-c" min="0" max="30" value="5" oninput="drawMicro()"><span id="micro-sup-c-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">5</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Pendiente Oferta (d)</label><input type="range" id="micro-sup-d" min="3" max="25" value="8" oninput="drawMicro()"><span id="micro-sup-d-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">8</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Impuesto (t)</label><input type="range" id="micro-tax" min="0" max="20" value="0" oninput="drawMicro()"><span id="micro-tax-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">0</span></div>
            </div>
            <canvas id="micro-canvas" style="width:100%;height:320px;display:block;background:white;border:1px solid #e2e8f0;border-radius:8px"></canvas>
            <div id="micro-results" style="margin-top:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;text-align:center"></div>` },
        'tool-macro': { title: 'Simulador IS-LM', html: `<h3><i class="fas fa-university" style="color:var(--gold)"></i> Modelo IS-LM</h3>
            <p style="color:var(--text-gray);margin:.5rem 0 1rem">Simula política fiscal y monetaria. Observa cómo se desplazan IS y LM.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                <div><label style="font-weight:600;font-size:.85rem">Gasto Público (G)</label><input type="range" id="macro-G" min="50" max="300" value="150" oninput="drawISLM()"><span id="macro-G-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">150</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Impuestos (T)</label><input type="range" id="macro-T" min="20" max="200" value="100" oninput="drawISLM()"><span id="macro-T-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">100</span></div>
                <div><label style="font-weight:600;font-size:.85rem">Oferta Monetaria (M/P)</label><input type="range" id="macro-M" min="100" max="500" value="250" oninput="drawISLM()"><span id="macro-M-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">250</span></div>
                <div><label style="font-weight:600;font-size:.85rem">PMC (c)</label><input type="range" id="macro-c" min="50" max="95" value="80" oninput="drawISLM()"><span id="macro-c-val" style="font-family:'JetBrains Mono',monospace;font-size:.85rem">0.80</span></div>
            </div>
            <canvas id="macro-canvas" style="width:100%;height:320px;display:block;background:white;border:1px solid #e2e8f0;border-radius:8px"></canvas>
            <div id="macro-results" style="margin-top:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;text-align:center"></div>` },
        'tool-history': { title: 'Líneas del Tiempo Económicas', html: `<h3>Historia del Pensamiento Económico</h3><p style="color:var(--text-gray);margin:1rem 0">Desde los clásicos hasta la economía contemporánea.</p>
            <div style="position:relative;padding-left:2rem;border-left:3px solid var(--gold)">
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:var(--gold)"></div><h4 style="color:var(--primary)">1776 — Clásicos</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>Adam Smith</strong> publica "La Riqueza de las Naciones". Funda la economía moderna. Mano invisible, división del trabajo, libre mercado.</p><p style="font-size:.85rem;color:var(--text-gray);margin-top:.3rem"><em>David Ricardo</em> (ventaja comparativa), <em>Thomas Malthus</em> (teoría poblacional), <em>John Stuart Mill</em> (utilitarismo).</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#3b82f6"></div><h4 style="color:var(--primary)">1867 — Marxismo</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>Karl Marx</strong> publica "El Capital". Teoría del valor-trabajo, plusvalía, materialismo histórico. Crítica fundamental al capitalismo.</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#22c55e"></div><h4 style="color:var(--primary)">1871 — Revolución Marginalista</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>Jevons, Menger, Walras</strong>. Teoría de la utilidad marginal. Equilibrio general (Walras) vs equilibrio parcial (Marshall, 1890). Base de la microeconomía moderna.</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#ef4444"></div><h4 style="color:var(--primary)">1936 — Revolución Keynesiana</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>John M. Keynes</strong>: "Teoría General". Demanda efectiva, multiplicador, trampa de liquidez. El Estado como estabilizador macroeconómico.</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#8b5cf6"></div><h4 style="color:var(--primary)">1950-70 — Síntesis Neoclásica</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>Samuelson, Solow, Hicks</strong>. Modelo IS-LM. Modelo de crecimiento de Solow. Curva de Phillips. Econometría formal (Haavelmo, Frisch).</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#f59e0b"></div><h4 style="color:var(--primary)">1970s — Monetarismo y Expectativas</h4><p style="font-size:.9rem;color:var(--text-gray)"><strong>Milton Friedman</strong>: regla monetaria, crítica a Phillips. <strong>Robert Lucas</strong>: expectativas racionales. Revolución de la macroeconomía.</p></div>
                <div style="margin-bottom:1.5rem;position:relative"><div style="position:absolute;left:-2.55rem;width:12px;height:12px;border-radius:50%;background:#c9a227"></div><h4 style="color:var(--primary)">1980-Presente — Economía Contemporánea</h4><p style="font-size:.9rem;color:var(--text-gray)">Economía del comportamiento (<em>Kahneman, Thaler</em>), nueva economía institucional (<em>North, Acemoglu</em>), econometría moderna (<em>Heckman, Angrist</em>). Economía experimental y diseño de mecanismos.</p></div>
            </div>
            <div style="margin-top:1rem;padding:1rem;background:var(--bg-offset);border-radius:var(--radius-sm)">
                <h4 style="margin-bottom:.5rem;font-size:.95rem"><i class="fas fa-flag" style="color:var(--gold)"></i> Colombia</h4>
                <p style="font-size:.85rem;color:var(--text-gray)">Misión Kemmerer (1923), Banco de la República (1923), CEPAL y modelo ISI (1950s), apertura económica (1991), Constitución económica, independencia del BanRep, inflación objetivo.</p>
            </div>` }
    };

    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const tmpl = toolTemplates[card.id];
            if (tmpl && toolContent) {
                toolContent.innerHTML = tmpl.html;
                toolModal.style.display = 'flex';
                // Init specific tools
                if (card.id === 'tool-references') showCheat('r');
                if (card.id === 'tool-concepts') initGlossary();
                if (card.id === 'tool-micro') setTimeout(drawMicro, 100);
                if (card.id === 'tool-macro') setTimeout(drawISLM, 100);
            }
        });
    });

    // === 20. FIREBASE STATS ===
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
        if (typeof firebase !== 'undefined' && !firebase.apps.length) firebase.initializeApp(firebaseConfig);
        if (typeof firebase !== 'undefined') db = firebase.database();
    } catch (e) { console.debug('Firebase init skipped'); }

    function trackStat(key) {
        if (!db) return;
        try { db.ref('stats/' + key).transaction(v => (v || 0) + 1); } catch (e) { console.debug('Stats error:', e); }
    }
    if (!sessionStorage.getItem('visited')) { trackStat('visits'); sessionStorage.setItem('visited', 'true'); }
    document.addEventListener('click', e => {
        const target = e.target.closest('a');
        if (!target) return;
        if (target.id === 'link-parciales' || (target.href && target.href.includes('drive.google.com'))) trackStat('parciales_clicks');
        else if (target.id === 'link-pqrs' || (target.href && (target.href.includes('forms.gle') || target.href.includes('docs.google.com/forms')))) trackStat('pqrs_clicks');
    });

}); // End DOMContentLoaded

// === GLOBAL TOOL FUNCTIONS (outside DOMContentLoaded) ===

function runOLS() {
    const raw = document.getElementById('ols-data').value.trim();
    const lines = raw.split('\n').map(l => l.split(',').map(Number)).filter(p => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
    if (lines.length < 3) { document.getElementById('ols-results').innerHTML = '<p style="color:#ef4444">Se necesitan al menos 3 pares de datos.</p>'; return; }
    const n = lines.length, xs = lines.map(l => l[0]), ys = lines.map(l => l[1]);
    const xMean = xs.reduce((a, b) => a + b) / n, yMean = ys.reduce((a, b) => a + b) / n;
    let ssXY = 0, ssXX = 0, ssYY = 0;
    for (let i = 0; i < n; i++) { ssXY += (xs[i] - xMean) * (ys[i] - yMean); ssXX += (xs[i] - xMean) ** 2; ssYY += (ys[i] - yMean) ** 2; }
    const b1 = ssXY / ssXX, b0 = yMean - b1 * xMean;
    const yHat = xs.map(x => b0 + b1 * x);
    const residuals = ys.map((y, i) => y - yHat[i]);
    const sse = residuals.reduce((a, r) => a + r ** 2, 0);
    const sst = ssYY, ssr = sst - sse;
    const r2 = ssr / sst;
    const se = Math.sqrt(sse / (n - 2));
    const seB1 = se / Math.sqrt(ssXX);
    const tStat = b1 / seB1;
    document.getElementById('ols-results').innerHTML = `
        <div style="background:var(--bg-offset);padding:1.5rem;border-radius:var(--radius-sm);font-family:'JetBrains Mono',monospace;font-size:.85rem">
        <p><strong>ŷ = ${b0.toFixed(4)} + ${b1.toFixed(4)}x</strong></p>
        <hr style="margin:.8rem 0;border-color:rgba(0,0,0,.08)">
        <p>β₀ (Intercepto): ${b0.toFixed(4)}</p>
        <p>β₁ (Pendiente): ${b1.toFixed(4)}</p>
        <p>R²: ${r2.toFixed(4)} (${(r2*100).toFixed(1)}%)</p>
        <p>Error Estándar: ${se.toFixed(4)}</p>
        <p>t-estadístico (β₁): ${tStat.toFixed(4)}</p>
        <p>n = ${n} observaciones</p>
        <hr style="margin:.8rem 0;border-color:rgba(0,0,0,.08)">
        <p style="color:${Math.abs(tStat)>1.96?'#22c55e':'#ef4444'}"><strong>${Math.abs(tStat)>1.96?'✅ Significativo al 5%':'❌ No significativo al 5%'}</strong></p>
        </div>`;
}

function drawProbitLogit() {
    const canvas = document.getElementById('probit-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const width = canvas.offsetWidth, height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    const mu = parseFloat(document.getElementById('pl-mean').value) || 0;
    const sd = parseFloat(document.getElementById('pl-sd').value) || 1;
    // Axes
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, height - 30); ctx.lineTo(width - 10, height - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, height - 30); ctx.stroke();
    const xMin = mu - 4 * sd, xMax = mu + 4 * sd;
    function toCanvasX(x) { return 40 + (x - xMin) / (xMax - xMin) * (width - 50); }
    function toCanvasY(y) { return height - 30 - y * (height - 40); }
    // Normal CDF (Probit)
    function normalCDF(x) { const z = (x - mu) / sd; const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989422804 * Math.exp(-(z * z) / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z >= 0 ? 1 - p : p; }
    // Logit CDF
    function logitCDF(x) { return 1 / (1 + Math.exp(-(x - mu) / sd)); }
    // Draw Probit
    ctx.beginPath(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;
    for (let px = 40; px < width - 10; px++) { const x = xMin + (px - 40) / (width - 50) * (xMax - xMin); const y = normalCDF(x); if (px === 40) ctx.moveTo(px, toCanvasY(y)); else ctx.lineTo(px, toCanvasY(y)); }
    ctx.stroke();
    // Draw Logit
    ctx.beginPath(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
    for (let px = 40; px < width - 10; px++) { const x = xMin + (px - 40) / (width - 50) * (xMax - xMin); const y = logitCDF(x); if (px === 40) ctx.moveTo(px, toCanvasY(y)); else ctx.lineTo(px, toCanvasY(y)); }
    ctx.stroke(); ctx.setLineDash([]);
    // Labels
    ctx.fillStyle = '#3b82f6'; ctx.font = '12px Inter'; ctx.fillText('Probit (Normal)', width - 130, 25);
    ctx.fillStyle = '#ef4444'; ctx.fillText('Logit', width - 130, 42);
    ctx.fillStyle = '#64748b'; ctx.font = '10px Inter';
    ctx.fillText('0', 25, height - 25); ctx.fillText('1', 25, 18);
    ctx.fillText(xMin.toFixed(1), 35, height - 15); ctx.fillText(xMax.toFixed(1), width - 35, height - 15);
}

function calcDistribution() {
    const type = document.getElementById('dist-type').value;
    const val = parseFloat(document.getElementById('dist-value').value);
    const df = parseInt(document.getElementById('dist-df').value);
    let result = '';
    const canvas = document.getElementById('dist-canvas');
    if (type === 'normal') {
        // Approx normal CDF
        const t = 1 / (1 + 0.2316419 * Math.abs(val));
        const d = 0.3989422804 * Math.exp(-val * val / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        const cdf = val >= 0 ? 1 - p : p;
        const pValue2 = 2 * (1 - cdf);
        result = `<p><strong>Z = ${val}</strong></p><p>P(Z ≤ ${val}) = ${cdf.toFixed(6)}</p><p>p-value (dos colas) = ${(pValue2 < 0 ? 0 : pValue2).toFixed(6)}</p><p>${pValue2 < 0.05 ? '✅ Significativo al 5%' : '❌ No significativo al 5%'}</p>`;
        
        // Draw Distribution on Canvas
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width, h = canvas.height;
        const yAxis = h - 25;
        
        // Base line
        ctx.beginPath();
        ctx.moveTo(0, yAxis);
        ctx.lineTo(w, yAxis);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();

        // Shaded area
        ctx.beginPath();
        ctx.moveTo(0, yAxis);
        for(let x=-4; x<=Math.min(val, 4); x+=0.05) {
            const py = 0.3989422804 * Math.exp(-x * x / 2);
            ctx.lineTo((x + 4) / 8 * w, yAxis - (py * h * 1.8));
        }
        const endX = (Math.min(val, 4) + 4) / 8 * w;
        ctx.lineTo(endX, yAxis);
        ctx.fillStyle = 'rgba(201, 162, 39, 0.4)';
        ctx.fill();

        // Bell curve
        ctx.beginPath();
        for(let x=-4; x<=4; x+=0.05) {
            const py = 0.3989422804 * Math.exp(-x * x / 2);
            const cx = (x + 4) / 8 * w;
            const cy = yAxis - (py * h * 1.8);
            if(x === -4) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Value marker
        ctx.beginPath();
        ctx.moveTo(endX, yAxis);
        ctx.lineTo(endX, yAxis - (0.3989422804 * Math.exp(-Math.min(val, 4)**2 / 2) * h * 1.8));
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(2), endX, h - 5);
        ctx.fillText('0', w/2, h - 5);

    } else {
        canvas.style.display = 'none';
        result = `<p>Valor: ${val}, GL: ${df}</p><p style="color:var(--text-gray)">Para t-Student y Chi² con tablas exactas, usa R: <code>pt(${val}, ${df})</code> o <code>pchisq(${val}, ${df})</code></p>`;
    }
    document.getElementById('dist-results').innerHTML = `<div style="background:var(--bg-offset);padding:1.2rem;border-radius:var(--radius-sm)">${result}</div>`;
}

function testHypothesis() {
    const stat = parseFloat(document.getElementById('hyp-stat').value);
    const alpha = parseFloat(document.getElementById('hyp-alpha').value);
    const criticals = { '0.01': 2.576, '0.05': 1.96, '0.10': 1.645 };
    const cv = criticals[alpha.toString()] || 1.96;
    const reject = Math.abs(stat) > cv;
    document.getElementById('hyp-results').innerHTML = `<div style="background:var(--bg-offset);padding:1.2rem;border-radius:var(--radius-sm)">
        <p><strong>|Estadístico| = ${Math.abs(stat).toFixed(4)}</strong></p>
        <p>Valor Crítico (α=${alpha}): ±${cv}</p>
        <hr style="margin:.8rem 0;border-color:rgba(0,0,0,.08)">
        <p style="color:${reject?'#22c55e':'#ef4444'};font-weight:700;font-size:1.1rem">${reject?'✅ SE RECHAZA H₀':'❌ NO se rechaza H₀'}</p>
        <p style="color:var(--text-gray);font-size:.85rem;margin-top:.5rem">${reject?'Existe evidencia estadística suficiente al nivel '+alpha*100+'%.':'No hay evidencia suficiente para rechazar la hipótesis nula al nivel '+alpha*100+'%.'}</p>
    </div>`;
}

const cheatSheets = {
    r: `# === R - Econometría ===
# Regresión OLS
modelo <- lm(y ~ x1 + x2, data=df)
summary(modelo)

# Probit
probit <- glm(y ~ x1 + x2, family=binomial(link="probit"), data=df)

# Logit
logit <- glm(y ~ x1 + x2, family=binomial(link="logit"), data=df)

# Efectos Marginales
library(margins)
margins(probit)

# Test de Heterocedasticidad
library(lmtest)
bptest(modelo)  # Breusch-Pagan

# Test de Autocorrelación
dwtest(modelo)  # Durbin-Watson

# Series de Tiempo
library(forecast)
auto.arima(ts_data)`,
    stata: `* === Stata - Econometría ===
* Regresión OLS
reg y x1 x2

* Probit
probit y x1 x2
margins, dydx(*)

* Logit
logit y x1 x2
margins, dydx(*)

* Test Heterocedasticidad
estat hettest    // Breusch-Pagan
estat imtest     // White

* Test Autocorrelación
estat dwatson

* Panel Data
xtset id time
xtreg y x1 x2, fe    // Efectos Fijos
xtreg y x1 x2, re    // Efectos Aleatorios
hausman fe re         // Test Hausman`,
    python: `# === Python - Econometría ===
import statsmodels.api as sm
import pandas as pd

# Regresión OLS
X = sm.add_constant(df[['x1', 'x2']])
modelo = sm.OLS(df['y'], X).fit()
print(modelo.summary())

# Probit
probit = sm.Probit(df['y'], X).fit()
probit.get_margeff().summary()

# Logit
logit = sm.Logit(df['y'], X).fit()
logit.get_margeff().summary()

# Test Breusch-Pagan
from statsmodels.stats.diagnostic import het_breuschpagan
het_breuschpagan(modelo.resid, X)

# Test Durbin-Watson
from statsmodels.stats.stattools import durbin_watson
durbin_watson(modelo.resid)`
};
function showCheat(lang) {
    document.getElementById('cheat-content').textContent = cheatSheets[lang] || '';
    document.querySelectorAll('#tool-modal .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

const glossaryData = [
    // Microeconomía
    { term: 'Equilibrio General', def: 'Marco teórico (Walras) que analiza cómo los mercados interconectados alcanzan equilibrio simultáneo. Todos los precios se determinan conjuntamente.' },
    { term: 'Equilibrio Parcial', def: 'Análisis de un solo mercado en aislamiento (Marshall), manteniendo todo lo demás constante (ceteris paribus).' },
    { term: 'Elasticidad', def: 'Medida de sensibilidad: cambio porcentual en Y ante un cambio porcentual en X. Puede ser precio, ingreso o cruzada.' },
    { term: 'Costo de Oportunidad', def: 'Valor de la mejor alternativa sacrificada al tomar una decisión económica.' },
    { term: 'Excedente del Consumidor', def: 'Diferencia entre lo que un consumidor está dispuesto a pagar y lo que efectivamente paga. Área bajo la demanda sobre el precio.' },
    { term: 'Excedente del Productor', def: 'Diferencia entre el precio recibido y el costo marginal de producción. Área sobre la oferta bajo el precio.' },
    { term: 'Competencia Perfecta', def: 'Estructura de mercado con muchos oferentes, producto homogéneo, libre entrada/salida, información perfecta. P = CMg en equilibrio.' },
    { term: 'Monopolio', def: 'Mercado con un solo oferente. Fija precio por encima del CMg, genera pérdida de bienestar social (peso muerto).' },
    { term: 'Oligopolio', def: 'Pocos oferentes interdependientes. Modelos: Cournot (cantidades), Bertrand (precios), Stackelberg (líder-seguidor).' },
    { term: 'Utilidad Marginal', def: 'Satisfacción adicional obtenida al consumir una unidad más de un bien. Decreciente según la ley de la utilidad marginal.' },
    { term: 'Óptimo de Pareto', def: 'Asignación donde no es posible mejorar a un individuo sin empeorar a otro. Criterio de eficiencia económica.' },
    { term: 'Externalidad', def: 'Efecto no compensado de una actividad económica sobre terceros. Puede ser positiva (educación) o negativa (contaminación).' },
    { term: 'Bienes Públicos', def: 'Bienes no rivales y no excluibles. Generan el problema del free-rider. Ejemplos: defensa nacional, alumbrado público.' },
    // Macroeconomía
    { term: 'PIB (Producto Interno Bruto)', def: 'Valor total de bienes y servicios finales producidos en un país durante un período. Puede medirse por producción, ingreso o gasto.' },
    { term: 'Inflación', def: 'Aumento sostenido y generalizado del nivel de precios. Medida por el IPC. Erosiona el poder adquisitivo.' },
    { term: 'Curva de Phillips', def: 'Relación inversa entre desempleo e inflación en el corto plazo. Cuestionada por Friedman y Lucas (expectativas).' },
    { term: 'Modelo IS-LM', def: 'Modelo keynesiano de Hicks-Hansen. IS: equilibrio en mercado de bienes. LM: equilibrio en mercado de dinero. Determina r e Y simultáneamente.' },
    { term: 'Multiplicador Keynesiano', def: 'Efecto amplificado del gasto público sobre el PIB. k = 1/(1-c), donde c es la propensión marginal a consumir.' },
    { term: 'Trampa de Liquidez', def: 'Situación donde la tasa de interés es tan baja que la política monetaria pierde efectividad. Todos prefieren mantener dinero.' },
    { term: 'Modelo de Solow', def: 'Modelo neoclásico de crecimiento. El producto depende de capital, trabajo y tecnología. Predice convergencia entre economías.' },
    { term: 'Política Fiscal', def: 'Uso del gasto público e impuestos para influir en la actividad económica. Expansiva (↑G o ↓T) o contractiva.' },
    { term: 'Política Monetaria', def: 'Gestión de la oferta monetaria y tasas de interés por el banco central para controlar inflación y empleo.' },
    { term: 'Balanza de Pagos', def: 'Registro de todas las transacciones económicas de un país con el resto del mundo. Cuenta corriente + cuenta de capital.' },
    // Econometría
    { term: 'Mínimos Cuadrados Ordinarios (MCO)', def: 'Método de estimación que minimiza la suma de los residuos al cuadrado. Base de la econometría aplicada. Requiere supuestos Gauss-Markov.' },
    { term: 'Modelo Probit', def: 'Modelo de elección discreta que usa la CDF de la distribución normal para modelar P(Y=1|X).' },
    { term: 'Modelo Logit', def: 'Modelo de elección discreta que usa la función logística Λ(x)=1/(1+e⁻ˣ) para modelar probabilidades.' },
    { term: 'Teorema de Gauss-Markov', def: 'Bajo los supuestos clásicos (linealidad, exogeneidad, homocedasticidad, no autocorrelación), MCO es BLUE.' },
    { term: 'Heterocedasticidad', def: 'Violación del supuesto de varianza constante de los errores. Se detecta con Breusch-Pagan o White. Corregir con errores robustos.' },
    { term: 'Multicolinealidad', def: 'Alta correlación entre variables independientes. Infla varianzas y hace inestables los coeficientes. Detectar con VIF.' },
    { term: 'Efectos Marginales', def: 'En modelos no lineales (Probit/Logit), miden el cambio en P(Y=1) ante un cambio unitario en X.' },
    { term: 'R² (Coeficiente de Determinación)', def: 'Proporción de la varianza de Y explicada por el modelo. Va de 0 a 1. R² ajustado penaliza por exceso de variables.' },
    { term: 'Autocorrelación', def: 'Correlación entre los errores en distintos períodos. Común en series de tiempo. Se detecta con Durbin-Watson o Breusch-Godfrey.' },
    { term: 'Endogeneidad', def: 'Cuando una variable explicativa está correlacionada con el error. Causas: omisión, simultaneidad, error de medición. Solución: variables instrumentales.' },
    { term: 'Variables Instrumentales', def: 'Técnica para resolver endogeneidad. El instrumento debe estar correlacionado con X pero no con el error.' },
    // Pensamiento Económico
    { term: 'Ventaja Comparativa', def: 'Principio ricardiano: un país debe especializarse en producir bienes con menor costo de oportunidad relativo.' },
    { term: 'Mano Invisible', def: 'Metáfora de Adam Smith: la búsqueda individual del interés propio, guiada por los precios, lleva al bienestar colectivo.' },
    { term: 'Destrucción Creativa', def: 'Concepto de Schumpeter: el capitalismo avanza destruyendo estructuras económicas viejas para crear nuevas (innovación).' },
    { term: 'Expectativas Racionales', def: 'Hipótesis de Lucas: los agentes económicos usan toda la información disponible para formar expectativas. Base de la Nueva Macroeconomía Clásica.' },
    { term: 'Institucionalismo', def: 'Enfoque que estudia cómo las instituciones (reglas formales e informales) determinan el desempeño económico (North, Acemoglu).' },
    { term: 'Economía del Comportamiento', def: 'Integra psicología y economía. Sesgos cognitivos, heurísticas, aversión a la pérdida. Kahneman, Tversky, Thaler.' },
    // Historia Económica
    { term: 'Mercantilismo', def: 'Doctrina (siglos XVI-XVIII) que asociaba riqueza con acumulación de metales preciosos. Proteccionismo y balanza comercial favorable.' },
    { term: 'Fisiocracia', def: 'Escuela francesa (Quesnay). La tierra como única fuente de riqueza. Tableau Économique como primer modelo macroeconómico.' },
    { term: 'Gran Depresión', def: 'Crisis económica global 1929-1939. Caída del 30% del PIB de EE.UU. Motivó la revolución keynesiana y la regulación financiera.' },
    { term: 'Consenso de Washington', def: 'Conjunto de políticas neoliberales (1989): disciplina fiscal, liberalización, privatización. Influyó fuertemente en América Latina.' }
];
function initGlossary() {
    const list = document.getElementById('glossary-list');
    if (!list) return;
    renderGlossaryItems(glossaryData);
}
function renderGlossaryItems(items) {
    const list = document.getElementById('glossary-list');
    list.innerHTML = items.map(g => `<div style="padding:1rem;border-bottom:1px solid rgba(0,0,0,.06)"><h4 style="font-size:1rem;color:var(--primary);margin-bottom:.3rem">${g.term}</h4><p style="color:var(--text-gray);font-size:.9rem">${g.def}</p></div>`).join('');
}
function filterGlossary() {
    const q = document.getElementById('glossary-search').value.toLowerCase();
    renderGlossaryItems(glossaryData.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)));
}

// === MICRO: Supply & Demand Canvas ===
function drawMicro() {
    const canvas = document.getElementById('micro-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const w = container ? container.clientWidth : 600;
    canvas.style.width = w + 'px';
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = 320 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = w, H = 320;
    const pad = 50;

    const a = +document.getElementById('micro-dem-a').value;
    const b = +document.getElementById('micro-dem-b').value;
    const c = +document.getElementById('micro-sup-c').value;
    const d = +document.getElementById('micro-sup-d').value;
    const t = +document.getElementById('micro-tax').value;
    document.getElementById('micro-dem-a-val').textContent = a;
    document.getElementById('micro-dem-b-val').textContent = b;
    document.getElementById('micro-sup-c-val').textContent = c;
    document.getElementById('micro-sup-d-val').textContent = d;
    document.getElementById('micro-tax-val').textContent = t;

    // Demand: P = a - b*Q  =>  Q = (a-P)/b
    // Supply: P = c + d*Q  =>  Q = (P-c)/d
    // Equilibrium: a - b*Q = c + d*Q => Q* = (a-c)/(b+d), P* = a - b*Q*
    const Qe = (a - c) / (b + d);
    const Pe = a - b * Qe;
    // With tax: Supply shifts up: P = (c+t) + d*Q
    const Qt = (a - c - t) / (b + d);
    const Pt_demand = a - b * Qt; // price buyers pay
    const Pt_supply = Pt_demand - t; // price sellers receive

    const maxQ = Math.max(a / b, 8) * 1.1;
    const maxP = Math.max(a, c + d * maxQ) * 1.1;
    const scaleX = (W - pad * 2) / maxQ;
    const scaleY = (H - pad * 2) / maxP;
    const toX = q => pad + q * scaleX;
    const toY = p => H - pad - p * scaleY;

    // Clear
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad + (H - 2 * pad) * i / 5;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Q', W - pad + 5, H - pad + 5);
    ctx.fillText('P', pad - 5, pad - 10);

    // Excedent fills (before tax)
    if (Qe > 0 && Pe > 0 && t === 0) {
        // Consumer surplus
        ctx.fillStyle = 'rgba(59,130,246,.15)';
        ctx.beginPath(); ctx.moveTo(toX(0), toY(a)); ctx.lineTo(toX(Qe), toY(Pe)); ctx.lineTo(toX(0), toY(Pe)); ctx.closePath(); ctx.fill();
        // Producer surplus
        ctx.fillStyle = 'rgba(34,197,94,.15)';
        ctx.beginPath(); ctx.moveTo(toX(0), toY(c)); ctx.lineTo(toX(Qe), toY(Pe)); ctx.lineTo(toX(0), toY(Pe)); ctx.closePath(); ctx.fill();
    }
    // Deadweight loss with tax
    if (t > 0 && Qt > 0) {
        ctx.fillStyle = 'rgba(239,68,68,.2)';
        ctx.beginPath();
        ctx.moveTo(toX(Qt), toY(Pt_demand));
        ctx.lineTo(toX(Qe), toY(Pe));
        ctx.lineTo(toX(Qt), toY(Pt_supply));
        ctx.closePath(); ctx.fill();
    }

    // Demand curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(a));
    ctx.lineTo(toX(a / b), toY(0));
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('D', toX(a / b) - 15, toY(0) - 8);

    // Supply curve (original)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(c));
    ctx.lineTo(toX((maxP - c) / d), toY(maxP));
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('S', toX((maxP - c) / d) - 15, toY(maxP) + 15);

    // Supply with tax
    if (t > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(c + t));
        ctx.lineTo(toX((maxP - c - t) / d), toY(maxP));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('S + t', toX((maxP - c - t) / d) - 25, toY(maxP) + 15);
    }

    // Equilibrium dot
    if (Qe > 0 && Pe > 0) {
        ctx.beginPath();
        ctx.arc(toX(t > 0 ? Qt : Qe), toY(t > 0 ? Pt_demand : Pe), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a227';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dashed lines to axes
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        const eqQ = t > 0 ? Qt : Qe;
        const eqP = t > 0 ? Pt_demand : Pe;
        ctx.beginPath(); ctx.moveTo(toX(eqQ), toY(eqP)); ctx.lineTo(toX(eqQ), toY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX(eqQ), toY(eqP)); ctx.lineTo(toX(0), toY(eqP)); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#1e293b';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Q*=' + (t > 0 ? Qt : Qe).toFixed(1), toX(eqQ) - 10, toY(0) + 15);
        ctx.fillText('P*=' + eqP.toFixed(1), toX(0) - 45, toY(eqP) + 4);
    }

    // Results
    const results = document.getElementById('micro-results');
    if (results) {
        const eqQ = t > 0 ? Qt : Qe;
        const eqP = t > 0 ? Pt_demand : Pe;
        const cs = eqQ > 0 ? 0.5 * eqQ * (a - eqP) : 0;
        const ps = eqQ > 0 ? 0.5 * eqQ * (eqP - (t > 0 ? Pt_supply + t : c)) : 0;
        const dwl = t > 0 ? 0.5 * t * (Qe - Qt) : 0;
        results.innerHTML = `
            <div style="background:rgba(59,130,246,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">Exc. Consumidor</div><div style="font-size:1.2rem;font-weight:700;color:#3b82f6">${cs.toFixed(1)}</div></div>
            <div style="background:rgba(34,197,94,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">Exc. Productor</div><div style="font-size:1.2rem;font-weight:700;color:#22c55e">${ps.toFixed(1)}</div></div>
            <div style="background:rgba(239,68,68,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">Peso Muerto</div><div style="font-size:1.2rem;font-weight:700;color:#ef4444">${dwl.toFixed(1)}</div></div>`;
    }
}

// === MACRO: IS-LM Canvas ===
function drawISLM() {
    const canvas = document.getElementById('macro-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const w = container ? container.clientWidth : 600;
    canvas.style.width = w + 'px';
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = 320 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = w, H = 320;
    const pad = 50;

    const G = +document.getElementById('macro-G').value;
    const T = +document.getElementById('macro-T').value;
    const M = +document.getElementById('macro-M').value;
    const c = +document.getElementById('macro-c').value / 100;
    document.getElementById('macro-G-val').textContent = G;
    document.getElementById('macro-T-val').textContent = T;
    document.getElementById('macro-M-val').textContent = M;
    document.getElementById('macro-c-val').textContent = c.toFixed(2);

    // IS: r = [(1/(1-c)) * (c0 + I0 + G - c*T) - Y] * (1-c) / d_invest
    // Simplified: IS: r = A - B*Y  where A and B depend on params
    // LM: r = (1/h) * (k*Y - M/P)
    const c0 = 50; // autonomous consumption
    const I0 = 100; // autonomous investment
    const d_inv = 50; // investment sensitivity to r
    const k = 0.5; // money demand sensitivity to Y
    const h = 100; // money demand sensitivity to r

    // IS: Y = [c0 + I0 + G - c*T - d_inv*r] / (1-c)
    // => r = (c0 + I0 + G - c*T - (1-c)*Y) / d_inv
    // LM: M = k*Y - h*r => r = (k*Y - M) / h

    const isR = (Y) => (c0 + I0 + G - c * T - (1 - c) * Y) / d_inv;
    const lmR = (Y) => (k * Y - M) / h;

    // Equilibrium: set IS = LM
    // (c0+I0+G-c*T-(1-c)*Y)/d_inv = (k*Y-M)/h
    // h*(c0+I0+G-c*T-(1-c)*Y) = d_inv*(k*Y - M)
    // h*(c0+I0+G-c*T) - h*(1-c)*Y = d_inv*k*Y - d_inv*M
    // h*(c0+I0+G-c*T) + d_inv*M = Y*(d_inv*k + h*(1-c))
    const Ye = (h * (c0 + I0 + G - c * T) + d_inv * M) / (d_inv * k + h * (1 - c));
    const re = isR(Ye);

    const maxY = 1200;
    const maxR = 15;
    const scaleX = (W - pad * 2) / maxY;
    const scaleY = (H - pad * 2) / maxR;
    const toX = y => pad + y * scaleX;
    const toY = r => H - pad - r * scaleY;

    // Clear
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad + (H - 2 * pad) * i / 5;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Y (Ingreso)', W - pad - 60, H - pad + 30);
    ctx.fillText('r (%)', pad - 5, pad - 10);

    // IS curve (blue, downward sloping)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let Y = 0; Y <= maxY; Y += 5) {
        const r = isR(Y);
        if (r >= 0 && r <= maxR) {
            if (!started) { ctx.moveTo(toX(Y), toY(r)); started = true; }
            else ctx.lineTo(toX(Y), toY(r));
        }
    }
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('IS', toX(Math.min(maxY * 0.85, maxY)), toY(Math.max(isR(maxY * 0.85), 0)) - 10);

    // LM curve (red, upward sloping)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    started = false;
    for (let Y = 0; Y <= maxY; Y += 5) {
        const r = lmR(Y);
        if (r >= 0 && r <= maxR) {
            if (!started) { ctx.moveTo(toX(Y), toY(r)); started = true; }
            else ctx.lineTo(toX(Y), toY(r));
        }
    }
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillText('LM', toX(Math.min(M / k + h * maxR / k, maxY) * 0.9), toY(maxR * 0.9) + 15);

    // Equilibrium
    if (Ye > 0 && Ye < maxY && re > 0 && re < maxR) {
        ctx.beginPath();
        ctx.arc(toX(Ye), toY(re), 7, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a227';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(toX(Ye), toY(re)); ctx.lineTo(toX(Ye), toY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX(Ye), toY(re)); ctx.lineTo(toX(0), toY(re)); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#1e293b';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Y*=' + Math.round(Ye), toX(Ye) - 15, toY(0) + 15);
        ctx.fillText('r*=' + re.toFixed(1) + '%', toX(0) - 48, toY(re) + 4);
    }

    // Results
    const results = document.getElementById('macro-results');
    const mult = 1 / (1 - c);
    if (results) {
        results.innerHTML = `
            <div style="background:rgba(59,130,246,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">Y* Equilibrio</div><div style="font-size:1.2rem;font-weight:700;color:#3b82f6">${Math.round(Ye)}</div></div>
            <div style="background:rgba(239,68,68,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">r* Equilibrio</div><div style="font-size:1.2rem;font-weight:700;color:#ef4444">${re.toFixed(2)}%</div></div>
            <div style="background:rgba(201,162,39,.1);padding:.8rem;border-radius:8px"><div style="font-size:.75rem;color:var(--text-gray)">Multiplicador</div><div style="font-size:1.2rem;font-weight:700;color:#c9a227">${mult.toFixed(2)}</div></div>`;
    }
}
