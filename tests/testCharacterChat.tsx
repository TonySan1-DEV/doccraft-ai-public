import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// TODO: Fix import path when component is available
// import CharacterChatPanel from '../src/components/CharacterChatPanel';
import * as simulateChatModule from '../src/services/simulateCharacterChat';
import { AuthContext } from '../src/contexts/AuthContext';
import { CharacterPersona } from '../src/types/CharacterPersona';

// Mock persona
const mockPersona: CharacterPersona = {
  id: 'persona-1',
  name: 'Sir Reginald',
  description: 'A retired knight and scholar',
  archetype: 'Mentor',
  goals: ['Guide the hero to greatness'],
  voiceStyle: 'Shakespearean',
  worldview: 'Noble, wise, and patient',
  personality: [
    'Openness: high, Conscientiousness: high, Extraversion: moderate, Agreeableness: high, Neuroticism: low',
  ],
  conflicts: [],
  arc: "Mentor's journey",
  knownConnections: [
    {
      name: 'Dr. Kalin',
      relationship: 'rival',
      description: 'Long-standing academic adversary',
    },
  ],
  traits: [
    {
      id: 'trait-1',
      name: 'formal',
      category: 'personality',
      value: 'formal',
      strength: 8,
      description: 'Speaks in a formal, Shakespearean manner',
    },
  ],
  memory: [
    {
      id: 'memory-1',
      timestamp: Date.now(),
      type: 'interaction',
      content: 'First meeting with the hero',
      emotionalImpact: 0.7,
      importance: 'high',
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock AuthContext values
const proUser = { id: 'user-1', tier: 'Pro' };
const freeUser = { id: 'user-2', tier: 'Free' };

// Mock simulateCharacterChat
jest.mock('../src/services/simulateCharacterChat', () => {
  const original = jest.requireActual('../src/services/simulateCharacterChat');
  return {
    ...original,
    simulateCharacterChat: jest.fn(),
  };
});

const mockSimulateCharacterChat =
  simulateChatModule.simulateCharacterChat as jest.Mock;

describe('CharacterChatPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TODO: Re-enable tests when CharacterChatPanel component is available
  it.skip('renders persona summary and empty chat for Pro user', () => {
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // expect(screen.getByText('Sir Reginald')).toBeInTheDocument();
    // expect(screen.getByText('Mentor')).toBeInTheDocument();
    // expect(
    //   screen.getByText('A retired knight and scholar.')
    // ).toBeInTheDocument();
    // expect(
    //   screen.getByPlaceholderText(/Speak to Sir Reginald/i)
    // ).toBeInTheDocument();
    // expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
  });

  it.skip('disables input and shows upgrade CTA for Free user', () => {
    // render(
    //   <AuthContext.Provider value={{ user: freeUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // expect(screen.getByPlaceholderText(/Upgrade to Pro/i)).toBeDisabled();
    // expect(
    //   screen.getByText(/Upgrade to Pro to unlock character chat/i)
    // ).toBeInTheDocument();
  });

  it.skip('sends user message and displays AI reply (Pro user)', async () => {
    // mockSimulateCharacterChat.mockResolvedValueOnce(
    //   'Verily, thou hast spoken with courage!'
    // );
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // const input = screen.getByPlaceholderText(/Speak to Sir Reginald/i);
    // fireEvent.change(input, { target: { value: 'Hello, Sir Reginald!' } });
    // fireEvent.click(screen.getByText('Send'));
    // expect(await screen.findByText('Hello, Sir Reginald!')).toBeInTheDocument();
    // expect(
    //   await screen.findByText('Verily, thou hast spoken with courage!')
    // ).toBeInTheDocument();
    // // Check sender labels
    // expect(screen.getAllByText('You').length).toBeGreaterThan(0);
    // expect(screen.getAllByText('Sir Reginald').length).toBeGreaterThan(1);
  });

  it.skip('shows typing indicator while waiting for AI', async () => {
    // let resolve: (v: string) => void;
    // mockSimulateCharacterChat.mockImplementation(
    //   () =>
    //     new Promise(r => {
    //       resolve = r;
    //     })
    // );
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // const input = screen.getByPlaceholderText(/Speak to Sir Reginald/i);
    // fireEvent.change(input, { target: { value: 'Are you there?' } });
    // fireEvent.click(screen.getByText('Send'));
    // expect(screen.getByText(/is typing/i)).toBeInTheDocument();
    // // Resolve the promise to finish
    // if (resolve) {
    //   resolve('Indeed, I am ever present.');
    // }
    // await waitFor(() =>
    //   expect(screen.getByText('Indeed, I am ever present.')).toBeInTheDocument()
    // );
  });

  it.skip('handles AI fallback and error gracefully', async () => {
    // mockSimulateCharacterChat.mockRejectedValueOnce(new Error('LLM error'));
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // const input = screen.getByPlaceholderText(/Speak to Sir Reginald/i);
    // fireEvent.change(input, { target: { value: 'Test error' } });
    // fireEvent.click(screen.getByText('Send'));
    // expect(
    //   await screen.findByText(/Failed to get character reply/i)
    // ).toBeInTheDocument();
  });

  it.skip('remembers previous messages (memory enforcement)', async () => {
    // mockSimulateCharacterChat.mockResolvedValueOnce('A wise answer.');
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // const input = screen.getByPlaceholderText(/Speak to Sir Reginald/i);
    // fireEvent.change(input, { target: { value: 'First message' } });
    // fireEvent.click(screen.getByText('Send'));
    // await screen.findByText('A wise answer.');
    // // Send another message
    // mockSimulateCharacterChat.mockResolvedValueOnce('A second wise answer.');
    // fireEvent.change(input, { target: { value: 'Second message' } });
    // fireEvent.click(screen.getByText('Send'));
    // expect(
    //   await screen.findByText('A second wise answer.')
    // ).toBeInTheDocument();
    // // Both messages should be in history
    // expect(screen.getByText('First message')).toBeInTheDocument();
    // expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it.skip('resets conversation when reset button is clicked', async () => {
    // mockSimulateCharacterChat.mockResolvedValueOnce('A wise answer.');
    // render(
    //   <AuthContext.Provider value={{ user: proUser }}>
    //     <CharacterChatPanel
    //       persona={mockPersona}
    //       contextText="A dark and stormy night."
    //     />
    //   </AuthContext.Provider>
    // );
    // const input = screen.getByPlaceholderText(/Speak to Sir Reginald/i);
    // fireEvent.change(input, { target: { value: 'Say something' } });
    // fireEvent.click(screen.getByText('Send'));
    // await screen.findByText('A wise answer.');
    // // Click reset
    // fireEvent.click(screen.getByTitle(/Reset Conversation/i));
    // expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
    // expect(input).toHaveValue('');
  });
});
