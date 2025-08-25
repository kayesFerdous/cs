#!/usr/bin/env python3
"""
Test script for rate limiting functionality.
Run this while your backend server is running to test DDoS protection.
"""

import requests
import time
import json
from concurrent.futures import ThreadPoolExecutor
import threading

BASE_URL = "http://localhost:8000"

def test_single_request():
    """Test a single scan request."""
    try:
        response = requests.post(
            f"{BASE_URL}/scan",
            json={"payload": "test payload"},
            timeout=5
        )
        return {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "content": response.json() if response.status_code != 429 else response.text
        }
    except Exception as e:
        return {"error": str(e)}

def stress_test(num_requests=50, delay=0.1):
    """Send multiple requests rapidly to trigger rate limiting."""
    print(f"\n🚀 Sending {num_requests} requests with {delay}s delay...")
    
    results = {"success": 0, "rate_limited": 0, "errors": 0}
    
    for i in range(num_requests):
        result = test_single_request()
        
        if "error" in result:
            results["errors"] += 1
            print(f"❌ Request {i+1}: ERROR - {result['error']}")
        elif result["status_code"] == 429:
            results["rate_limited"] += 1
            print(f"🚫 Request {i+1}: RATE LIMITED")
            if i == 0:  # Print details for first rate limit
                print(f"   Response: {result['content']}")
        elif result["status_code"] == 200:
            results["success"] += 1
            headers = result.get("headers", {})
            remaining = headers.get("X-RateLimit-Remaining", "?") if isinstance(headers, dict) else "?"
            print(f"✅ Request {i+1}: SUCCESS (remaining: {remaining})")
        else:
            results["errors"] += 1
            print(f"⚠️  Request {i+1}: HTTP {result['status_code']}")
        
        time.sleep(delay)
    
    print(f"\n📊 Results: {results}")
    return results

def concurrent_test(num_threads=5, requests_per_thread=10):
    """Test with concurrent requests from multiple threads."""
    print(f"\n🔥 Concurrent test: {num_threads} threads, {requests_per_thread} requests each")
    
    results = {"success": 0, "rate_limited": 0, "errors": 0}
    lock = threading.Lock()
    
    def worker(thread_id):
        for i in range(requests_per_thread):
            result = test_single_request()
            
            with lock:
                if "error" in result:
                    results["errors"] += 1
                elif result["status_code"] == 429:
                    results["rate_limited"] += 1
                elif result["status_code"] == 200:
                    results["success"] += 1
                else:
                    results["errors"] += 1
            
            time.sleep(0.05)  # Small delay
    
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(worker, i) for i in range(num_threads)]
        for future in futures:
            future.result()
    
    print(f"📊 Concurrent results: {results}")
    return results

def check_rate_limit_stats():
    """Check current rate limiting statistics."""
    try:
        response = requests.get(f"{BASE_URL}/rate-limit-stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print("\n📈 Rate Limiter Stats:")
            print(json.dumps(stats, indent=2))
        else:
            print(f"❌ Failed to get stats: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting stats: {e}")

def main():
    print("🔒 WebShield Rate Limiting Test")
    print("=" * 40)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server not responding properly")
            return
        print("✅ Server is running")
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Make sure your backend is running on http://localhost:8000")
        return
    
    # Initial stats
    check_rate_limit_stats()
    
    # Test 1: Normal usage (should work)
    print("\n🧪 Test 1: Normal usage (10 requests, 1s delay)")
    stress_test(num_requests=10, delay=1.0)
    
    # Test 2: Rapid requests (should trigger rate limiting)
    print("\n🧪 Test 2: Rapid requests (25 requests, 0.1s delay)")
    stress_test(num_requests=25, delay=0.1)
    
    # Test 3: Concurrent requests (should trigger rate limiting)
    print("\n🧪 Test 3: Concurrent requests")
    concurrent_test(num_threads=3, requests_per_thread=8)
    
    # Final stats
    check_rate_limit_stats()
    
    print("\n✨ Test completed!")
    print("Tips:")
    print("- Scan endpoint: max 20 requests/minute")
    print("- Other endpoints: max 100 requests/minute") 
    print("- Blocked IPs are released after 5-15 minutes")

if __name__ == "__main__":
    main()
