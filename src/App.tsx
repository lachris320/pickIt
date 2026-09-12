import React from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { SessionHubScreen } from './screens/SessionHubScreen';
import { LiveScoreboardScreen } from './screens/LiveScoreboardScreen';
import { StandaloneScoreboardScreen } from './screens/StandaloneScoreboardScreen';
import { SetupScreen } from './screens/SetupScreen';

const AppContent: React.FC = () => {
  const { currentScreen } = useSession();

  switch (currentScreen.type) {
    case 'SESSION_HUB':
      return <SessionHubScreen />;
    case 'SETUP':
      return <SetupScreen />;
    case 'LIVE_SCOREBOARD':
      return <LiveScoreboardScreen courtId={currentScreen.courtId} />;
    case 'STANDALONE_SCOREBOARD':
      return <StandaloneScoreboardScreen />;
    default:
      return <SessionHubScreen />;
  }
};

export const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;
