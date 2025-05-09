import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '@/components/auth-page';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
  usePathname() {
    return '/login';
  },
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

describe('AuthPage-SignUpCases', () => {
  const mockCreateUser = jest.fn();
  const mockLoginWithGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      createUser: mockCreateUser,
      login: jest.fn(),
      forgotPassword: jest.fn(),
      loginWithGoogle: mockLoginWithGoogle,
      isLoading: false,
      error: null,
    });
  });

  it('renders the signup form with Google signup button', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up'); //Switch to signup
    await user.click(signUpTab);
    expect(screen.getByTestId('email-input')).toBeInTheDocument(); // Verify that the form fields and Google button exist
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument();
    expect(screen.getByTestId('google-signup')).toBeInTheDocument();
  });

  it('handles valid signup form submission', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith('user@example.com', 'StrongPassword123');
    });
  });

  it('handles signup with Google', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);
    const googleSignUpButton = screen.getByTestId('google-signup');
    await user.click(googleSignUpButton);
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it('shows an error for an invalid email', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);
    await user.type(screen.getByTestId('email-input'), 'invalidemail');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));
    expect(await screen.findByTestId('email-error')).toHaveTextContent('Invalid email format');
  });

  it('shows an error when the password is missing', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.click(screen.getByTestId('signup-submit'));
    expect(await screen.findByTestId('password-error')).toHaveTextContent('Password is required');
  });

  it('shows a server-side error when createUser fails', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('Email already exists'));
    render(<AuthPage />);
    const user = userEvent.setup();
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);
    await user.type(screen.getByTestId('email-input'), 'existinguser@example.com');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));
    expect(await screen.findByTestId('email-error')).toHaveTextContent('Email already exists');
  });

  it('disables the submit button and shows loading state when isLoading is true', async () => {
    // Mock the useAuth hook with isLoading set to true
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      createUser: jest.fn(),
      loginWithGoogle: jest.fn(),
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>,
    );

    // Click the Sign Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Wait for the signup form to be rendered
    await waitFor(() => {
      const submitButton = screen.getByTestId('signup-submit');
      expect(submitButton).toBeInTheDocument();
    });

    // Now we can safely assert the button state
    const submitButton = screen.getByTestId('signup-submit');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Signing Up...');
  });
});