/**
 * WebSocket 客户端管理类
 * 实现自动重连、心跳检测、消息推送等功能
 */

export interface WebSocketMessage {
  type: 'message' | 'unread_count' | 'heartbeat' | 'error';
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  heartbeatInterval?: number; // 心跳间隔（毫秒）
  reconnectInterval?: number; // 重连间隔（毫秒）
  maxReconnectAttempts?: number; // 最大重连次数
  debug?: boolean; // 是否开启调试日志
}

export type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private messageHandlers: Set<MessageHandler> = new Set();
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private isManualClose = false;
  private isConnected = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 30000, // 默认30秒
      reconnectInterval: 3000, // 默认3秒
      maxReconnectAttempts: 10, // 默认最多重连10次
      debug: false,
      ...config,
    };
  }

  /**
   * 连接 WebSocket
   */
  connect(token: string): void {
    if (this.ws && this.isConnected) {
      this.log('WebSocket 已连接');
      return;
    }

    this.isManualClose = false;
    const url = `${this.config.url}?token=${encodeURIComponent(token)}`;
    
    this.log('正在连接 WebSocket:', url);
    
    try {
      this.ws = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      this.log('WebSocket 连接失败:', error);
      this.handleReconnect();
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('WebSocket 连接成功');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.log('收到消息:', message);
        
        // 如果是心跳响应，不需要通知处理器
        if (message.type === 'heartbeat') {
          return;
        }
        
        // 通知所有消息处理器
        this.messageHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            this.log('消息处理器执行失败:', error);
          }
        });
      } catch (error) {
        this.log('解析消息失败:', error);
      }
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket 错误:', error);
      this.isConnected = false;
    };

    this.ws.onclose = (event) => {
      this.log('WebSocket 连接关闭:', event.code, event.reason);
      this.isConnected = false;
      this.stopHeartbeat();
      
      // 如果不是手动关闭，则尝试重连
      if (!this.isManualClose) {
        this.handleReconnect();
      }
    };
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({
          type: 'heartbeat',
          data: null,
          timestamp: Date.now(),
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (this.isManualClose) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    
    // 使用指数退避策略
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      60000, // 最大60秒
    );
    
    this.log(`${delay}ms 后进行第 ${this.reconnectAttempts} 次重连`);
    
    this.reconnectTimer = window.setTimeout(() => {
      // 需要重新获取 token
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.connect(token);
      } else {
        this.log('未找到 token，停止重连');
      }
    }, delay);
  }

  /**
   * 发送消息
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || !this.isConnected) {
      this.log('WebSocket 未连接，无法发送消息');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.log('发送消息:', message);
    } catch (error) {
      this.log('发送消息失败:', error);
    }
  }

  /**
   * 添加消息处理器
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    
    // 返回取消订阅函数
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.log('WebSocket 已手动关闭');
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): boolean {
    return this.isConnected;
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// 创建全局 WebSocket 实例
let wsClient: WebSocketClient | null = null;

/**
 * 初始化 WebSocket 客户端
 */
export function initWebSocket(token: string): WebSocketClient {
  if (wsClient) {
    wsClient.close();
  }

  // 根据当前协议选择 ws 或 wss
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WEBSOCKET_URL || window.location.host;
  const url = `${protocol}//${host}/ws/message`;

  wsClient = new WebSocketClient({
    url,
    debug: import.meta.env.DEV,
  });

  wsClient.connect(token);
  
  return wsClient;
}

/**
 * 获取 WebSocket 客户端实例
 */
export function getWebSocketClient(): WebSocketClient | null {
  return wsClient;
}

/**
 * 关闭 WebSocket 连接
 */
export function closeWebSocket(): void {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
}
