#!/usr/bin/env bash
# Run a Gradle build task with stacktrace and write a timestamped log.
# Usage: scripts/run_gradle_build.sh /path/to/project [task]
set -u
PROJECT_DIR="${1:-.}"
TASK="${2:-assembleDebug}"
STAMP="$(date +%Y%m%d_%H%M%S)"
LOG_DIR="${ANDROID_BUILD_LOG_DIR:-/mnt/data}"
LOG_FILE="$LOG_DIR/android_gradle_${STAMP}.log"

cd "$PROJECT_DIR" || exit 2

if [ -x "./gradlew" ]; then
  GRADLE_CMD=("./gradlew")
elif command -v gradle >/dev/null 2>&1; then
  GRADLE_CMD=("gradle")
else
  echo "No Gradle wrapper or gradle command found." | tee "$LOG_FILE"
  exit 127
fi

mkdir -p "$LOG_DIR"
echo "Project: $(pwd)" | tee "$LOG_FILE"
echo "Task: $TASK" | tee -a "$LOG_FILE"
echo "Command: ${GRADLE_CMD[*]} $TASK --stacktrace --warning-mode all" | tee -a "$LOG_FILE"
"${GRADLE_CMD[@]}" "$TASK" --stacktrace --warning-mode all 2>&1 | tee -a "$LOG_FILE"
STATUS=${PIPESTATUS[0]}
echo "Gradle exit status: $STATUS" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
exit "$STATUS"
