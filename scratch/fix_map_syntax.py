import sys

file_path = r"d:\xampp\htdocs\kopasus\src\components\map\MapComponent.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 1472 was fixed in a previous turn
# Let's verify what's there now.
# Actually I'll just rewrite the whole block from 1313 to 1507 to be sure.

# 1313 is index 1312
# 1507 is index 1506
start_idx = 1312
end_idx = 1506

# I'll find the indices dynamically to be safer.
# Find "{opActiveTab === 'Informasi' ? ("
found_start = -1
for i, line in enumerate(lines):
    if "{opActiveTab === 'Informasi' ? (" in line:
        found_start = i
        break

# Find ") : activeModal === 'INTEL_DETAIL' && selectedIntel ? ("
found_end = -1
for i, line in enumerate(lines):
    if ") : activeModal === 'INTEL_DETAIL' && selectedIntel ? (" in line:
        found_end = i
        break

if found_start != -1 and found_end != -1:
    print(f"Found start at {found_start} and end at {found_end}")
    
    # We want to replace from found_start to found_end - 1
    # Actually I'll just write a clean block.
    
    # I'll read the content between them to preserve what I can? 
    # No, I have the logic.
    
    pass
else:
    print("Could not find boundaries")
    sys.exit(1)

# I'll just use a more surgical fix for the specific lines.
# Line 1506 (index 1505) in current file: "                   </div>"
# Line 1507 (index 1506) in current file: "                ) : activeModal === 'INTEL_DETAIL' && selectedIntel ? ("

lines[found_end-1] = "                     ) : null}\n"
lines[found_end] = "                  </div>\n                ) : activeModal === 'INTEL_DETAIL' && selectedIntel ? (\n"

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Syntax fixed successfully")
