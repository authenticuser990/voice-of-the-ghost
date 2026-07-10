#!/bin/bash
# Start both backend and frontend for development

echo "Starting Voice of the Ghost..."
echo ""

# Kill any existing processes
kill $(lsof -t -i:3000) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1

# Start backend
cd backend
node src/index.js &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Create demo accounts
echo "Creating demo accounts..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"sam","email":"sam@demo.com","password":"password123","role":"SAGE"}' > /dev/null
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@demo.com","password":"password123","role":"HELPSEEKER"}' > /dev/null
echo "✅ Demo accounts ready"

# Start frontend
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "═══════════════════════════════════════════"
echo "  🚀  Voice of the Ghost is RUNNING!"
echo "═══════════════════════════════════════════"
echo ""
echo "  📍  http://localhost:5173"
echo ""
echo "  👤  sam / password123 (Sage)"
echo "  👤  alex / password123 (Help Seeker)"
echo ""
echo "  Press Ctrl+C to stop"
echo "═══════════════════════════════════════════"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait