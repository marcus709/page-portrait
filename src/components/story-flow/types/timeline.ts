import { Node, Edge } from '@xyflow/react';

export interface TimelineNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  year?: string;
}

export type TimelineNode = Node<TimelineNodeData>;
export type TimelineEdge = Edge;