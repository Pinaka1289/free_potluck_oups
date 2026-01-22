# Feature: User Authentication
# PotluckPartys - Sign Up, Sign In, Sign Out, Password Reset

Feature: User Authentication
  As a user
  I want to create an account and manage my authentication
  So that I can manage my events from a dashboard

  Background:
    Given I am on the PotluckPartys website

  # ==========================================
  # Scenario: Email Sign Up
  # ==========================================
  @auth @signup @happy-path
  Scenario: User signs up with email and password
    When I navigate to the "/auth" page
    And I click the "Sign Up" tab
    And I fill in the following signup details:
      | Field         | Value              |
      | Full Name     | Jane Doe           |
      | Email         | jane@example.com   |
      | Password      | SecurePass123!     |
    And I click the "Create Account" button
    Then I should see a success toast "Account created! Please check your email to verify."
    And I should receive a verification email at "jane@example.com"

  @auth @signup @validation @password
  Scenario: User cannot sign up with weak password
    When I navigate to the "/auth" page
    And I click the "Sign Up" tab
    And I fill in email "test@example.com"
    And I fill in password "123"
    And I click the "Create Account" button
    Then I should see an error message about password requirements

  @auth @signup @validation @email
  Scenario: User cannot sign up with invalid email
    When I navigate to the "/auth" page
    And I click the "Sign Up" tab
    And I fill in email "invalid-email"
    And I fill in password "SecurePass123!"
    And I click the "Create Account" button
    Then I should see an error message about invalid email format

  @auth @signup @duplicate
  Scenario: User cannot sign up with existing email
    Given a user exists with email "existing@example.com"
    When I navigate to the "/auth" page
    And I click the "Sign Up" tab
    And I fill in email "existing@example.com"
    And I fill in password "SecurePass123!"
    And I click the "Create Account" button
    Then I should see an error message "User already registered"

  # ==========================================
  # Scenario: Email Sign In
  # ==========================================
  @auth @signin @happy-path
  Scenario: User signs in with valid credentials
    Given a verified user exists with email "user@example.com" and password "ValidPass123!"
    When I navigate to the "/auth" page
    And I fill in email "user@example.com"
    And I fill in password "ValidPass123!"
    And I click the "Sign In" button
    Then I should see a success toast "Welcome back!"
    And I should be redirected to the dashboard
    And I should see my email in the header

  @auth @signin @invalid-credentials
  Scenario: User cannot sign in with wrong password
    Given a user exists with email "user@example.com"
    When I navigate to the "/auth" page
    And I fill in email "user@example.com"
    And I fill in password "WrongPassword123!"
    And I click the "Sign In" button
    Then I should see an error toast "Invalid login credentials"
    And I should remain on the auth page

  @auth @signin @non-existent
  Scenario: User cannot sign in with non-existent email
    When I navigate to the "/auth" page
    And I fill in email "nobody@example.com"
    And I fill in password "AnyPassword123!"
    And I click the "Sign In" button
    Then I should see an error toast "Invalid login credentials"

  # ==========================================
  # Scenario: Password Visibility Toggle
  # ==========================================
  @auth @password-visibility
  Scenario: User toggles password visibility
    When I navigate to the "/auth" page
    And I fill in password "MySecretPassword"
    Then the password field should show dots/bullets
    When I click the "Show Password" toggle
    Then the password should be visible as "MySecretPassword"
    When I click the "Hide Password" toggle
    Then the password field should show dots/bullets again

  # ==========================================
  # Scenario: Google OAuth Sign In
  # ==========================================
  @auth @google @signin
  Scenario: User signs in with Google account
    When I navigate to the "/auth" page
    And I click the "Continue with Google" button
    Then I should be redirected to Google OAuth page
    When I authenticate with my Google account
    Then I should be redirected back to the dashboard
    And I should be logged in with my Google email

  @auth @google @signup
  Scenario: New user signs up via Google OAuth
    When I navigate to the "/auth" page
    And I click the "Continue with Google" button
    And I authenticate with a new Google account
    Then a new account should be created
    And I should be redirected to the dashboard
    And I should see a welcome message

  # ==========================================
  # Scenario: Forgot Password
  # ==========================================
  @auth @forgot-password @happy-path
  Scenario: User requests password reset
    Given a user exists with email "forgetful@example.com"
    When I navigate to the "/auth" page
    And I click the "Forgot password?" link
    Then I should see the "Reset Password" form
    When I fill in email "forgetful@example.com"
    And I click the "Send Reset Link" button
    Then I should see a success toast "Password reset email sent!"
    And I should receive a password reset email

  @auth @forgot-password @invalid-email
  Scenario: User requests reset for non-existent email
    When I navigate to the "/auth" page
    And I click the "Forgot password?" link
    And I fill in email "nobody@example.com"
    And I click the "Send Reset Link" button
    Then I should see a message about checking email
    # Note: For security, we don't reveal if email exists

  @auth @reset-password @happy-path
  Scenario: User sets new password from reset link
    Given I have clicked a valid password reset link
    When I am on the "/auth/reset-password" page
    And I fill in new password "NewSecurePass456!"
    And I confirm the new password "NewSecurePass456!"
    And I click the "Set New Password" button
    Then I should see a success toast "Your password has been updated successfully!"
    And I should be redirected to the dashboard

  @auth @reset-password @mismatch
  Scenario: User enters mismatched passwords during reset
    Given I have clicked a valid password reset link
    When I fill in new password "NewPass123!"
    And I confirm the new password "DifferentPass456!"
    And I click the "Set New Password" button
    Then I should see an error toast "Passwords do not match"

  # ==========================================
  # Scenario: Sign Out
  # ==========================================
  @auth @signout @happy-path
  Scenario: User signs out from header menu
    Given I am logged in as "user@example.com"
    When I click on my profile in the header
    And I click "Sign Out"
    Then I should be redirected to the homepage
    And I should see the "Sign In" button in the header
    And I should not be logged in

  @auth @signout @mobile
  Scenario: User signs out from mobile menu
    Given I am logged in as "user@example.com"
    And I am on a mobile device
    When I open the mobile menu
    And I tap "Sign Out"
    Then I should be redirected to the homepage
    And I should not be logged in

  # ==========================================
  # Scenario: Protected Routes
  # ==========================================
  @auth @protected @dashboard
  Scenario: Unauthenticated user is redirected from dashboard
    Given I am not logged in
    When I try to navigate to "/dashboard"
    Then I should be redirected to "/auth"
    And the URL should contain "redirectedFrom=/dashboard"

  @auth @protected @redirect-back
  Scenario: User is redirected back after login
    Given I am not logged in
    And I tried to access "/dashboard"
    And I was redirected to "/auth?redirectedFrom=/dashboard"
    When I sign in successfully
    Then I should be redirected to "/dashboard"
