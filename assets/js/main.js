document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Q&A Data & Rendering ---
    const qaData = [
        {
            question: "¿Cuáles son las materias con mayor nivel de prerrequisitos?",
            answer: "Según el Plan de Estudios 2016-2023, las líneas más largas son Matemáticas e Inglés. Por ejemplo, para cursar Econometría I (5to), debes haber aprobado Estadística II y Economía Matemática. Recomendamos no atrasarse en el área cuantitativa."
        },
        {
            question: "¿Cuántos niveles de inglés debo cursar?",
            answer: "El programa contempla 6 niveles de inglés obligatorios (I al VI). Cada uno es prerrequisito del siguiente. Es vital avanzar desde los primeros semestres."
        },
        {
            question: "¿Cómo puedo saber quién dicta cada materia?",
            answer: "Contamos con una sección de 'Catálogo de Profesores' donde puedes ver reseñas. Históricamente hay docentes planta para áreas específicas, aunque puede variar."
        },
        {
            question: "¿Puedo perder una materia por inasistencia?",
            answer: "Sí. El reglamento estipula que una inasistencia injustificada superior al 20% conlleva la pérdida de la asignatura con nota 0.0."
        }
    ];

    const qaContainer = document.getElementById('qa-container');
    if (qaContainer) {
        qaData.forEach(item => {
            const qaItem = document.createElement('div');
            qaItem.className = 'qa-item';
            qaItem.innerHTML = `
                <div class="qa-question">
                    <h4>${item.question}</h4>
                    <i class="fas fa-plus"></i>
                </div>
                <div class="qa-answer">
                    <p>${item.answer}</p>
                </div>
            `;
            qaContainer.appendChild(qaItem);

            // Interaction
            const header = qaItem.querySelector('.qa-question');
            header.addEventListener('click', () => {
                const answer = qaItem.querySelector('.qa-answer');
                const icon = header.querySelector('i');
                const isOpen = answer.style.maxHeight;

                // Close all others (optional)
                document.querySelectorAll('.qa-answer').forEach(a => a.style.maxHeight = null);
                document.querySelectorAll('.qa-question i').forEach(i => i.classList.replace('fa-minus', 'fa-plus'));

                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    icon.classList.replace('fa-plus', 'fa-minus');
                }
            });
        });
    }




    // --- 2. Interactive Curriculum (Malla 2025) ---
    initCurriculumInteraction();

    function initCurriculumInteraction() {
        const cards = document.querySelectorAll('.subject-card');
        const modal = document.getElementById('subject-modal');
        const closeModal = document.querySelector('.close-modal');

        // If the element doesn't exist (e.g. on other pages), skip
        if (!modal) return;

        // Close Modal Handlers
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            clearHighlights();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                clearHighlights();
            }
        });

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const subjectId = card.id;
                const prereqs = card.dataset.prereqs ? card.dataset.prereqs.split(' ') : [];
                const description = card.dataset.desc || "Información del plan de estudios.";
                // Get title safely (first text node)
                const title = card.childNodes[0].textContent.trim();
                const credits = card.querySelector('.badge') ? card.querySelector('.badge').textContent : '';

                // 1. Highlight Logic
                clearHighlights();
                document.body.classList.add('interacting');
                card.classList.add('highlight-active');

                // Highlight Prereqs Visual Flow
                const prereqNames = [];
                prereqs.forEach(pid => {
                    const pCard = document.getElementById(pid);
                    if (pCard) {
                        pCard.classList.add('highlight-prereq');
                        // Optional: Highlight lines if we had them.
                        // Get name for modal
                        prereqNames.push(pCard.childNodes[0].textContent.trim());
                    }
                });

                // 2. Populate & Open Modal
                document.getElementById('modal-title').textContent = title;
                document.getElementById('modal-credits').textContent = credits;
                document.getElementById('modal-desc').textContent = description;
                document.getElementById('modal-code').textContent = subjectId ? subjectId.toUpperCase() : '---';

                const prereqList = document.getElementById('modal-prereqs');
                prereqList.innerHTML = '';

                if (prereqNames.length > 0) {
                    prereqNames.forEach(name => {
                        const li = document.createElement('li');
                        li.textContent = name;
                        prereqList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'Ninguno / Aprobado semestres anteriores';
                    prereqList.appendChild(li);
                }

                modal.style.display = 'flex';
            });
        });
    }

    function clearHighlights() {
        document.body.classList.remove('interacting');
        document.querySelectorAll('.subject-card').forEach(c => {
            c.classList.remove('highlight-active', 'highlight-prereq');
        });
    }


    // --- 3. Tabs Handling ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active
            btn.classList.add('active');
            const target = btn.dataset.target;
            document.getElementById(target).classList.add('active');
        });
    });

    // --- 4. Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Icon animation (hamburger to times)
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- 5. Economic Indicators (Live Data) ---
    async function fetchEconomicIndicators() {
        const trmElement = document.getElementById('ticker-trm');
        const trmElement2 = document.getElementById('ticker-trm-2');

        try {
            // Official Source: Datos Abiertos (Socrata API) for TRM
            // Dataset ID: 32sa-8pi3
            const response = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciahasta%20DESC');

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data.length > 0) {
                const trmValue = parseFloat(data[0].valor).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                });

                // Update DOM
                const trmHtml = `TRM (Hoy): ${trmValue} <i class="fas fa-arrow-up text-success"></i>`; // Assuming general trend or just indicator
                if (trmElement) trmElement.innerHTML = trmHtml;
                if (trmElement2) trmElement2.innerHTML = trmHtml;
            }
        } catch (error) {
            console.error('Error fetching TRM:', error);
            if (trmElement) trmElement.innerHTML = `TRM (Est): $4,100 <i class="fas fa-exclamation-triangle text-warning"></i>`;
        }
    }

    // --- 6. Grade Calculator (Enhanced) ---
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

            // Default target if empty or invalid
            if (isNaN(target) || target <= 0) target = 3.0;

            // Scenario 1: Only C1 is present -> Project needed average for remaining 70%
            if (!isNaN(c1) && isNaN(c2) && isNaN(c3)) {
                const currentVal = c1 * 0.3;
                const distinct = target - currentVal;
                // Remaining weight is 70% (0.7)
                const neededAvg = distinct / 0.7;

                display.textContent = neededAvg.toFixed(2);

                if (neededAvg > 5.0) {
                    display.style.color = "#ff6b6b";
                    feedback.innerHTML = `Necesitas promediar más de <b>5.0</b> en lo que falta para sacar ${target}.<br>Es matemáticamente imposible 😢.`;
                    resultBox.style.border = "1px solid #ff6b6b";
                } else {
                    display.style.color = "#fcc419";
                    feedback.innerHTML = `Para cerrar en <b>${target}</b>, necesitas promediar <b>${neededAvg.toFixed(2)}</b> entre el 2do y 3er corte.`;
                    resultBox.style.border = "1px solid #fcc419";
                }
            }
            // Scenario 2: C1 + C2 present -> Project needed C3
            else if (!isNaN(c1) && !isNaN(c2) && isNaN(c3)) {
                const currentSum = (c1 * 0.3) + (c2 * 0.3);
                const distinct = target - currentSum;
                const needed = distinct / 0.4;

                display.textContent = needed.toFixed(2);

                if (needed > 5.0) {
                    display.style.color = "#ff6b6b";
                    feedback.innerHTML = `Necesitas <b>${needed.toFixed(2)}</b> en el final para sacar ${target}.<br>¡Es un milagro! 😢`;
                    resultBox.style.border = "1px solid #ff6b6b";
                } else if (needed < 0) {
                    display.textContent = "0.0";
                    display.style.color = "#51cf66";
                    feedback.innerHTML = `¡Ya la pasaste! 🎉<br>Incluso con 0 en el final superas el ${target}.`;
                    resultBox.style.border = "1px solid #51cf66";
                } else {
                    display.style.color = "#fcc419";
                    feedback.innerHTML = `Necesitas sacar <b>${needed.toFixed(2)}</b> en el Tercer Corte (40%) para cerrar en ${target}.`;
                    resultBox.style.border = "1px solid #fcc419";
                }
            }
            // Scenario 3: All grades present -> Final Calculation
            else if (!isNaN(c1) && !isNaN(c2) && !isNaN(c3)) {
                const final = (c1 * 0.3) + (c2 * 0.3) + (c3 * 0.4);
                display.textContent = final.toFixed(2);

                if (final >= target) {
                    display.style.color = "#51cf66";
                    feedback.textContent = `¡Objetivo Cumplido! 🎉 (Meta: ${target})`;
                    resultBox.style.border = "1px solid #51cf66";
                } else {
                    display.style.color = "#ff6b6b";
                    feedback.textContent = `No alcanzaste el objetivo de ${target}. 😢`;
                    resultBox.style.border = "1px solid #ff6b6b";
                }
            } else {
                feedback.textContent = "Ingresa al menos la nota del Primer Corte para proyectar.";
            }
        });

        resetBtn.addEventListener('click', () => {
            document.getElementById('note-c1').value = '';
            document.getElementById('note-c2').value = '';
            document.getElementById('note-c3').value = '';
            document.getElementById('note-target').value = '3.0';
            display.textContent = '---';
            display.style.color = 'var(--text-gray)';
            feedback.textContent = 'Ingresa tus notas para ver el resultado';
            resultBox.style.border = "1px solid rgba(0,0,0,0.05)";
        });
    }

    // Init Data Fetch (Restored)
    fetchEconomicIndicators();

});
