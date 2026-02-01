#!/bin/bash

# Ralph Wiggum Loop - Autonomous Development Workflow
# Usage: ./loop.sh [plan|build] [--max-iterations N]

set -e

MODE="${1:-build}"
MAX_ITERATIONS=50
ITERATION=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        plan|build)
            MODE="$1"
            shift
            ;;
        --max-iterations)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

echo "=========================================="
echo "Ralph Wiggum Loop"
echo "Mode: $MODE"
echo "Max iterations: $MAX_ITERATIONS"
echo "=========================================="

if [ "$MODE" = "plan" ]; then
    echo "Starting Planning Phase..."
    cat PROMPT_plan.md | claude --dangerously-skip-permissions --verbose 
    echo "Planning phase complete."
    exit 0
fi

if [ "$MODE" = "build" ]; then
    echo "Starting Build Loop..."

    while [ $ITERATION -lt $MAX_ITERATIONS ]; do
        ITERATION=$((ITERATION + 1))
        echo ""
        echo "=========================================="
        echo "Build Iteration: $ITERATION / $MAX_ITERATIONS"
        echo "=========================================="

        # Run claude with the build prompt and capture output
        OUTPUT=$(cat PROMPT_build.md | claude --dangerously-skip-permissions --verbose 2>&1)
        echo "$OUTPUT"

        # Check for completion signals
        if echo "$OUTPUT" | grep -q "BUILD_COMPLETE"; then
            echo ""
            echo "=========================================="
            echo "BUILD_COMPLETE - All tasks finished!"
            echo "Total iterations: $ITERATION"
            echo "=========================================="
            exit 0
        fi

        if echo "$OUTPUT" | grep -q "BLOCKED:"; then
            echo ""
            echo "=========================================="
            echo "BUILD BLOCKED - Manual intervention required"
            echo "=========================================="
            exit 1
        fi

        if echo "$OUTPUT" | grep -q "TASK_COMPLETE"; then
            echo "Task completed. Starting next iteration..."
            sleep 2
        else
            echo "Warning: No completion signal detected. Continuing..."
            sleep 2
        fi
    done

    echo ""
    echo "=========================================="
    echo "Max iterations ($MAX_ITERATIONS) reached."
    echo "Review progress and restart if needed."
    echo "=========================================="
    exit 1
fi

echo "Unknown mode: $MODE"
echo "Usage: ./loop.sh [plan|build] [--max-iterations N]"
exit 1
