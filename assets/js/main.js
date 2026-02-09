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
    initProfessorGrid();

    function initProfessorGrid() {
        const container = document.getElementById('professors-container');
        if (!container || typeof subjectData === 'undefined') return;

        // Extract unique professors
        const allProfs = new Set();
        Object.values(subjectData).forEach(data => {
            if (data.professors) {
                data.professors.forEach(p => allProfs.add(p));
            }
        });

        // Convert to array and sort
        const sortedProfs = Array.from(allProfs).sort();

        sortedProfs.forEach(pName => {
            const card = document.createElement('div');
            card.className = 'professor-card clickable'; // Add clickable class for pointer cursor
            card.innerHTML = `
                <div class="prof-icon"><i class="fas fa-user-tie"></i></div>
                <h4>${pName}</h4>
                <p>Docente</p>
                <div class="prof-subjects-hint" style="font-size: 0.75rem; color: var(--primary-light); margin-top:0.5rem;">Ver Materias <i class="fas fa-chevron-right"></i></div>
            `;

            // Add Click Event
            card.addEventListener('click', () => {
                showProfessorDetails(pName);
            });

            container.appendChild(card);
        });
    }

    function showProfessorDetails(pName) {
        // Find all subjects taught by this professor
        const taughtSubjects = [];
        Object.keys(subjectData).forEach(key => {
            const data = subjectData[key];
            if (data.professors && data.professors.includes(pName)) {
                // Find subject name from DOM if possible, or use ID
                const subjectElement = document.getElementById(key);
                const subjectName = subjectElement ? subjectElement.innerText.split('\n')[0].trim() : key.toUpperCase();
                taughtSubjects.push({ name: subjectName, code: data.code });
            }
        });

        // Use standard modal to show info
        const modal = document.getElementById('subject-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const modalCredits = document.getElementById('modal-credits');
        const modalCode = document.getElementById('modal-code');
        const prereqList = document.getElementById('modal-prereqs');
        const profSection = document.getElementById('modal-profs-section'); // We might hide this or reuse

        // Set Content
        modalTitle.textContent = pName;
        modalCode.textContent = "Docente"; // Or blank
        modalCredits.textContent = "";

        // Build List of Subjects
        let subjectsHtml = '<ul style="list-style: none; padding: 0;">';
        if (taughtSubjects.length > 0) {
            taughtSubjects.forEach(sub => {
                subjectsHtml += `<li style="margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.25rem;">
                    <strong>${sub.name}</strong> <span class="badge" style="font-size: 0.7em;">${sub.code}</span>
                </li>`;
            });
            subjectsHtml += '</ul>';
        } else {
            subjectsHtml = '<p>No hay materias asignadas en el registro actual.</p>';
        }

        modalDesc.innerHTML = `<p>Materias impartidas en el periodo actual:</p>${subjectsHtml}`;

        // Clear other fields
        prereqList.innerHTML = '';
        if (profSection) profSection.innerHTML = '';

        modal.style.display = 'flex';
    }

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
                if (selectionMode) return; // Prevent modal if selecting for Excel

                const subjectId = card.id;
                const prereqs = card.dataset.prereqs ? card.dataset.prereqs.split(' ') : [];
                const description = card.dataset.desc || "Información del plan de estudios.";
                // Get title safely (first text node)
                const title = card.childNodes[0].textContent.trim();
                const credits = card.querySelector('.badge') ? card.querySelector('.badge').textContent : '';

                // Get Real Data if available
                let realCode = '---';
                let realProfs = [];

                if (typeof subjectData !== 'undefined' && subjectData[subjectId]) {
                    realCode = subjectData[subjectId].code;
                    realProfs = subjectData[subjectId].professors || [];
                }

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
                document.getElementById('modal-code').textContent = realCode;

                const prereqList = document.getElementById('modal-prereqs');
                prereqList.innerHTML = '';

                // Add Professors to Modal (Dynamically created if not exists)
                let profSection = document.getElementById('modal-profs-section');
                if (!profSection) {
                    profSection = document.createElement('div');
                    profSection.id = 'modal-profs-section';
                    profSection.className = 'modal-section mt-1';
                    // Insert after description
                    document.getElementById('modal-desc').after(profSection);
                }

                if (realProfs.length > 0) {
                    profSection.innerHTML = `<h4><i class="fas fa-chalkboard-teacher"></i> Docente(s):</h4><p>${realProfs.join(', ')}</p>`;
                } else {
                    profSection.innerHTML = '';
                }


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

    // --- 7. Scroll to Top Logic ---
    const scrollBtn = document.getElementById('scrollToTop');

    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 8. Desktop Curriculum Scroll ---
    const scrollLeftBtn = document.getElementById('scrollLeftBtn');
    const scrollRightBtn = document.getElementById('scrollRightBtn');
    const curriculumGrid = document.getElementById('curriculum-grid');

    if (scrollLeftBtn && scrollRightBtn && curriculumGrid) {
        scrollLeftBtn.addEventListener('click', () => {
            curriculumGrid.scrollBy({ left: -400, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            curriculumGrid.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    // --- 9. Copy Code Feature ---
    const copyBtn = document.getElementById('copy-code-btn');
    const codeBadge = document.getElementById('modal-code');

    if (copyBtn && codeBadge) {
        copyBtn.addEventListener('click', () => {
            const code = codeBadge.textContent;
            navigator.clipboard.writeText(code).then(() => {
                // Feedback
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    // --- 10. Prematricula Generator ---
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

    // 10.1 Toggle Selection Mode
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener('click', () => {
            selectionMode = !selectionMode;
            toggleModeBtn.classList.toggle('active');

            if (selectionMode) {
                toggleModeBtn.innerHTML = '<i class="fas fa-check-square"></i> Finalizar Selección';
                document.body.classList.add('selection-active');

                // Show toast
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 4000);
                }
            } else {
                toggleModeBtn.innerHTML = '<i class="far fa-square-check"></i> Generar Prematrícula';
                document.body.classList.remove('selection-active');
                floatingBar.classList.remove('visible');
                selectedSubjects.clear();
                updateSelectionVisuals();
                if (toast) toast.classList.remove('show');
            }
        });
    }

    // 10.2 Selection Logic (Intercepting Clicks)
    // We modify the existing Subject Card click listener logic by checking selectionMode
    // *IMPORTANT*: This logic needs to be integrated into the existing listener (Section 5.3 in code roughly)
    // For now, let's attach a specific listener that handles it if mode is active.

    // We need to re-select cards because they are static
    const allCards = document.querySelectorAll('.subject-card');

    allCards.forEach(card => {
        // Remove existing listener to avoid conflict? No, let's just handle it.
        // We will assume the modal opening logic checks for a flag or we preventDefault.

        card.addEventListener('click', (e) => {
            if (!selectionMode) return; // Normal modal behavior, controlled elsewhere

            e.stopPropagation(); // Stop modal from opening

            const id = card.id;
            const name = card.childNodes[0].nodeValue.trim(); // Text node
            const creditsMatch = card.querySelector('.badge').textContent.match(/\d+/);
            const credits = creditsMatch ? creditsMatch[0] : '0';
            const code = card.querySelector('.badge-outline') ? card.querySelector('.badge-outline').textContent : '---';

            // Toggle
            if (selectedSubjects.has(id)) {
                selectedSubjects.delete(id);
                card.classList.remove('selected');
            } else {
                selectedSubjects.add(id);
                // Store data in DOM or object map? We can reconstruct from ID/DOM content
                card.dataset.selName = name;
                card.dataset.selCode = code;
                card.dataset.selCredits = credits;

                card.classList.add('selected');
            }

            updateFloatingBar();
        }, true); // Capture phase to beat the modal listener? Or just put check in modal listener.
    });

    // Better Approach: Modify the existing listener at line ~90. 
    // Since I can't easily rewrite that whole block, I will use capture phase here to stop propagation if mode is active.

    function updateFloatingBar() {
        if (selectedSubjects.size > 0) {
            floatingBar.classList.add('visible');
            selectedCountSpan.textContent = `${selectedSubjects.size} materias seleccionadas`;
        } else {
            floatingBar.classList.remove('visible');
        }
    }

    // 10.3 Cancel Selection
    const cancelBtn = document.getElementById('btn-cancel-selection');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('¿Cancelar selección y salir?')) {
                selectionMode = false;
                toggleModeBtn.click(); // Re-triggers the toggle logic to reset UI
            }
        });
    }

    // 10.4 Update Visuals
    function updateSelectionVisuals() {
        const allCards = document.querySelectorAll('.subject-card');
        allCards.forEach(c => c.classList.remove('selected'));
        if (selectedCountSpan) selectedCountSpan.textContent = "0 materias seleccionadas";
        if (floatingBar) floatingBar.classList.remove('visible');
    }

    // 10.3 Form Handling
    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => {
            formModal.style.display = 'flex';
        });
    }

    if (formClose) {
        formClose.addEventListener('click', () => {
            formModal.style.display = 'none';
        });
    }

    // 10.4 Excel Generation
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const apellido = document.getElementById('pm-apellidos').value.toUpperCase();
            const nombre = document.getElementById('pm-nombres').value.toUpperCase();
            const codigo = document.getElementById('pm-codigo').value;
            const celular = document.getElementById('pm-celular').value;

            generateExcel({ apellido, nombre, codigo, celular });
            formModal.style.display = 'none';
        });
    }

    async function generateExcel(user) {
        try {
            // 1. Fetch the official template
            const response = await fetch('resources/FORMATO DE PREMATRICULA PARA EL PERIODO 2026-01.xlsx');
            if (!response.ok) throw new Error("No se pudo cargar el formato base.");
            const arrayBuffer = await response.arrayBuffer();

            // 2. Read the workbook
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsName = wb.SheetNames[0];
            const ws = wb.Sheets[wsName];

            // 3. Helper to write to cell safely
            function updateCell(col, row, value) {
                const cellRef = XLSX.utils.encode_cell({ c: col, r: row }); // 0-indexed cols/rows
                if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' }; // Create if missing
                ws[cellRef].v = value;
            }

            // 4. Fill Student Data (Based on image analysis of the format)
            // APELLIDOS -> C3 (Row index 2, Col index 2)
            // NOMBRES -> C4 (Row index 3, Col index 2)
            // CODIGO -> D5 (Row index 4, Col index 3) - Adjusted based on likely merge
            // CELULAR -> D6 (Row index 5, Col index 3)

            // Let's stick to the cells defined in previous attempt but mapped to likely real positions
            // Inspection of image:
            // "APELLIDOS:" is B3. Input is C3 (merged C3:E3 probably).
            updateCell(2, 2, user.apellido); // C3
            updateCell(2, 3, user.nombre);   // C4
            updateCell(3, 4, user.codigo);   // D5 (Assuming "CODIGO:" is C5)
            updateCell(3, 5, user.celular);  // D6

            // 5. Fill Subjects (Starting Row 8 -> Index 7 is Header, so Data starts Row 9 -> Index 8)
            // Format has rows 1 to 10 pre-numbered.
            // "No." is B8. "ASIGNATURAS" is C8. "CODIGO" is D8, etc.
            // Items start at Row 9 (Index 8).

            let rowIndex = 8; // Row 9
            selectedSubjects.forEach(id => {
                const card = document.getElementById(id);
                const name = card.dataset.selName;
                const code = card.dataset.selCode;
                const creds = card.dataset.selCredits;

                // Col C: Asignatura (Index 2)
                updateCell(2, rowIndex, name);
                // Col E: Codigo (Index 4) - Wait, image says "CODIGO" is after Asignaturas.
                // Image Header: No | Asignaturas | CODIGO | GRUPO | CREDITOS
                // A | B | C | D | E? | F?
                // Let's assume standard layout:
                // B: No, C: Name, D: Code, E: Group, F: Credits

                updateCell(3, rowIndex, code);     // D
                updateCell(5, rowIndex, parseInt(creds)); // F (Index 5)

                rowIndex++;
            });

            // 6. Export
            XLSX.writeFile(wb, `Prematricula_${user.apellido}_2026.xlsx`);

            // Reset UI
            selectionMode = false;
            toggleModeBtn.click();

        } catch (error) {
            console.error(error);
            alert("Error generando el archivo. Verifica que el formato base exista en 'resources/'.");
        }
    }

    // --- 11. Dynamic Calendar Logic ---
    const timelineTrack = document.getElementById('timeline-track');
    const countdownContainer = document.getElementById('calendar-countdown');
    const nextEventLabel = document.getElementById('next-event-name');

    // Calendar Data (Updated with Official 2026-1 Dates)
    // NOTE: Added T12:00:00 to prevent Timezone shift (UTC -> Local) showing previous day
    const academicEvents = [
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

    if (timelineTrack && countdownContainer) {
        let nextEvent = null;
        const today = new Date(); // Use real date

        // 11.1 Render Timeline
        timelineTrack.innerHTML = '';
        academicEvents.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        academicEvents.forEach(evt => {
            const evtDate = new Date(evt.date);
            const isPast = evtDate < today;

            // Determine Next Event
            if (!nextEvent && !isPast) {
                nextEvent = evt;
            }

            const item = document.createElement('div');
            item.className = `timeline-item ${!isPast && evt === nextEvent ? 'active-event' : ''}`;
            item.innerHTML = `
                <span class="timeline-date">${evtDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                <span class="timeline-title">${evt.title}</span>
            `;
            timelineTrack.appendChild(item);
        });

        // 11.2 Start Countdown
        if (nextEvent) {
            nextEventLabel.textContent = `Para: ${nextEvent.title}`;
            updateCountdown(nextEvent.date);
            setInterval(() => updateCountdown(nextEvent.date), 1000 * 60); // Update every minute
        } else {
            nextEventLabel.textContent = "Semestre Finalizado";
            countdownContainer.innerHTML = "00 <span style='font-size:1rem'>días</span>";
        }
    }

    function updateCountdown(targetDateStr) {
        const target = new Date(targetDateStr).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff < 0) {
            countdownContainer.innerHTML = "00 d 00 h";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        countdownContainer.innerHTML = `
            <span class="days">${days}</span> días <span class="hours">${hours}</span> hrs
        `;
    }

    // Init Data Fetch (Restored)
    fetchEconomicIndicators();

});
