import { supabase } from '../supabase';
import { AuditLogger } from '../audit/auditLogger';
import { MCPContext, AuditDetails } from '../../types/domain';
import * as Y from 'yjs';

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  collaborators: string[];
  metadata: {
    version: number;
    last_modified_by: string;
    word_count: number;
    character_count: number;
  };
}

export interface DocumentShare {
  id: string;
  document_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
  created_at: string;
}

export class DocumentService {
  static async createDocument(
    title: string,
    content: string = '',
    isPublic: boolean = false,
    userId: string,
    mcpContext: MCPContext
  ): Promise<Document | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          content,
          owner_id: user.id,
          is_public: isPublic,
          collaborators: [],
          metadata: {
            version: 1,
            last_modified_by: user.id,
            word_count: content.split(' ').length,
            character_count: content.length,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        return null;
      }

      // Log audit event
      await AuditLogger.logAuditEvent({
        userId,
        action: 'create',
        resource: 'document',
        details: {
          resourceId: data.id,
          resourceType: 'document',
          parameters: {
            title,
            isPublic,
            contentLength: content.length,
          },
        } as AuditDetails,
        mcpContext,
      });

      return data as Document;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }

  static async getDocument(documentId: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        return null;
      }

      return data as Document;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  static async updateDocument(
    documentId: string,
    updates: Partial<Document>,
    userId: string,
    mcpContext: MCPContext
  ): Promise<Document | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          metadata: {
            ...updates.metadata,
            last_modified_by: user.id,
            version: (updates.metadata?.version || 1) + 1,
          },
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        return null;
      }

      // Log audit event
      await AuditLogger.logAuditEvent({
        userId,
        action: 'update',
        resource: 'document',
        details: {
          resourceId: documentId,
          resourceType: 'document',
          parameters: {
            updatedFields: Object.keys(updates),
            contentLength: updates.content?.length || 0,
          },
        } as AuditDetails,
        mcpContext,
      });

      return data as Document;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  static async saveYjsDocument(
    documentId: string,
    ydoc: Y.Doc,
    userId: string,
    mcpContext: MCPContext
  ): Promise<boolean> {
    try {
      const content = ydoc.getText('content').toString();
      const wordCount = content.split(' ').length;
      const characterCount = content.length;

      const success = await this.updateDocument(
        documentId,
        {
          content,
          metadata: {
            version: Date.now(),
            last_modified_by: 'collaboration',
            word_count: wordCount,
            character_count: characterCount,
          },
        },
        userId,
        mcpContext
      );

      if (success) {
        // Log collaboration save event
        await AuditLogger.logAuditEvent({
          userId,
          action: 'collaboration_save',
          resource: 'document',
          details: {
            resourceId: documentId,
            resourceType: 'document',
            parameters: {
              wordCount,
              characterCount,
              saveMethod: 'yjs',
            },
          } as AuditDetails,
          mcpContext,
        });
      }

      return !!success;
    } catch (error) {
      console.error('Error saving Yjs document:', error);
      return false;
    }
  }

  static async getUserDocuments(): Promise<Document[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user documents:', error);
        return [];
      }

      return data as Document[];
    } catch (error) {
      console.error('Error getting user documents:', error);
      return [];
    }
  }

  static async shareDocument(
    documentId: string,
    userId: string,
    permission: 'read' | 'write' | 'admin',
    mcpContext: MCPContext
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('document_shares').insert({
        document_id: documentId,
        user_id: userId,
        permission,
      });

      if (error) {
        console.error('Error sharing document:', error);
        return false;
      }

      // Log audit event
      await AuditLogger.logAuditEvent({
        userId: user.id,
        action: 'share',
        resource: 'document',
        details: {
          resourceId: documentId,
          resourceType: 'document',
          parameters: {
            sharedWith: userId,
            permission,
          },
        } as AuditDetails,
        mcpContext,
      });

      return true;
    } catch (error) {
      console.error('Error sharing document:', error);
      return false;
    }
  }

  static async getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', documentId);

      if (error) {
        console.error('Error fetching document shares:', error);
        return [];
      }

      return data as DocumentShare[];
    } catch (error) {
      console.error('Error getting document shares:', error);
      return [];
    }
  }

  static async deleteDocument(
    documentId: string,
    userId: string,
    mcpContext: MCPContext
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error deleting document:', error);
        return false;
      }

      // Log audit event
      await AuditLogger.logAuditEvent({
        userId,
        action: 'delete',
        resource: 'document',
        details: {
          resourceId: documentId,
          resourceType: 'document',
        } as AuditDetails,
        mcpContext,
      });

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}
