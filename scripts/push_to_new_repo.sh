#!/usr/bin/env sh
# Usage: ./scripts/push_to_new_repo.sh git@github.com:CarlosATO/Panel_accesos_Somyl.git
# Adds a new remote called 'new-origin' (or update if exists) and pushes current branch.

if [ -z "$1" ]; then
  echo "Error: must pass the git remote URL as first argument"
  echo "Example: ./scripts/push_to_new_repo.sh git@github.com:CarlosATO/Panel_accesos_Somyl.git"
  exit 1
fi

REMOTE_URL="$1"
REMOTE_NAME="new-origin"

if git remote | grep -q "^${REMOTE_NAME}$"; then
  echo "Remote ${REMOTE_NAME} exists — updating URL"
  git remote set-url ${REMOTE_NAME} ${REMOTE_URL}
else
  echo "Adding remote ${REMOTE_NAME} -> ${REMOTE_URL}"
  git remote add ${REMOTE_NAME} ${REMOTE_URL}
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing branch ${BRANCH} to ${REMOTE_NAME}"
git push -u ${REMOTE_NAME} ${BRANCH}

echo "Done. If you get permission errors, create the target repo in GitHub and ensure you have push access."
