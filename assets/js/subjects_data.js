// Data for Subjects: Code and Professors (Semesters 1-6)
// Extracted from Materias.docx

const subjectData = {
    // Nivel I
    "cat1": { code: "FB49202", professors: ["Claudia Cifuentes"] },
    "txt1": { code: "FN72727", professors: ["Tania Lambraño"] },
    "adm1": { code: "NC2501 / NC2507", professors: ["Rafaela Posso"] },
    "eco1": { code: "NC2509", professors: ["Efraín Cuadro"] },
    "con1": { code: "FP43235", professors: ["Juan Pérez"] },
    "mat1": { code: "FB43164", professors: ["Tiberio Wilches", "José Marrugo"] },
    "ing1": { code: "FN23003", professors: ["Glenis Gamarra", "Alfredo Herazo"] },

    // Nivel II
    "txt2": { code: "AH43164", professors: ["José Gutiérrez"] },
    "der1": { code: "AH43165", professors: ["María Herrazo"] },
    "his1": { code: "IX25106", professors: ["Claudia Cifuentes"] },
    "eti1": { code: "FN72725", professors: ["Vanessa Niño"] },
    "mat2": { code: "NC2502", professors: ["Alcibaldo Miranda", "José Marrugo"] },
    "ing2": { code: "FB43242", professors: ["Glenis Gamarra", "David Ospino"] },

    // Nivel III
    "mac1": { code: "IX25101 / AR43163", professors: ["Efraín Cuadro"] },
    "mic1": { code: "IX2510", professors: ["Robinson Castro"] },
    "his2": { code: "IX25102", professors: ["Claudia Cifuentes"] },
    "est1": { code: "NC2503", professors: ["Gustavo García"] },
    "emat": { code: "IX25103 / FB43171", professors: ["José Marrugo"] },
    "ing3": { code: "FN24035", professors: ["Marcela Pérez"] },

    // Nivel IV
    "inv1": { code: "NC2505", professors: ["Nelson Alvis"] },
    "mac2": { code: "IX25104", professors: ["Dewin Fuentes"] },
    "mic2": { code: "IX25105 / AR43164", professors: ["Rafael Gómez", "Robinson Castro"] },
    "epo1": { code: "IX23105", professors: ["Dewin Fuentes"] },
    "est2": { code: "NC2504", professors: ["Pedro Vega"] },
    "dat1": { code: "IX25107", professors: ["Gustavo Camargo"] },
    "ing4": { code: "FN24036", professors: ["Milton Zambrano", "Alfredo Herazo"] },

    // Nivel V
    "inv2": { code: "IX25108", professors: ["Libardo Canabal"] },
    "mac3": { code: "IX24291", professors: ["Raul Quejada"] },
    "mic3": { code: "IX24292", professors: ["Amaury Jiménez"] },
    "med1": { code: "IX24293", professors: ["Dennis Marrugo"] },
    "fin1": { code: "IX24294", professors: ["Alvaro Álvarez"] },
    "ecom1": { code: "IX24295", professors: ["Robinson Castro", "Gustavo García"] },
    "ing5": { code: "FN24037", professors: ["Rachid Moron", "Cielo Contreras"] },

    // Nivel VI
    "reg1": { code: "AR43170", professors: ["Raul Quejada"] },
    "pen1": { code: "AR43173", professors: ["Amaury Jiménez"] },
    "dat2": { code: "AR43170", professors: ["Gustavo Camargo"] },
    "col1": { code: "AR43172", professors: ["Claudia Cifuentes"] },
    "fin2": { code: "AR43174", professors: ["Alvaro Álvarez"] },
    "ecom2": { code: "FB43173", professors: ["Robinson Castro"] },
    "hum1": { code: "FC72731", professors: ["(Por asignar)"] },
    "ing6": { code: "FB43173", professors: ["Milton Zambrano", "Jairo Pedroza"] }
};

// Export for use in main.js
// If using modules: export default subjectData;
// For vanilla JS without modules, it's global.
window.subjectData = subjectData;
