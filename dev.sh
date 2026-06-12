#!/bin/bash

# Docker development helper script for ScribeX

case "$1" in
    "start")
        echo "🚀 Starting ScribeX development environment..."
        docker-compose -f docker-compose-dev.yml up -d
        echo "✅ Services started!"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        ;;
    "stop")
        echo "🛑 Stopping ScribeX development environment..."
        docker-compose -f docker-compose-dev.yml down
        echo "✅ Services stopped!"
        ;;
    "restart")
        echo "🔄 Restarting ScribeX development environment..."
        docker-compose -f docker-compose-dev.yml restart
        echo "✅ Services restarted!"
        ;;
    "rebuild")
        echo "🔨 Rebuilding ScribeX development environment..."
        docker-compose -f docker-compose-dev.yml down
        docker-compose -f docker-compose-dev.yml up --build -d
        echo "✅ Services rebuilt and started!"
        ;;
    "logs")
        if [ -z "$2" ]; then
            docker-compose -f docker-compose-dev.yml logs -f
        else
            docker-compose -f docker-compose-dev.yml logs -f $2
        fi
        ;;
    "reset")
        echo "🗑️ Resetting containers (this will delete container data)..."
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f docker-compose-dev.yml down -v
            docker-compose -f docker-compose-dev.yml up -d
            echo "✅ Reset complete!"
        else
            echo "❌ Reset cancelled"
        fi
        ;;
    "shell")
        if [ "$2" = "server" ]; then
            docker-compose -f docker-compose-dev.yml exec server bash
        elif [ "$2" = "client" ]; then
            docker-compose -f docker-compose-dev.yml exec client sh
        else
            echo "Usage: $0 shell [server|client]"
        fi
        ;;
    *)
        echo "ScribeX Docker Development Helper"
        echo "Usage: $0 {start|stop|restart|rebuild|logs|reset|shell}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  rebuild  - Rebuild and start all services"
        echo "  logs     - Show logs (optionally specify service)"
        echo "  reset    - Reset containers (deletes container data)"
        echo "  shell    - Access service shell [server|client]"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs server"
        echo "  $0 shell client"
        ;;
esac

