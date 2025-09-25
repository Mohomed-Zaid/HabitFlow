import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseCookie } from 'cookie';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import { storage } from './storage';

// WebSocket connection interface
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  sessionId?: string;
}

// Real-time event types
export interface HabitUpdateEvent {
  type: 'habit_completed' | 'habit_created' | 'habit_updated' | 'habit_deleted';
  userId: string;
  habitId: string;
  data: any;
  timestamp: string;
}

export interface ProgressUpdateEvent {
  type: 'progress_update' | 'streak_update' | 'stats_update';
  userId: string;
  data: any;
  timestamp: string;
}

export interface NotificationEvent {
  type: 'ai_nudge' | 'reminder' | 'challenge';
  userId: string;
  data: any;
  timestamp: string;
}

type WebSocketEvent = HabitUpdateEvent | ProgressUpdateEvent | NotificationEvent;

class WebSocketManager {
  private wss: WebSocketServer;
  private connections = new Map<string, Set<AuthenticatedWebSocket>>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('WebSocket server initialized on /ws');
  }

  private async handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage) {
    console.log('New WebSocket connection attempt');

    // Extract session token from multiple sources: cookies, query params, or headers
    let sessionId: string | undefined;
    
    // First try to get from cookies (primary method for browsers)
    if (req.headers.cookie) {
      const cookies = parseCookie(req.headers.cookie);
      sessionId = cookies.sessionId;
    }
    
    // Fallback to query parameters or authorization header
    if (!sessionId && req.url) {
      const url = new URL(req.url, 'http://localhost');
      sessionId = url.searchParams.get('sessionId') ?? 
                  url.searchParams.get('token') ?? 
                  undefined;
    }
    
    if (!sessionId && req.headers.authorization) {
      sessionId = req.headers.authorization.replace('Bearer ', '');
    }

    if (!sessionId) {
      console.log('WebSocket connection rejected: No session token found');
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      // Validate session
      const session = await storage.getSession(sessionId);
      if (!session) {
        console.log(`WebSocket connection rejected: Invalid session ${sessionId}`);
        ws.close(1008, 'Invalid session');
        return;
      }

      // Authenticate user
      const user = await storage.getUser(session.userId);
      if (!user) {
        console.log(`WebSocket connection rejected: User not found for session ${sessionId}`);
        ws.close(1008, 'User not found');
        return;
      }

      // Store user info on WebSocket
      ws.userId = user.id;
      ws.sessionId = sessionId;

      // Add to connections map
      if (!this.connections.has(user.id)) {
        this.connections.set(user.id, new Set());
      }
      this.connections.get(user.id)!.add(ws);

      console.log(`WebSocket authenticated for user: ${user.username} (${user.id})`);

      // Send welcome message with current stats
      const stats = await storage.getUserStats(user.id);
      const habits = await storage.getUserHabits(user.id);
      
      ws.send(JSON.stringify({
        type: 'connected',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          stats,
          activeHabits: habits.length
        },
        timestamp: new Date().toISOString()
      }));

      // Handle incoming messages
      ws.on('message', this.handleMessage.bind(this, ws));

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${user.id}:`, error);
        this.handleDisconnection(ws);
      });

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1011, 'Authentication failed');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      
      // Handle ping/pong for keepalive
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        return;
      }

      // Handle real-time data requests
      if (data.type === 'subscribe') {
        // Client can subscribe to specific channels like 'habits', 'progress', 'notifications'
        console.log(`User ${ws.userId} subscribed to: ${data.channels?.join(', ') || 'all'}`);
      }

    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userConnections = this.connections.get(ws.userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          this.connections.delete(ws.userId);
        }
      }
      console.log(`WebSocket disconnected for user: ${ws.userId}`);
    }
  }

  // Broadcast event to specific user
  public broadcastToUser(userId: string, event: WebSocketEvent) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const message = JSON.stringify(event);
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  // Broadcast event to all connected users
  public broadcastToAll(event: WebSocketEvent) {
    const message = JSON.stringify(event);
    this.connections.forEach((connections) => {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    });
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connections.size;
  }

  // Get specific user's connection count
  public getUserConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }

  // Send real-time habit completion update
  public async notifyHabitCompletion(userId: string, habitId: string, completed: boolean) {
    try {
      // Get updated habit stats
      const habit = await storage.getHabit(habitId, userId);
      const streak = await storage.calculateHabitStreak(habitId, userId);
      const entries = await storage.getHabitEntries(habitId, userId, 30);
      const completedEntries = entries.filter(e => e.completed);
      const completionRate = entries.length > 0 ? Math.round((completedEntries.length / entries.length) * 100) : 0;

      // Broadcast to user
      this.broadcastToUser(userId, {
        type: 'habit_completed',
        userId,
        habitId,
        data: {
          habit,
          completed,
          streak,
          completionRate,
          totalEntries: entries.length
        },
        timestamp: new Date().toISOString()
      });

      // Update and broadcast user stats
      const stats = await storage.getUserStats(userId);
      this.broadcastToUser(userId, {
        type: 'stats_update',
        userId,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error sending habit completion notification:', error);
    }
  }

  // Send real-time progress update
  public async notifyProgressUpdate(userId: string) {
    try {
      // Get weekly progress
      const today = new Date();
      const weeklyData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const entries = await storage.getUserHabitEntriesForDate(userId, dateStr);
        const userHabits = await storage.getUserHabits(userId);
        const completed = entries.filter(e => e.completed).length;
        const total = userHabits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        weeklyData.push({
          date: date.toLocaleDateString([], { weekday: 'short' }),
          completed,
          total,
          percentage
        });
      }

      // Broadcast progress update
      this.broadcastToUser(userId, {
        type: 'progress_update',
        userId,
        data: {
          weekly: weeklyData,
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error sending progress update:', error);
    }
  }

  // Send AI nudge notification
  public notifyAiNudge(userId: string, nudge: any) {
    this.broadcastToUser(userId, {
      type: 'ai_nudge',
      userId,
      data: nudge,
      timestamp: new Date().toISOString()
    });
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}