# Manday Tracker

A simple command-line utility for tracking time spent on tasks and calculating work effort in mandays.

## Features

- ✅ Track time spent on multiple tasks
- ✅ Automatic manday calculation (1 manday = 8 hours)
- ✅ Switch between active tasks
- ✅ View summary of all tasks with totals
- ✅ Persistent storage (JSON file)

## Installation

### Option 1: Global Installation (Recommended)

```bash
npm install -g .
```

After installation, you can use the `md` command from anywhere.

### Option 2: Local Installation with PowerShell Alias

For PowerShell users (Windows):

```powershell
# Add to your PowerShell profile (~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1)
Remove-Item Alias:md -Force -ErrorAction SilentlyContinue
function md { node C:\path\to\directory\md.js $args }
```

**Note:** The `md` command is a built-in alias for `mkdir` in PowerShell. After adding to your profile, `md` will run the manday tracker. To create directories, use `mkdir` or `New-Item`.

### Option 3: Direct Execution

```bash
node md.js <parameters>
```

## Usage

### Basic Commands

**Add time to active task:**
```bash
md 2:15    # Add 2 hours 15 minutes
md 0:30    # Add 30 minutes
md 8:00    # Add a full workday
```

**Show summary:**
```bash
md         # Display all tasks and their mandays
```

**Switch to another task:**
```bash
md switch PROJ-123      # Switch to task PROJ-123
md switch development   # Switch to task development
```

**Delete a task:**
```bash
md delete PROJ-123   # Delete task PROJ-123 from list (can also use 'del' or 'rm')
md del PROJ-123      # Short alias for delete
md rm PROJ-123       # Another alias for delete
```

**Reset tasks:**
```bash
md reset             # Clear all tasks (start fresh)
md reset PROJ-123    # Reset task PROJ-123 to 0:00 (keeps it in list)
```

**Help:**
```bash
md help
```

## Example Workflow

```bash
# Day 1 - Start working on a project
md 3:30                # Add 3:30 to default task
                       # Total time: 3:30, Mandays: 0.438 MD

# Continue in the afternoon
md 4:15                # Add more time
                       # Total time: 7:45, Mandays: 0.969 MD

# Day 2 - Different project
md switch PROJ-456     # Switch to new task
md 2:00                # Add 2 hours to PROJ-456

# View summary
md
# Output:
# === TASK OVERVIEW ===
# 
# default
#   Time: 7:45
#   Mandays: 0.969 MD (0.97 MD)
# 
# PROJ-456 ← ACTIVE
#   Time: 2:00
#   Mandays: 0.250 MD (0.25 MD)
# 
# --- TOTAL ---
#   Time: 9:45
#   Mandays: 1.219 MD (1.22 MD)
```

## Data Storage

Data is stored in a `mandays.json` file in the same directory as the script.

Structure:
```json
{
  "tasks": {
    "default": 465,
    "PROJ-456": 120
  },
  "activeTask": "PROJ-456"
}
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Created as a simple personal utility for tracking project time.
