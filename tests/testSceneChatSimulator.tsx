import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SceneChatSimulator from '../src/components/SceneChatSimulator';
import { AuthContext } from '../src/contexts/AuthContext';
import * as simulateSceneModule from '../src/services/simulateSceneDialog';
import * as useSceneConfigModule from '../src/hooks/useSceneConfig';
import { ExtendedUser } from '../src/contexts/AuthContext';

jest.useFakeTimers();

// Mock users with required ExtendedUser properties
const proUser: ExtendedUser = {
  id: 'user-1',
  tier: 'Pro',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};
const freeUser: ExtendedUser = {
  id: 'user-2',
  tier: 'Free',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const mockPersonas = [
  {
    id: 'c1',
    user_id: 'user-1',
    name: 'Alice',
    archetype: 'Hero',
    goals: '',
    voiceStyle: '',
    worldview: '',
    personality: '',
    knownConnections: [],
    traits: {},
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c2',
    user_id: 'user-1',
    name: 'Bob',
    archetype: 'Mentor',
    goals: '',
    voiceStyle: '',
    worldview: '',
    personality: '',
    knownConnections: [],
    traits: {},
    created_at: '',
    updated_at: '',
  },
];
const mockScene = {
  id: 'scene-1',
  title: 'Test Scene',
  setting: 'A test setting',
  tone: 'Serious',
  objective: 'Test objective',
  participants: mockPersonas,
};
const mockMessages = [
  { speakerName: 'Alice', text: 'Hello, Bob!', timestamp: 1 },
  { speakerName: 'Bob', text: 'Hello, Alice!', timestamp: 2 },
];

jest.mock('../src/services/simulateSceneDialog', () => ({
  ...jest.requireActual('../src/services/simulateSceneDialog'),
  simulateSceneDialog: jest.fn(),
}));
jest.mock('../src/hooks/useSceneConfig', () => ({
  useSceneConfig: jest.fn(),
}));
const mockUseSceneConfig = useSceneConfigModule.useSceneConfig as jest.Mock;

function setup(user = proUser, scene = mockScene, messages = mockMessages) {
  mockUseSceneConfig.mockReturnValue({
    config: scene,
    updateScene: jest.fn(),
    saveScene: jest.fn(),
    loading: false,
    error: null,
  });
  return render(
    <AuthContext.Provider value={{ user }}>
      <SceneChatSimulator sceneId="scene-1" />
    </AuthContext.Provider>
  );
}

describe('SceneChatSimulator', () => {
  it('renders participant avatars and messages', () => {
    setup();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/avatar/i).length).toBeGreaterThan(1);
  });

  it('starts playback on Play Scene click and respects timing', () => {
    setup();
    fireEvent.click(screen.getByLabelText(/Play Scene/i));
    act(() => {
      jest.advanceTimersByTime(1600);
    });
    expect(screen.getByText('Alice:')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1600);
    });
    expect(screen.getByText('Bob:')).toBeInTheDocument();
  });

  it('pauses and resumes playback', () => {
    setup();
    fireEvent.click(screen.getByLabelText(/Play Scene/i));
    fireEvent.click(screen.getByLabelText(/Pause/i));
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    // Should not advance
    expect(screen.queryByText('Bob:')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Resume/i));
    act(() => {
      jest.advanceTimersByTime(1600);
    });
    expect(screen.getByText('Bob:')).toBeInTheDocument();
  });

  it('skips to end on Skip click', () => {
    setup();
    fireEvent.click(screen.getByLabelText(/Play Scene/i));
    fireEvent.click(screen.getByLabelText(/Skip to End/i));
    expect(screen.getByText('Bob:')).toBeInTheDocument();
  });

  it('shows current speaker with visual highlight', () => {
    setup();
    fireEvent.click(screen.getByLabelText(/Play Scene/i));
    act(() => {
      jest.advanceTimersByTime(1600);
    });
    const highlighted = screen
      .getAllByRole('listitem')
      .find(el => el.getAttribute('aria-current') === 'step');
    expect(highlighted).toBeTruthy();
  });

  it('hides Pro-only content for Free users', () => {
    setup(freeUser);
    expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Play Scene/i)).not.toBeInTheDocument();
  });

  it('handles empty or malformed scenes gracefully', () => {
    mockUseSceneConfig.mockReturnValue({
      config: null,
      loading: false,
      error: null,
    });
    render(
      <AuthContext.Provider value={{ user: proUser }}>
        <SceneChatSimulator sceneId="scene-1" />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/No scene loaded/i)).toBeInTheDocument();
  });

  it('has ARIA roles and live region for playback progress', () => {
    setup();
    expect(screen.getByLabelText(/Scene Playback Panel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Playback Progress/i)).toBeInTheDocument();
  });

  it('matches snapshot for key UI states', () => {
    const { asFragment } = setup();
    expect(asFragment()).toMatchSnapshot();
  });
});
