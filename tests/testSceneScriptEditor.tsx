// MCP Context Block
/*
{
  file: "testSceneScriptEditor.tsx",
  role: "qa",
  allowedActions: ["test", "validate", "simulate"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character-collaboration"
}
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SceneScriptEditor, {
  ScriptLine,
} from '../src/components/SceneScriptEditor';
import { CharacterPersona } from '../src/types/CharacterPersona';

const proUser = { id: 'user-1', tier: 'Pro' };
const freeUser = { id: 'user-2', tier: 'Free' };
const mockParticipants: CharacterPersona[] = [
  {
    id: 'c1',
    name: 'Alice',
    description: 'A curious explorer',
    archetype: 'Hero',
    goals: ['Discover new lands'],
    voiceStyle: 'Enthusiastic',
    worldview: 'Optimistic',
    personality: ['Curious', 'Brave'],
    conflicts: [],
    arc: "Hero's journey",
    knownConnections: [],
    traits: [
      {
        id: 'trait-1',
        name: 'curious',
        category: 'personality',
        value: 'curious',
        strength: 8,
        description: 'Always asking questions',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Bob',
    description: 'A wise mentor',
    archetype: 'Mentor',
    goals: ['Guide others'],
    voiceStyle: 'Calm',
    worldview: 'Wise',
    personality: ['Patient', 'Knowledgeable'],
    conflicts: [],
    arc: "Mentor's journey",
    knownConnections: [],
    traits: [
      {
        id: 'trait-2',
        name: 'patient',
        category: 'personality',
        value: 'patient',
        strength: 9,
        description: 'Takes time to explain things',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
const initialLines: ScriptLine[] = [
  { id: '1', speakerId: 'c1', text: 'Hello, Bob!' },
  { id: '2', speakerId: 'c2', text: 'Hello, Alice!' },
];

describe('SceneScriptEditor', () => {
  it('renders lines and characters correctly', () => {
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('Hello, Bob!')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello, Alice!')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Speaker').length).toBe(2);
  });

  it('allows editing and adding of lines', () => {
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Add new line...'), {
      target: { value: 'A new line' },
    });
    fireEvent.click(screen.getByLabelText('Add Line (Enter)'));
    expect(screen.getByDisplayValue('A new line')).toBeInTheDocument();
  });

  it('deletes selected line with Delete key', () => {
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    const input = screen.getByDisplayValue('Hello, Bob!');
    input.focus();
    fireEvent.keyDown(input, { key: 'Delete' });
    expect(screen.queryByDisplayValue('Hello, Bob!')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation (↑, ↓, Enter)', () => {
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    const inputs = screen.getAllByLabelText('Edit Line Text');
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(inputs[1]);
    fireEvent.keyDown(inputs[1], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(inputs[0]);
    fireEvent.keyDown(inputs[0], { key: 'Enter' });
    expect(document.activeElement).not.toBe(inputs[0]);
  });

  it('shows tooltips and ARIA roles', () => {
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Save Script (Ctrl+S)')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Script (Ctrl+E)')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Simulate Scene (Ctrl+P)')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /Script Editor/i })
    ).toBeInTheDocument();
  });

  it('calls export, simulate, and save triggers', () => {
    const onSave = jest.fn();
    const onExport = jest.fn();
    const onSim = jest.fn();
    render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={onSave}
        onExportScript={onExport}
        onSimulateScript={onSim}
      />
    );
    fireEvent.click(screen.getByLabelText('Save Script (Ctrl+S)'));
    expect(onSave).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Export Script (Ctrl+E)'));
    expect(onExport).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Simulate Scene (Ctrl+P)'));
    expect(onSim).toHaveBeenCalled();
  });

  it('matches snapshot for key UI states', () => {
    const { asFragment } = render(
      <SceneScriptEditor
        scene={{
          id: 'scene-1',
          title: 'Test',
          setting: '',
          participants: mockParticipants,
        }}
        initialLines={initialLines}
        participants={mockParticipants}
        onSaveScript={jest.fn()}
        onExportScript={jest.fn()}
        onSimulateScript={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
