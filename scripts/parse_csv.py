
import csv
import json
import os

def parse_csv(file_path):
    plans = []
    current_plan = None
    current_semester = None
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        
        for row in reader:
            if not row or all(not cell.strip() for cell in row):
                continue
                
            first_cell = row[0].strip()
            
            # Detect Plan Header
            if "PLAN DE ESTUDIOS" in first_cell:
                current_plan = {"name": first_cell, "semesters": []}
                plans.append(current_plan)
                current_semester = None
                continue
                
            # Detect Semester Header
            if "semestre" in first_cell.lower() or "semeste" in first_cell.lower(): 
                current_semester = {"name": first_cell, "subjects": []}
                if current_plan:
                    current_plan["semesters"].append(current_semester)
                continue
                
            # Detect Table Headers (Skip)
            if "Materias" in first_cell:
                continue
                
            # Parse Subject Row
            if current_semester is not None:
                # Expected format based on CSV: Name; Credits; Professor; Empty; Prereq
                # Adjusting based on row length
                subject = {
                    "name": row[0].strip(),
                    "credits": row[1].strip() if len(row) > 1 else "",
                    "professor": row[2].strip() if len(row) > 2 else "",
                    "prerequisites": row[4].strip() if len(row) > 4 else ""
                }
                
                # Handling shared professors or extra columns vaguely
                if len(row) > 3 and row[3].strip(): # sometimes simple extra data?
                     pass 

                current_semester["subjects"].append(subject)

    return {"plans": plans}

output_data = parse_csv('Libro1.csv')

# Ensure assets directory exists
os.makedirs('assets/data', exist_ok=True)

with open('assets/data/plan_estudios.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print("JSON generation complete: assets/data/plan_estudios.json")
