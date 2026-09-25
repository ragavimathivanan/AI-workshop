#!/usr/bin/env bash
# ============================================================
# FarmConnect ML Models – Virtual Environment Setup
# Run this once to create the .venv and install dependencies.
# ============================================================
# Usage (Windows PowerShell):
#   cd ml_models
#   python -m venv .venv
#   .\.venv\Scripts\Activate.ps1
#   pip install -r requirements.txt
#
# Usage (Linux / macOS):
#   cd ml_models && python3 -m venv .venv && source .venv/bin/activate
#   pip install -r requirements.txt
# ============================================================
#
# The .venv directory is listed in .gitignore and will NOT be
# committed to source control or deployed to Vercel.
# Vercel runs Node.js only; Python models are called via
# child_process.spawn() from aiRoutes.js or run separately.
