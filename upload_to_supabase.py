import json
import os
import urllib.request
import urllib.error
import time

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://pndvjkcoroadxonvpphb.supabase.co")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZHZqa2Nvcm9hZHhvbnZwcGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjMyODM3NywiZXhwIjoyMTA3OTA0Mzc3fQ.Bc9fknYzgGsLV_6G_0ySah12_ZqjGur69kWt79QBXFM")

JSON_PATH = "/Users/vishalyadav/Projects/RD-Dashboard/cleaned_dataset.json"

def post_batch(table, batch):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    data = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return True, resp.status
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode('utf-8')}"
    except Exception as e:
        return False, str(e)

def upload_all():
    if not os.path.exists(JSON_PATH):
        print(f"File not found: {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    print(f"Connecting to Supabase at: {SUPABASE_URL}")
    
    for table, records in payload.items():
        if not records:
            continue
        print(f"\n--- Uploading {table} ({len(records)} records) ---")
        batch_size = 100
        success_count = 0
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            ok, res = post_batch(table, batch)
            if ok:
                success_count += len(batch)
                print(f"  Uploaded {success_count}/{len(records)} to {table}...")
            else:
                print(f"  Error uploading batch to {table}: {res}")
                # Stop if table doesn't exist yet
                if "404" in str(res) or "relation" in str(res).lower():
                    print(f"  Table '{table}' might not exist yet. Please run the SQL schema in Supabase first.")
                    break
            time.sleep(0.1)

if __name__ == '__main__':
    upload_all()
