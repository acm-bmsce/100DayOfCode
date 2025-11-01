import requests
import csv
import os

# --- CONFIGURATION ---
# 1. This is your deployed backend URL
API_URL = "https://backend-hono.acm-30b.workers.dev" 

# 2. IMPORTANT: You must fill in your admin password here
#    This is the same password you set as a secret.
ADMIN_PASSWORD = "BMS-ACM-SC-2025" 

# 3. This is the name of the output file
CSV_FILENAME = "username.csv"
# --- END CONFIGURATION ---

def fetch_users():
    """
    Fetches all user data from the protected admin API.
    """
    if ADMIN_PASSWORD == "YOUR_ADMIN_PASSWORD_HERE":
        print("Error: Please open the script and fill in your ADMIN_PASSWORD.")
        return None

    # Set the authentication header
    headers = {
        "Authorization": f"Bearer {ADMIN_PASSWORD}"
    }
    
    # This is the new endpoint you just created
    endpoint = f"{API_URL}/api/admin/all-users-details"

    try:
        print(f"Connecting to {endpoint} ...")
        response = requests.get(endpoint, headers=headers)
        
        # This will raise an error if the request failed (e.g., 401 Unauthorized)
        response.raise_for_status() 
        
        users = response.json()
        
        if not users:
            print("API returned 0 users.")
            return None
            
        return users

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        print(f"Response content: {response.text}")
        if response.status_code == 401:
            print("-> This is an 'Unauthorized' error. Is your ADMIN_PASSWORD correct?")
    except requests.exceptions.RequestException as err:
        print(f"An error occurred: {err}")
    
    return None

def write_to_csv(user_list):
    """
    Writes the list of user dictionaries to a CSV file.
    """
    if not user_list:
        print("No user data to write.")
        return

    # Get the headers from the first user's keys
    headers = user_list[0].keys()
    
    try:
        with open(CSV_FILENAME, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            
            # Write the header row
            writer.writeheader()
            
            # Write all the user rows
            for user in user_list:
                writer.writerow(user)
                
        print(f"\nSuccessfully saved {len(user_list)} users to {CSV_FILENAME}")
        
    except IOError as e:
        print(f"Error writing to CSV file: {e}")

# --- Main execution ---
if __name__ == "__main__":
    user_data = fetch_users()
    
    if user_data:
        write_to_csv(user_data)