import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '@/components/auth-page';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AuthPage', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      user: null,
    });
  });

  it('renders login form', () => {
    render(<AuthPage />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signin-submit')).toBeInTheDocument();
  });

  it('handles valid email and password (Test Case 1)', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);
    await user.type(screen.getByTestId('email-input'), 'valid@example.com');
    await user.type(screen.getByTestId('password-input'), 'validPassword123');
    await user.click(screen.getByTestId('signin-submit'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('valid@example.com', 'validPassword123');
    });
  });

  it('handles valid email and invalid password (Test Case 2)', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Incorrect Password'));
    const user = userEvent.setup();
    render(<AuthPage />);
    await user.type(screen.getByTestId('email-input'), 'valid@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongPassword');
    await user.click(screen.getByTestId('signin-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Incorrect Password');
    });
  });

  it('handles invalid email and valid password (Test Case 3)', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);
    await user.type(screen.getByTestId('email-input'), 'invalid@example');
    await user.type(screen.getByTestId('password-input'), 'validPassword123');
    await user.click(screen.getByTestId('signin-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
    });
  });

  it('shows error for empty password (Test Case 4)', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);
    await user.type(screen.getByTestId('email-input'), 'valid@example.com');
    await user.click(screen.getByTestId('signin-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });

  it('shows error for empty username (Test Case 5)', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);
    await user.type(screen.getByTestId('password-input'), 'validPassword123');
    await user.click(screen.getByTestId('signin-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    });
  });
});
