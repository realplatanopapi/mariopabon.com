# Exit on first error
set -e

# Helper function for coloring text cuz we fancy like that
# Color variables were stolen from http://stackoverflow.com/a/5947802
function color_text () {
  local END_COLOR='\033[0m'
  echo ${2}${1}${END_COLOR}
}

# Some moar helper functions for coloring text
function text_celebrate () {
  local GREEN='\033[0;32m'
  echo $(color_text "$1" $GREEN)
}

function text_info () {
  local YELLOW='\033[0;34m'
  echo $(color_text "$1" $YELLOW)
}

function text_error () {
  local RED='\033[0;31m'
  echo $(color_text "$1" $RED)
}

# Helper for failing the test
function fail_test () {
  echo "$(text_info "The test failed :/ but don't worry homie, we'll get it right next time!!!") 😬 ❤️ 🦄 💪"
  exit 1
}

echo $(text_info "Starting test.")
echo $(text_info "Running build...")

# Run a build
npm run build && npm run compress

# Check build output
files=("dist/index.html" "dist/styles.css" "dist/app.js" "dist/favicon.ico")

# Iterate over each file
for file in "${files[@]}"
do
  # Check if the file exists
  if ! [ -e ${file} ]; then
    echo "$(text_error ERRRRRRR!!!) Missing file $(text_info $file)."
    fail_test
  fi
done

echo $(text_info "Finished build.")

echo "$(text_celebrate "WOOOOOO it worked!!!")🎉 🎉 🎉 🎉"
