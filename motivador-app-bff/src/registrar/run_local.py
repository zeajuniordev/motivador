#!/usr/bin/env python3
import json
from app import lambda_handler

def main():
    with open('event_local.json', 'r') as f:
        event = json.load(f)
    resp = lambda_handler(event, None)
    print(json.dumps(resp, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
