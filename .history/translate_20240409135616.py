import json

def print_dependencies(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
        dependencies = data.get('dependencies', {})
        for package, info in dependencies.items():
            print(f"Package: {package}, Version: {info['version']}")

print_dependencies('package-lock.json')