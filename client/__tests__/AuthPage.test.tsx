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

  it('renders the sign-up form with Google signup button', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Verify that the form fields and Google button exist
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument();
    expect(screen.getByTestId('google-signup')).toBeInTheDocument();
  });

  it('handles valid sign-up form submission', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Fill out the form with valid data
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));

    // Expect the createUser function to be called with correct arguments
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith('user@example.com', 'StrongPassword123');
    });
  });

  it('handles sign-up with Google', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Click the Google Sign-Up button
    const googleSignUpButton = screen.getByTestId('google-signup');
    await user.click(googleSignUpButton);

    // Expect loginWithGoogle to be called
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it('shows an error for an invalid email', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Fill out the form with an invalid email
    await user.type(screen.getByTestId('email-input'), 'invalidemail');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));

    // Verify error message for invalid email
    expect(await screen.findByTestId('email-error')).toHaveTextContent('Invalid email format');
  });

  it('shows an error when the password is missing', async () => {
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Fill out the form without a password
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.click(screen.getByTestId('signup-submit'));

    // Verify error message for missing password
    expect(await screen.findByTestId('password-error')).toHaveTextContent('Password is required');
  });

  it('shows a server-side error when createUser fails', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('Email already exists'));
    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    await user.click(signUpTab);

    // Fill out the form with duplicate email
    await user.type(screen.getByTestId('email-input'), 'existinguser@example.com');
    await user.type(screen.getByTestId('password-input'), 'StrongPassword123');
    await user.click(screen.getByTestId('signup-submit'));

    // Verify error message for duplicate email
    expect(await screen.findByTestId('email-error')).toHaveTextContent('Email already exists');
  });

  it('disables the submit button and shows loading state when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      createUser: mockCreateUser,
      login: jest.fn(),
      forgotPassword: jest.fn(),
      loginWithGoogle: mockLoginWithGoogle,
      isLoading: true,
    });

    render(<AuthPage />);
    const user = userEvent.setup();

    // Switch to the Sign-Up tab
    const signUpTab = screen.getByText('Sign Up');
    user.click(signUpTab);

    // Verify submit button is disabled and shows loading text
    const submitButton = screen.getByTestId('signup-submit');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Signing Up...');
  });
});