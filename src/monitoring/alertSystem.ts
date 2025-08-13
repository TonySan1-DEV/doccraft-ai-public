import { performanceMonitor } from './performanceMonitor';

interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

interface AlertNotification {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export class EnterpriseAlertSystem {
  private channels: Map<string, AlertChannel> = new Map();
  private notifications: AlertNotification[] = [];
  private readonly MAX_NOTIFICATIONS = 1000;

  constructor() {
    this.initializeDefaultChannels();
    this.setupPerformanceMonitorListener();
  }

  addChannel(id: string, channel: AlertChannel): void {
    this.channels.set(id, channel);
  }

  removeChannel(id: string): void {
    this.channels.delete(id);
  }

  private setupPerformanceMonitorListener(): void {
    performanceMonitor.on(
      'alert',
      (alertData: { rule: any; metric: any; timestamp: number }) => {
        this.processAlert(alertData);
      }
    );
  }

  private async processAlert(alertData: {
    rule: any;
    metric: any;
    timestamp: number;
  }): Promise<void> {
    const notification: AlertNotification = {
      id: this.generateNotificationId(),
      ruleId: alertData.rule.id,
      severity: alertData.rule.severity,
      title: `Alert: ${alertData.rule.name}`,
      message: this.formatAlertMessage(alertData),
      timestamp: alertData.timestamp,
      acknowledged: false,
    };

    this.notifications.unshift(notification);

    // Maintain notification limit
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, this.MAX_NOTIFICATIONS);
    }

    // Send to all enabled channels
    await this.sendToChannels(notification);

    // Auto-escalate critical alerts after 5 minutes
    if (notification.severity === 'critical') {
      setTimeout(
        () => {
          if (!notification.acknowledged) {
            this.escalateAlert(notification);
          }
        },
        5 * 60 * 1000
      );
    }
  }

  private formatAlertMessage(alertData: any): string {
    const { rule, metric } = alertData;
    const operator =
      rule.operator === 'gt'
        ? 'exceeded'
        : rule.operator === 'lt'
          ? 'dropped below'
          : 'equals';
    const threshold = rule.threshold;
    const currentValue = metric.value;
    const unit = metric.unit || '';

    return `${rule.name}: ${metric.name} has ${operator} ${threshold}${unit} (Current: ${currentValue}${unit})`;
  }

  private async sendToChannels(notification: AlertNotification): Promise<void> {
    const promises = Array.from(this.channels.entries())
      .filter(([_, channel]) => channel.enabled)
      .map(([channelId, channel]) =>
        this.sendToChannel(channelId, channel, notification)
      );

    await Promise.allSettled(promises);
  }

  private async sendToChannel(
    channelId: string,
    channel: AlertChannel,
    notification: AlertNotification
  ): Promise<void> {
    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(channel.config, notification);
          break;
        case 'slack':
          await this.sendSlackAlert(channel.config, notification);
          break;
        case 'webhook':
          await this.sendWebhookAlert(channel.config, notification);
          break;
        case 'sms':
          await this.sendSMSAlert(channel.config, notification);
          break;
      }
    } catch (error) {
      console.error(
        `Failed to send alert to ${channel.type} channel ${channelId}:`,
        error
      );
    }
  }

  private async sendEmailAlert(
    config: any,
    notification: AlertNotification
  ): Promise<void> {
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    const html = this.generateEmailHTML(notification);
    console.log(
      `Email alert sent to ${config.recipients}:`,
      notification.title
    );

    // Example implementation:
    // await emailService.send({
    //   to: config.recipients,
    //   subject: `[${notification.severity.toUpperCase()}] ${notification.title}`,
    //   html: html
    // });
  }

  private async sendSlackAlert(
    config: any,
    notification: AlertNotification
  ): Promise<void> {
    // Implementation would integrate with Slack webhook
    const message = {
      text: `*[${notification.severity.toUpperCase()}] ${notification.title}*`,
      attachments: [
        {
          color: this.getSeverityColor(notification.severity),
          text: notification.message,
          fields: [
            { title: 'Severity', value: notification.severity, short: true },
            {
              title: 'Time',
              value: new Date(notification.timestamp).toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    console.log(`Slack alert sent to ${config.channel}:`, notification.title);

    // Example implementation:
    // await fetch(config.webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(message)
    // });
  }

  private async sendWebhookAlert(
    config: any,
    notification: AlertNotification
  ): Promise<void> {
    // Implementation would send to external webhook endpoints
    const payload = {
      alert: notification,
      timestamp: new Date().toISOString(),
      source: 'DocCraft-AI Monitoring',
    };

    console.log(`Webhook alert sent to ${config.url}:`, notification.title);

    // Example implementation:
    // await fetch(config.url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', ...config.headers },
    //   body: JSON.stringify(payload)
    // });
  }

  private async sendSMSAlert(
    config: any,
    notification: AlertNotification
  ): Promise<void> {
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    const message = `[${notification.severity.toUpperCase()}] ${notification.title}: ${notification.message}`;

    console.log(
      `SMS alert sent to ${config.phoneNumbers}:`,
      notification.title
    );

    // Example implementation:
    // await smsService.send({
    //   to: config.phoneNumbers,
    //   message: message
    // });
  }

  private generateEmailHTML(notification: AlertNotification): string {
    const severityColor = this.getSeverityColor(notification.severity);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${severityColor}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${notification.title}</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px; margin-bottom: 20px;">${notification.message}</p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid ${severityColor};">
            <p><strong>Severity:</strong> ${notification.severity.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date(notification.timestamp).toLocaleString()}</p>
            <p><strong>Alert ID:</strong> ${notification.id}</p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>This alert was automatically generated by DocCraft-AI Monitoring System</p>
        </div>
      </div>
    `;
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#17a2b8',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    };
    return colors[severity as keyof typeof colors] || '#6c757d';
  }

  private async escalateAlert(notification: AlertNotification): Promise<void> {
    // Escalate to higher-level channels or personnel
    console.log(`Escalating critical alert: ${notification.id}`);

    // Example escalation logic:
    // - Send to emergency contacts
    // - Create incident ticket
    // - Page on-call engineer
    // - Send to management
  }

  acknowledgeAlert(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledged = true;
      return true;
    }
    return false;
  }

  resolveAlert(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  getActiveAlerts(): AlertNotification[] {
    return this.notifications.filter(n => !n.resolvedAt);
  }

  getAlertHistory(limit?: number): AlertNotification[] {
    const history = this.notifications.filter(n => n.resolvedAt);
    return limit ? history.slice(0, limit) : history;
  }

  private initializeDefaultChannels(): void {
    // Initialize with default channels (can be configured via admin interface)
    this.addChannel('email-admin', {
      type: 'email',
      config: {
        recipients: ['admin@doccraft.ai'],
        from: 'monitoring@doccraft.ai',
      },
      enabled: true,
    });

    // Browser-compatible environment variable access
    const slackWebhookUrl =
      typeof process !== 'undefined' && process.env
        ? process.env.SLACK_WEBHOOK_URL || ''
        : '';

    this.addChannel('slack-alerts', {
      type: 'slack',
      config: {
        webhookUrl: slackWebhookUrl,
        channel: '#alerts',
      },
      enabled: !!slackWebhookUrl,
    });

    const externalWebhookUrl =
      typeof process !== 'undefined' && process.env
        ? process.env.EXTERNAL_WEBHOOK_URL || ''
        : '';

    const webhookApiKey =
      typeof process !== 'undefined' && process.env
        ? process.env.WEBHOOK_API_KEY || ''
        : '';

    this.addChannel('webhook-external', {
      type: 'webhook',
      config: {
        url: externalWebhookUrl,
        headers: {
          Authorization: `Bearer ${webhookApiKey}`,
        },
      },
      enabled: !!externalWebhookUrl,
    });
  }

  private generateNotificationId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    channels: Record<string, boolean>;
    lastAlert?: number;
    activeAlerts: number;
  }> {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const lastAlert =
      activeAlerts.length > 0
        ? Math.max(...activeAlerts.map(a => a.timestamp))
        : undefined;

    // Check channel health
    const channels: Record<string, boolean> = {};
    for (const [id, channel] of this.channels) {
      channels[id] = channel.enabled;
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (criticalAlerts.length > 0) {
      status = 'unhealthy';
    } else if (activeAlerts.length > 5) {
      status = 'degraded';
    }

    return {
      status,
      channels,
      lastAlert,
      activeAlerts: activeAlerts.length,
    };
  }
}

export const alertSystem = new EnterpriseAlertSystem();
