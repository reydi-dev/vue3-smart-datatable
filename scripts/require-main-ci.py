"""Fail deployment unless the exact main commit has a successful push CI run."""
import json
import os
import urllib.parse
import urllib.request

if os.environ.get('GITHUB_REF') != 'refs/heads/main':
    raise SystemExit('Pages deployment is restricted to main')
sha = os.environ['GITHUB_SHA']
query = urllib.parse.urlencode({'head_sha': sha, 'branch': 'main', 'event': 'push', 'status': 'success'})
url = f"{os.environ['GITHUB_API_URL']}/repos/{os.environ['GITHUB_REPOSITORY']}/actions/workflows/ci.yml/runs?{query}"
request = urllib.request.Request(url, headers={'Authorization': f"Bearer {os.environ['GH_TOKEN']}", 'Accept': 'application/vnd.github+json'})
with urllib.request.urlopen(request, timeout=30) as response:
    runs = json.load(response)['workflow_runs']
if not any(run['head_sha'] == sha and run['conclusion'] == 'success' for run in runs):
    raise SystemExit('The exact main commit must pass CI before Pages deployment')
print(f'Confirmed successful push CI for main commit {sha}')
