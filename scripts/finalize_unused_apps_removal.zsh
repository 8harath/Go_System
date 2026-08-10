#!/bin/zsh
set -euo pipefail

/bin/rm -rf -- \
  '/Users/8harath/.Trash/Unused apps removal 2026-08-03' \
  '/Users/8harath/.Trash/iMovie.app' \
  '/Users/8harath/.Trash/Motion Creator Studio.app' \
  '/Users/8harath/.Trash/Logic Pro Creator Studio.app' \
  '/Users/8harath/.Trash/MainStage Creator Studio.app' \
  '/Users/8harath/.Trash/GarageBand.app' \
  '/Users/8harath/.Trash/Pixelmator Pro Creator Studio.app' \
  '/Users/8harath/.Trash/Keynote Creator Studio.app' \
  '/Users/8harath/.Trash/Compressor Creator Studio.app'

printf '%s\n' 'Unused app and Steam data removal completed.'
