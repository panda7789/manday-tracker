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

## License

MIT License - see [LICENSE](LICENSE) file for details.
