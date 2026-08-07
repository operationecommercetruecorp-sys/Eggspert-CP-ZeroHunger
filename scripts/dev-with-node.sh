#!/bin/bash
export PATH="/Users/suns/Desktop/YTL/.tools/node/bin:$PATH"
cd "$(dirname "$0")/.."
exec npm run dev
