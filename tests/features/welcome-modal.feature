# Feature: Welcome Modal for First-Time Visitors
# PotluckPartys - Prompt users to sign in or continue without login

Feature: Welcome Modal for Event Visitors
  As a first-time visitor to an event page
  I want to be prompted about signing in
  So that I can optionally save the event to my dashboard

  Background:
    Given I am on the PotluckPartys website
    And an event exists with slug "team-potluck" and title "Team Potluck"

  # ==========================================
  # Scenario: First-Time Visit - Guest User
  # ==========================================
  @welcome-modal @guest @first-visit
  Scenario: Guest user sees welcome modal on first visit
    Given I am not logged in
    And I have never visited "team-potluck" before
    When I navigate to "/event/team-potluck"
    Then I should see the welcome modal
    And the modal title should be "Welcome to Team Potluck!"
    And I should see the event details (date, time, location)
    And I should see "Sign in to save this event" option
    And I should see "Continue without signing in" option
    And I should see text indicating login is optional

  @welcome-modal @guest @continue
  Scenario: Guest user continues without logging in
    Given I am not logged in
    And I see the welcome modal
    When I click "Continue without signing in"
    Then the modal should close
    And I should see the full event page
    And I should be able to add and claim items

  @welcome-modal @guest @signin
  Scenario: Guest user chooses to sign in
    Given I am not logged in
    And I see the welcome modal
    When I click "Sign in to save this event"
    Then I should be redirected to "/auth"
    And the URL should include redirect parameter for the event
    And the event slug should be stored for later

  @welcome-modal @guest @signin-redirect
  Scenario: Guest user returns to event after signing in
    Given I clicked "Sign in to save this event" from event "team-potluck"
    And I was redirected to the auth page
    When I sign in successfully
    Then I should be redirected back to "/event/team-potluck"
    And the event should be automatically saved to my dashboard
    And I should see a success toast "Event saved to your dashboard!"

  # ==========================================
  # Scenario: First-Time Visit - Logged-In User
  # ==========================================
  @welcome-modal @authenticated @first-visit
  Scenario: Logged-in user sees welcome modal on first visit
    Given I am logged in as "user@example.com"
    And I have never visited "team-potluck" before
    When I navigate to "/event/team-potluck"
    Then I should see the welcome modal
    And I should see "Add to my dashboard" option
    And I should see "Continue to Event" button

  @welcome-modal @authenticated @save
  Scenario: Logged-in user saves event to dashboard
    Given I am logged in as "user@example.com"
    And I see the welcome modal
    When I click "Add to my dashboard"
    Then I should see a success toast "Event added to your dashboard!"
    And the event should appear in my dashboard
    And the modal should close

  @welcome-modal @authenticated @continue
  Scenario: Logged-in user continues without saving
    Given I am logged in as "user@example.com"
    And I see the welcome modal
    When I click "Continue to Event"
    Then the modal should close
    And I should see the event page
    And I should see the "Save to Dashboard" button in the header

  @welcome-modal @authenticated @already-saved
  Scenario: Logged-in user visits already-saved event
    Given I am logged in as "user@example.com"
    And "team-potluck" is already in my dashboard
    And I have never visited "team-potluck" before
    When I navigate to "/event/team-potluck"
    Then I should see the welcome modal
    And I should see "This event is already in your dashboard!" message
    And I should see "View Event" button

  # ==========================================
  # Scenario: Repeat Visits
  # ==========================================
  @welcome-modal @repeat-visit @guest
  Scenario: Guest user does not see modal on repeat visit
    Given I am not logged in
    And I have previously visited "team-potluck"
    When I navigate to "/event/team-potluck"
    Then I should NOT see the welcome modal
    And I should see the event page directly

  @welcome-modal @repeat-visit @authenticated
  Scenario: Logged-in user does not see modal on repeat visit
    Given I am logged in as "user@example.com"
    And I have previously visited "team-potluck"
    When I navigate to "/event/team-potluck"
    Then I should NOT see the welcome modal
    And I should see the event page directly

  # ==========================================
  # Scenario: Event Owner Visit
  # ==========================================
  @welcome-modal @owner
  Scenario: Event owner does not see welcome modal
    Given I am logged in as the owner of "team-potluck"
    And I have never visited "team-potluck" event page
    When I navigate to "/event/team-potluck"
    Then I should NOT see the welcome modal
    And I should see the event page with owner controls

  # ==========================================
  # Scenario: Save to Dashboard Button
  # ==========================================
  @save-button @header
  Scenario: Save to Dashboard button appears for non-saved events
    Given I am logged in as "user@example.com"
    And "team-potluck" is NOT in my dashboard
    And I dismissed the welcome modal
    When I view the event page
    Then I should see "Save to Dashboard" button in the event header

  @save-button @click
  Scenario: User saves event via header button
    Given I am logged in as "user@example.com"
    And I see the "Save to Dashboard" button
    When I click "Save to Dashboard"
    Then I should see a success toast "Event saved to your dashboard!"
    And the button should change to show "Saved ✓"
    And the event should appear in my dashboard

  @save-button @hidden
  Scenario: Save button hidden for already-saved events
    Given I am logged in as "user@example.com"
    And "team-potluck" is already in my dashboard
    When I view the event page
    Then I should NOT see the "Save to Dashboard" button
    # Alternative: Or I should see a "Saved ✓" indicator
