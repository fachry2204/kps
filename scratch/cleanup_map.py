
import sys
import re

file_path = r'd:\xampp\htdocs\kopasus\src\components\map\MapComponent.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the literal \\n issue
content = content.replace('\\n', '\n')

# Also fix the marker icon if it has literal \\n
content = content.replace('animate-bounce">\\n', 'animate-bounce">\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup complete")
