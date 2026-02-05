import requests
import re
from datetime import datetime

# Configuration
INDEX_PATH = '../index.html'
DATOS_API_URL = "https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciahasta%20DESC"

def get_trm():
    try:
        response = requests.get(DATOS_API_URL, timeout=10)
        data = response.json()
        if data:
            return float(data[0]['valor'])
    except Exception as e:
        print(f"Error fetching TRM: {e}")
    return None

def update_index_html(trm_value):
    if not trm_value:
        return

    try:
        with open(INDEX_PATH, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update TRM (Placeholder text update, though JS handles live view, this updates the static fallback)
        # Regex to find: TRM (USD): $... <
        # We want to format it as $X.XXX
        formatted_trm = f"${trm_value:,.0f}".replace(",", ".")
        
        # Regex pattern for TRM
        # Matches: TRM (USD): ... <
        pattern = r"(TRM \(USD\): )[^<]+(<)"
        replacement = f"\\1{formatted_trm} \\2"
        
        new_content = re.sub(pattern, replacement, content)
        
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"Updated index.html with TRM: {formatted_trm}")

    except Exception as e:
        print(f"Error updating HTML: {e}")

if __name__ == "__main__":
    print("Starting update script...")
    trm = get_trm()
    if trm:
        update_index_html(trm)
    else:
        print("No data retrieved.")
