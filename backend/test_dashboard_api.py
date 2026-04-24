import requests
import json

try:
    url = "http://localhost:8000/admin/dashboard/data"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Find AI ML course
        found = False
        for dept in data:
            for course in dept['courses']:
                if "AI ML" in course['name']:
                    print(f"Found Course: {course['name']}")
                    print(f"ID: {course['id']}")
                    print(f"Reference Uploaded: {course['referenceUploaded']}")
                    found = True
        if not found:
            print("Course 'AI ML' not found in dashboard response.")
    else:
        print(f"Failed to fetch data: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
