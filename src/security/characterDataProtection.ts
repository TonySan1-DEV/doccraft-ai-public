// Character Data Protection Service for DocCraft-AI
// AES-256 encryption with field-level security and access monitoring

import {
  CharacterData,
  ProtectedCharacterData,
  AccessEvent,
  SecurityContext,
} from '../types/security';

export class CharacterDataProtection {
  private encryptionService: EncryptionService;
  private accessMonitor: AccessMonitor;
  private sensitiveFields = [
    'personalHistory',
    'traumaticEvents',
    'personalRelationships',
    'privateMotivations',
    'psychologicalProfile',
    'familyDetails',
    'financialInformation',
    'medicalHistory',
    'legalIssues',
    'confidentialNotes',
  ];

  constructor() {
    this.encryptionService = new EncryptionService();
    this.accessMonitor = new AccessMonitor();
  }

  async protectCharacterData(
    character: CharacterData,
    userId: string
  ): Promise<ProtectedCharacterData> {
    const startTime = performance.now();

    try {
      const protectedData: ProtectedCharacterData = {
        ...character,
        metadata: {
          userId,
          createdAt: new Date(),
          lastModified: new Date(),
          accessLevel: 'private',
          encryptionLevel: 'AES-256',
        },
        accessControl: {
          owner: userId,
          sharedWith: [],
          permissions: ['read', 'write', 'delete'],
          accessHistory: [],
          securityLevel: 'high',
        },
      };

      // Encrypt sensitive fields with field-level encryption
      for (const field of this.sensitiveFields) {
        if (protectedData[field as keyof CharacterData]) {
          const fieldValue = protectedData[field as keyof CharacterData];
          if (
            typeof fieldValue === 'string' ||
            typeof fieldValue === 'object'
          ) {
            protectedData[field as keyof CharacterData] =
              (await this.encryptionService.encryptField(
                fieldValue,
                userId,
                field
              )) as any;
          }
        }
      }

      // Access control is already set in the object creation above

      // Record protection metrics
      const protectionTime = performance.now() - startTime;
      await this.accessMonitor.recordProtectionEvent(
        userId,
        character.id,
        protectionTime
      );

      return protectedData;
    } catch (error) {
      await this.accessMonitor.recordProtectionError(
        userId,
        character.id,
        error
      );
      throw error;
    }
  }

  async decryptCharacterData(
    protectedData: ProtectedCharacterData,
    userId: string,
    requestedFields?: string[]
  ): Promise<CharacterData> {
    const startTime = performance.now();

    try {
      // Verify access permissions
      if (!this.hasAccessPermission(protectedData, userId, 'read')) {
        throw new Error('Access denied: Insufficient permissions');
      }

      const decryptedData: CharacterData = {
        ...protectedData,
        // Remove protected data properties to return to original CharacterData format
      };
      delete (decryptedData as any).metadata;
      delete (decryptedData as any).accessControl;

      // Decrypt only requested fields or all sensitive fields
      const fieldsToDecrypt = requestedFields || this.sensitiveFields;

      for (const field of fieldsToDecrypt) {
        if (
          this.sensitiveFields.includes(field) &&
          protectedData[field as keyof CharacterData]
        ) {
          const encryptedValue = protectedData[field as keyof CharacterData];
          if (
            typeof encryptedValue === 'string' &&
            encryptedValue.startsWith('encrypted:')
          ) {
            decryptedData[field as keyof CharacterData] =
              (await this.encryptionService.decryptField(
                encryptedValue,
                userId,
                field
              )) as any;
          }
        }
      }

      // Record access event
      const accessTime = performance.now() - startTime;
      await this.accessMonitor.recordAccessEvent(
        userId,
        protectedData.id,
        'read',
        accessTime
      );

      return decryptedData;
    } catch (error) {
      await this.accessMonitor.recordAccessError(
        userId,
        protectedData.id,
        'read',
        error
      );
      throw error;
    }
  }

  async updateCharacterData(
    protectedData: ProtectedCharacterData,
    updates: Partial<CharacterData>,
    userId: string
  ): Promise<ProtectedCharacterData> {
    const startTime = performance.now();

    try {
      // Verify write permissions
      if (!this.hasAccessPermission(protectedData, userId, 'write')) {
        throw new Error('Access denied: Insufficient permissions');
      }

      // Create updated data
      const updatedData: ProtectedCharacterData = {
        ...protectedData,
        ...updates,
        metadata: {
          ...protectedData.metadata,
          lastModified: new Date(),
        },
      };

      // Re-encrypt sensitive fields that were updated
      for (const field of this.sensitiveFields) {
        if (updates[field as keyof CharacterData] !== undefined) {
          const fieldValue = updates[field as keyof CharacterData];
          if (
            typeof fieldValue === 'string' ||
            typeof fieldValue === 'object'
          ) {
            updatedData[field as keyof CharacterData] =
              (await this.encryptionService.encryptField(
                fieldValue,
                userId,
                field
              )) as any;
          }
        }
      }

      // Update access history
      updatedData.accessControl.accessHistory.push({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        resource: protectedData.id,
        accessType: 'write',
        timestamp: new Date(),
        success: true,
        action: 'update',
        ipAddress: '127.0.0.1', // Default IP for local operations
        userAgent: 'DocCraft-AI-System',
        metadata: { operation: 'update', fields: Object.keys(updates) },
      });

      // Record update event
      const updateTime = performance.now() - startTime;
      await this.accessMonitor.recordUpdateEvent(
        userId,
        protectedData.id,
        updateTime,
        Object.keys(updates)
      );

      return updatedData;
    } catch (error) {
      await this.accessMonitor.recordUpdateError(
        userId,
        protectedData.id,
        error
      );
      throw error;
    }
  }

  async shareCharacterData(
    protectedData: ProtectedCharacterData,
    ownerId: string,
    targetUserId: string,
    permissions: string[]
  ): Promise<ProtectedCharacterData> {
    try {
      // Verify owner permissions
      if (protectedData.accessControl.owner !== ownerId) {
        throw new Error('Access denied: Only owner can share data');
      }

      // Validate permissions
      const validPermissions = ['read', 'write', 'delete'];
      const requestedPermissions = permissions.filter(p =>
        validPermissions.includes(p)
      );

      if (requestedPermissions.length === 0) {
        throw new Error('At least one valid permission must be specified');
      }

      // Update access control
      const updatedData: ProtectedCharacterData = {
        ...protectedData,
        accessControl: {
          ...protectedData.accessControl,
          sharedWith: [...protectedData.accessControl.sharedWith, targetUserId],
          permissions: [
            ...Array.from(
              new Set([
                ...protectedData.accessControl.permissions,
                ...requestedPermissions,
              ])
            ),
          ],
        },
      };

      // Record sharing event
      await this.accessMonitor.recordSharingEvent(
        ownerId,
        protectedData.id,
        targetUserId,
        requestedPermissions
      );

      return updatedData;
    } catch (error) {
      await this.accessMonitor.recordSharingError(
        ownerId,
        protectedData.id,
        targetUserId,
        error
      );
      throw error;
    }
  }

  async revokeAccess(
    protectedData: ProtectedCharacterData,
    ownerId: string,
    targetUserId: string
  ): Promise<ProtectedCharacterData> {
    try {
      // Verify owner permissions
      if (protectedData.accessControl.owner !== ownerId) {
        throw new Error('Access denied: Only owner can revoke access');
      }

      // Remove user from shared list
      const updatedData: ProtectedCharacterData = {
        ...protectedData,
        accessControl: {
          ...protectedData.accessControl,
          sharedWith: protectedData.accessControl.sharedWith.filter(
            id => id !== targetUserId
          ),
        },
      };

      // Record revocation event
      await this.accessMonitor.recordRevocationEvent(
        ownerId,
        protectedData.id,
        targetUserId
      );

      return updatedData;
    } catch (error) {
      await this.accessMonitor.recordRevocationError(
        ownerId,
        protectedData.id,
        targetUserId,
        error
      );
      throw error;
    }
  }

  private hasAccessPermission(
    protectedData: ProtectedCharacterData,
    userId: string,
    permission: string
  ): boolean {
    // Owner has all permissions
    if (protectedData.accessControl.owner === userId) {
      return true;
    }

    // Check if user is in shared list and has required permission
    if (protectedData.accessControl.sharedWith.includes(userId)) {
      return protectedData.accessControl.permissions.includes(permission);
    }

    return false;
  }

  // Public methods for external access
  async getAccessHistory(
    characterId: string,
    userId: string
  ): Promise<AccessEvent[]> {
    return await this.accessMonitor.getAccessHistory(characterId, userId);
  }

  async getProtectionStats(characterId: string): Promise<ProtectionStats> {
    return await this.accessMonitor.getProtectionStats(characterId);
  }

  async validateDataIntegrity(
    protectedData: ProtectedCharacterData
  ): Promise<DataIntegrityReport> {
    // This method is implemented in the main class, not in EncryptionService
    const report: DataIntegrityReport = {
      characterId: protectedData.id,
      timestamp: new Date(),
      integrityChecks: [],
      overallStatus: 'valid',
    };

    // Check encryption status
    for (const field of this.sensitiveFields) {
      const fieldValue = protectedData[field as keyof CharacterData];
      const isEncrypted =
        typeof fieldValue === 'string' && fieldValue.startsWith('encrypted:');

      report.integrityChecks.push({
        field,
        status: isEncrypted ? 'encrypted' : 'not_encrypted',
        encrypted: isEncrypted,
      });

      if (!isEncrypted && fieldValue !== undefined) {
        report.overallStatus = 'warning';
      }
    }

    // Check metadata integrity
    if (!protectedData.metadata || !protectedData.metadata.userId) {
      report.overallStatus = 'invalid';
      report.integrityChecks.push({
        field: 'metadata',
        status: 'missing',
        encrypted: false,
      });
    }

    // Check access control integrity
    if (!protectedData.accessControl || !protectedData.accessControl.owner) {
      report.overallStatus = 'invalid';
      report.integrityChecks.push({
        field: 'accessControl',
        status: 'missing',
        encrypted: false,
      });
    }

    return report;
  }
}

// Encryption Service
class EncryptionService {
  private algorithm = 'AES-256-GCM';
  private keySize = 256;
  private ivSize = 16;
  private tagSize = 16;

  async encryptField(
    data: string | object,
    userId: string,
    fieldName: string
  ): Promise<string> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const key = await this.generateFieldKey(userId, fieldName);
      const iv = crypto.getRandomValues(new Uint8Array(this.ivSize));

      // Encrypt data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        new TextEncoder().encode(dataString)
      );

      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray);

      // Return base64 encoded encrypted data with prefix
      return `encrypted:${btoa(String.fromCharCode(...Array.from(combined)))}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt field data');
    }
  }

  async decryptField(
    encryptedData: string,
    userId: string,
    fieldName: string
  ): Promise<string | object> {
    try {
      if (!encryptedData.startsWith('encrypted:')) {
        return encryptedData; // Not encrypted
      }

      const key = await this.generateFieldKey(userId, fieldName);
      const encryptedString = encryptedData.substring(10); // Remove 'encrypted:' prefix
      const combined = new Uint8Array(
        atob(encryptedString)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.ivSize);
      const data = combined.slice(this.ivSize);

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        data
      );

      const decryptedString = new TextDecoder().decode(decryptedData);

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt field data');
    }
  }

  private async generateFieldKey(
    userId: string,
    fieldName: string
  ): Promise<CryptoKey> {
    // Generate a deterministic key based on userId and fieldName
    const keyMaterial = `${userId}:${fieldName}:${process.env.ENCRYPTION_SALT || 'default-salt'}`;
    const keyData = new TextEncoder().encode(keyMaterial);

    // Derive key using PBKDF2
    const baseKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('field-encryption-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: this.algorithm, length: this.keySize },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Duplicate method removed - implementation is in the main class above
}

// Access Monitor
class AccessMonitor {
  private accessEvents: Map<string, AccessEvent[]> = new Map();

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async recordProtectionEvent(
    userId: string,
    characterId: string,
    protectionTime: number
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType: 'create',
      timestamp: new Date(),
      success: true,
      action: 'encrypt',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { protectionTime, operation: 'encrypt' },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordProtectionError(
    userId: string,
    characterId: string,
    error: any
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType: 'create',
      timestamp: new Date(),
      success: false,
      action: 'encrypt_error',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { error: error.message, operation: 'encrypt' },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordAccessEvent(
    userId: string,
    characterId: string,
    accessType: 'read' | 'write' | 'delete',
    accessTime: number
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType,
      timestamp: new Date(),
      success: true,
      action: accessType,
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { accessTime, operation: accessType },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordAccessError(
    userId: string,
    characterId: string,
    accessType: 'read' | 'write' | 'delete',
    error: any
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType,
      timestamp: new Date(),
      success: false,
      action: `${accessType}_error`,
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { error: error.message, operation: accessType },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordUpdateEvent(
    userId: string,
    characterId: string,
    updateTime: number,
    updatedFields: string[]
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType: 'write',
      timestamp: new Date(),
      success: true,
      action: 'update',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { updateTime, updatedFields, operation: 'update' },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordUpdateError(
    userId: string,
    characterId: string,
    error: any
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId,
      resource: characterId,
      accessType: 'write',
      timestamp: new Date(),
      success: false,
      action: 'update_error',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: { error: error.message, operation: 'update' },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordSharingEvent(
    ownerId: string,
    characterId: string,
    targetUserId: string,
    permissions: string[]
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId: ownerId,
      resource: characterId,
      accessType: 'create',
      timestamp: new Date(),
      success: true,
      action: 'share',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: {
        operation: 'share',
        targetUserId,
        permissions,
        shareType: 'permission_grant',
      },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordSharingError(
    ownerId: string,
    characterId: string,
    targetUserId: string,
    error: any
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId: ownerId,
      resource: characterId,
      accessType: 'create',
      timestamp: new Date(),
      success: false,
      action: 'share_error',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: {
        error: error.message,
        operation: 'share',
        targetUserId,
        shareType: 'permission_grant',
      },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordRevocationEvent(
    ownerId: string,
    characterId: string,
    targetUserId: string
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId: ownerId,
      resource: characterId,
      accessType: 'delete',
      timestamp: new Date(),
      success: true,
      action: 'revoke',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: {
        operation: 'revoke',
        targetUserId,
        shareType: 'permission_revoke',
      },
    };

    this.addAccessEvent(characterId, event);
  }

  async recordRevocationError(
    ownerId: string,
    characterId: string,
    targetUserId: string,
    error: any
  ): Promise<void> {
    const event: AccessEvent = {
      id: this.generateEventId(),
      userId: ownerId,
      resource: characterId,
      accessType: 'delete',
      timestamp: new Date(),
      success: false,
      action: 'revoke_error',
      ipAddress: '127.0.0.1', // Default IP for local operations
      userAgent: 'DocCraft-AI-System',
      metadata: {
        error: error.message,
        operation: 'revoke',
        targetUserId,
        shareType: 'permission_revoke',
      },
    };

    this.addAccessEvent(characterId, event);
  }

  private addAccessEvent(characterId: string, event: AccessEvent): void {
    if (!this.accessEvents.has(characterId)) {
      this.accessEvents.set(characterId, []);
    }

    this.accessEvents.get(characterId)!.push(event);

    // Keep only last 1000 events per character
    const events = this.accessEvents.get(characterId)!;
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
  }

  async getAccessHistory(
    characterId: string,
    userId: string
  ): Promise<AccessEvent[]> {
    const events = this.accessEvents.get(characterId) || [];

    // Filter events for the specific user
    return events.filter(event => event.userId === userId);
  }

  async getProtectionStats(characterId: string): Promise<ProtectionStats> {
    const events = this.accessEvents.get(characterId) || [];

    const totalAccesses = events.length;
    const successfulAccesses = events.filter(e => e.success).length;
    const failedAccesses = totalAccesses - successfulAccesses;

    const accessByType = events.reduce(
      (acc, event) => {
        acc[event.accessType] = (acc[event.accessType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      characterId,
      totalAccesses,
      successfulAccesses,
      failedAccesses,
      accessByType,
      lastAccess:
        events.length > 0 ? events[events.length - 1].timestamp : null,
    };
  }
}

// Types
interface ProtectionStats {
  characterId: string;
  totalAccesses: number;
  successfulAccesses: number;
  failedAccesses: number;
  accessByType: Record<string, number>;
  lastAccess: Date | null;
}

interface DataIntegrityReport {
  characterId: string;
  timestamp: Date;
  integrityChecks: Array<{
    field: string;
    status: 'encrypted' | 'not_encrypted' | 'missing';
    encrypted: boolean;
  }>;
  overallStatus: 'valid' | 'warning' | 'invalid';
}
