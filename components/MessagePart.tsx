import { Colors } from '@/constants/Colors';
import type { UIMessage } from '@ai-sdk/ui-utils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

// Extract the part types from the actual AI SDK UIMessage
export type UIMessagePart = UIMessage['parts'][number];

// Type guards for better type safety
function isFilePartWithName(part: UIMessagePart): part is UIMessagePart & { name: string } {
  return part.type === 'file' && 'name' in part;
}

function isFilePartWithMimeType(part: UIMessagePart): part is UIMessagePart & { mimeType: string } {
  return part.type === 'file' && 'mimeType' in part;
}

function isSourcePartWithTitle(part: UIMessagePart): part is UIMessagePart & { source: { title: string; url: string } } {
  return part.type === 'source' && 'title' in part.source;
}

interface MessagePartProps {
  part: UIMessagePart;
  index: number;
}

export function MessagePart({ part, index }: MessagePartProps) {
  switch (part.type) {
    case 'text':
      return (
        <View style={styles.textContainer}>
          <Markdown style={markdownStyles}>{part.text}</Markdown>
        </View>
      );

    case 'reasoning':
      return (
        <View style={styles.reasoningContainer}>
          <View style={styles.reasoningHeader}>
            <Text style={styles.reasoningLabel}>💭 Reasoning</Text>
          </View>
          <Markdown style={markdownStyles}>{part.reasoning}</Markdown>
        </View>
      );

    case 'tool-invocation':
      return (
        <View style={styles.toolContainer}>
          <View style={styles.toolHeader}>
            <Text style={styles.toolLabel}>
              🛠️ {part.toolInvocation.toolName}
            </Text>
            <View style={[
              styles.statusBadge,
              part.toolInvocation.state === 'partial-call' && styles.statusPartialcall,
              part.toolInvocation.state === 'call' && styles.statusCall,
              part.toolInvocation.state === 'result' && styles.statusResult,
            ]}>
              <Text style={styles.statusText}>
                {part.toolInvocation.state}
              </Text>
            </View>
          </View>

          {'args' in part.toolInvocation && part.toolInvocation.args && (
            <View style={styles.toolSection}>
              <Text style={styles.sectionLabel}>Arguments:</Text>
              <Text style={styles.codeText}>
                {JSON.stringify(part.toolInvocation.args, null, 2)}
              </Text>
            </View>
          )}
        </View>
      );

    case 'source':
      return (
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceLabel}>📄 Source</Text>
          <Text style={styles.sourceTitle}>
            {isSourcePartWithTitle(part) ? part.source.title : part.source.url}
          </Text>
          <Text style={styles.sourceUrl}>{part.source.url}</Text>
        </View>
      );

    case 'file':
      return (
        <View style={styles.fileContainer}>
          <Text style={styles.fileLabel}>📎 File</Text>
          <Text style={styles.fileName}>
            {isFilePartWithName(part) ? part.name : 'Untitled file'}
          </Text>
          <Text style={styles.fileType}>
            {isFilePartWithMimeType(part) ? part.mimeType : 'Unknown type'}
          </Text>
        </View>
      );

    case 'step-start':
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>▶️ Step started</Text>
        </View>
      );

    default:
      return (
        <View style={styles.unknownContainer}>
          <Text style={styles.unknownText}>
            Unknown part type
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  // Text parts
  textContainer: {
    marginVertical: 4,
  },

  // Reasoning parts
  reasoningContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  reasoningHeader: {
    marginBottom: 8,
  },
  reasoningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Tool invocation parts
  toolContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.info,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPartialcall: {
    backgroundColor: Colors.warning,
  },
  statusCall: {
    backgroundColor: Colors.info,
  },
  statusResult: {
    backgroundColor: Colors.success,
  },
  statusError: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.surface,
  },
  toolSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: Colors.surfaceSecondary,
    padding: 8,
    borderRadius: 4,
    color: Colors.text,
  },
  resultText: {
    fontSize: 13,
    color: Colors.success,
    backgroundColor: Colors.surfaceSecondary,
    padding: 8,
    borderRadius: 4,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    backgroundColor: Colors.surfaceSecondary,
    padding: 8,
    borderRadius: 4,
  },

  // Source parts
  sourceContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 4,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  sourceUrl: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // File parts
  fileContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  fileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  fileType: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Step parts
  stepContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },

  // Unknown parts
  unknownContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  unknownText: {
    fontSize: 12,
    color: Colors.error,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.text,
  },
  paragraph: {
    marginBottom: 12,
    color: Colors.text,
  },
  code_inline: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    color: Colors.text,
  },
  code_block: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
    marginVertical: 8,
    color: Colors.text,
  },
  list_item: {
    marginBottom: 4,
    color: Colors.text,
  },
  strong: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  em: {
    fontStyle: 'italic',
    color: Colors.text,
  },
});