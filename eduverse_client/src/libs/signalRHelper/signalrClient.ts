import * as signalR from '@microsoft/signalr';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class signalrClient {
  private connection: signalR.HubConnection | null = null;
  private starting = false;

  getConnection() {
    if (this.connection) return this.connection;

    const hubUrl = API_URL || 'http://localhost:5002';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}/notificationHub`, {
        // ❗ KHÔNG dùng localStorage trực tiếp ngoài client
        accessTokenFactory: () => {
          if (typeof window === 'undefined') return '';
          return localStorage.getItem('AccessToken') ?? '';
        },
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .configureLogging(signalR.LogLevel.Warning)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    this.connection.onclose((err) => {
      console.warn('[SignalR] closed', err);
    });

    this.connection.onreconnecting(() => {
      console.warn('[SignalR] reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('[SignalR] reconnected');
    });

    return this.connection;
  }

  async start() {
    if (this.starting) return;

    const conn = this.getConnection();

    if (conn.state === signalR.HubConnectionState.Connected) return;

    try {
      this.starting = true;
      await conn.start();
      console.log('[SignalR] connected');
    } catch (err) {
      console.warn('[SignalR] start failed', err);
    } finally {
      this.starting = false;
    }
  }

  async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.starting = false;
      console.log('[SignalR] stopped');
    }
  }
}

export const signalRClient = new signalrClient();
