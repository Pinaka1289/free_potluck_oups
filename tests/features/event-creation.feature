# Feature: Event Creation
# PotluckPartys - Create Potluck Events

Feature: Event Creation
  As a user (guest or registered)
  I want to create potluck events
  So that I can organize gatherings with friends and family

  Background:
    Given I am on the PotluckPartys website

  # ==========================================
  # Scenario: Guest creates event without sign up
  # ==========================================
  @guest @event-creation @happy-path
  Scenario: Guest user creates a potluck event without signing up
    Given I am not logged in
    When I navigate to the "Create Event" page
    And I fill in the event title "Summer BBQ Party"
    And I fill in the description "Annual neighborhood BBQ"
    And I select the event date "2026-07-15"
    And I select the event time "14:00"
    And I fill in the location "123 Main Street, Park Area"
    And I fill in the host name "John Doe"
    And I fill in the host email "john@example.com"
    And I click the "Create Event" button
    Then I should be redirected to the event page
    And I should see the event title "Summer BBQ Party"
    And I should see a shareable link for the event
    And I should see a QR code for the event
    And I should see a success toast message "Event created successfully!"

  @guest @event-creation @minimal
  Scenario: Guest creates event with minimal information (title only)
    Given I am not logged in
    When I navigate to the "Create Event" page
    And I fill in the event title "Quick Potluck"
    And I click the "Create Event" button
    Then I should be redirected to the event page
    And I should see the event title "Quick Potluck"
    And I should see a shareable link for the event

  @guest @event-creation @validation
  Scenario: User cannot create event without title
    Given I am not logged in
    When I navigate to the "Create Event" page
    And I leave the event title empty
    And I click the "Create Event" button
    Then I should see an error toast message "Please enter an event title"
    And I should remain on the "Create Event" page

  # ==========================================
  # Scenario: Logged-in user creates event
  # ==========================================
  @authenticated @event-creation
  Scenario: Logged-in user creates a potluck event
    Given I am logged in as "user@example.com"
    When I navigate to the "Create Event" page
    And I fill in the event title "Birthday Dinner"
    And I fill in the description "Celebrating my 30th birthday"
    And I select the event date "2026-08-20"
    And I select the event time "19:00"
    And I fill in the location "My Home, 456 Oak Avenue"
    And I click the "Create Event" button
    Then I should be redirected to the event page
    And I should see the event title "Birthday Dinner"
    And the event should be linked to my account
    And the event should appear in my dashboard

  @authenticated @event-creation @full-details
  Scenario: Logged-in user creates event with all details
    Given I am logged in as "user@example.com"
    When I navigate to the "Create Event" page
    And I fill in the following event details:
      | Field       | Value                           |
      | Title       | Thanksgiving Feast              |
      | Description | Family gathering for Thanksgiving|
      | Date        | 2026-11-26                      |
      | Time        | 15:00                           |
      | Location    | Grandma's House, 789 Elm St     |
      | Host Name   | Sarah Smith                     |
      | Host Email  | sarah@example.com               |
    And I click the "Create Event" button
    Then I should be redirected to the event page
    And I should see all the event details displayed correctly
