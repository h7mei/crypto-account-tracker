import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { SelectedWalletProvider } from './context/SelectedWalletContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectedWalletProvider>
          <PreferencesProvider>
            <RouterProvider router={router} />
          </PreferencesProvider>
        </SelectedWalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}