#!/usr/bin/env python3
"""
URL Encoding Utility for NestJS Filter Testing
Helps generate URL-encoded filter queries for GET endpoint testing
"""

import json
import urllib.parse
import sys

def encode_filter(filter_obj):
    """Encode a filter object for URL query string"""
    filter_json = json.dumps(filter_obj, separators=(',', ':'))
    return urllib.parse.quote(filter_json)

def decode_filter(encoded_filter):
    """Decode a URL-encoded filter back to JSON"""
    filter_json = urllib.parse.unquote(encoded_filter)
    return json.loads(filter_json)

# Predefined test filters
TEST_FILTERS = {
    'simple': {
        "field": "role",
        "operator": "eq", 
        "value": "developer"
    },
    'age_range': {
        "field": "age",
        "operator": "between",
        "value": [25, 30]
    },
    'active_devs': {
        "and": [
            {
                "field": "isActive",
                "operator": "eq",
                "value": True
            },
            {
                "field": "role",
                "operator": "eq",
                "value": "developer"
            }
        ]
    },
    'complex': {
        "or": [
            {
                "and": [
                    {
                        "field": "role",
                        "operator": "eq",
                        "value": "developer"
                    },
                    {
                        "field": "age",
                        "operator": "gt",
                        "value": 25
                    }
                ]
            },
            {
                "field": "role",
                "operator": "eq",
                "value": "manager"
            }
        ]
    }
}

def generate_curl_command(filter_name, base_url="http://localhost:3000"):
    """Generate a complete curl command for testing"""
    if filter_name not in TEST_FILTERS:
        available = ', '.join(TEST_FILTERS.keys())
        return f"Error: Filter '{filter_name}' not found. Available: {available}"
    
    filter_obj = TEST_FILTERS[filter_name]
    encoded = encode_filter(filter_obj)
    
    curl_cmd = f'curl "{base_url}/users/filter?filter={encoded}&page=1&limit=10"'
    return curl_cmd

def main():
    if len(sys.argv) < 2:
        print("URL Encoding Utility for NestJS Filter Testing")
        print("=" * 50)
        print("\nUsage:")
        print("  python3 url-encode.py <command> [args...]")
        print("\nCommands:")
        print("  encode <json>     - Encode JSON filter for URL")
        print("  decode <encoded>  - Decode URL-encoded filter")
        print("  test <filter>     - Generate test curl command")
        print("  list              - List predefined test filters")
        print("\nExamples:")
        print('  python3 url-encode.py encode \'{"field":"age","operator":"gt","value":30}\'')
        print("  python3 url-encode.py test simple")
        print("  python3 url-encode.py list")
        return
    
    command = sys.argv[1]
    
    if command == "encode":
        if len(sys.argv) < 3:
            print("Error: JSON filter required")
            return
        try:
            filter_obj = json.loads(sys.argv[2])
            encoded = encode_filter(filter_obj)
            print(f"Encoded: {encoded}")
            print(f"\nFull URL: http://localhost:3000/users/filter?filter={encoded}")
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON - {e}")
    
    elif command == "decode":
        if len(sys.argv) < 3:
            print("Error: Encoded filter required")
            return
        try:
            decoded = decode_filter(sys.argv[2])
            print(f"Decoded: {json.dumps(decoded, indent=2)}")
        except Exception as e:
            print(f"Error: Could not decode - {e}")
    
    elif command == "test":
        if len(sys.argv) < 3:
            print("Error: Filter name required")
            print(f"Available filters: {', '.join(TEST_FILTERS.keys())}")
            return
        filter_name = sys.argv[2]
        curl_cmd = generate_curl_command(filter_name)
        print(f"Test command for '{filter_name}':")
        print(f"{curl_cmd}")
        print(f"\nFilter JSON:")
        if filter_name in TEST_FILTERS:
            print(json.dumps(TEST_FILTERS[filter_name], indent=2))
    
    elif command == "list":
        print("Predefined Test Filters:")
        print("=" * 25)
        for name, filter_obj in TEST_FILTERS.items():
            print(f"\n{name}:")
            print(f"  {json.dumps(filter_obj, separators=(',', ':'))}")
            print(f"  Curl: python3 url-encode.py test {name}")
    
    else:
        print(f"Error: Unknown command '{command}'")
        print("Use 'python3 url-encode.py' for help")

if __name__ == "__main__":
    main()
