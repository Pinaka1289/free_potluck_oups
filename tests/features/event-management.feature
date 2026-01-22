# Feature: Event Management
# PotluckPartys - View, Edit, and Delete Events

Feature: Event Management
  As a user with access to an event link
  I want to view, edit, and manage event details
  So that I can keep event information up to date

  Background:
    Given I am on the PotluckPartys website
    And an event exists with slug "summer-bbq-2026"
    And the event has the following details:
      | Title       | Summer BBQ Party              |
      | Description | Annual neighborhood BBQ       |
      | Date        | 2026-07-15                    |
      | Time        | 14:00                         |
      | Location    | 123 Main Street, Park Area    |

  # ==========================================
  # Scenario: Viewing Event Details
  # ==========================================
  @event-view @happy-path
  Scenario: User views event details via shareable link
    When I navigate to "/event/summer-bbq-2026"
    Then I should see the event title "Summer BBQ Party"
    And I should see the event description "Annual neighborhood BBQ"
    And I should see the event date "July 15, 2026"
    And I should see the event time "2:00 PM"
    And I should see the event location "123 Main Street, Park Area"
    And I should see the "Share this link" banner
    And I should see the QR code for the event

  @event-view @statistics
  Scenario: User views event statistics
    Given the event has the following items:
      | Item Name    | Claimed By |
      | Chips        | Alice      |
      | Drinks       | Bob        |
      | Salad        | (unclaimed)|
    When I navigate to "/event/summer-bbq-2026"
    Then I should see "3 Total Items"
    And I should see "2 Claimed"
    And I should see "1 Available"
    And I should see "2 Participants"

  @event-view @not-found
  Scenario: User tries to access non-existent event
    When I navigate to "/event/non-existent-event"
    Then I should see the "Event Not Found" page
    And I should see a link to create a new event

  # ==========================================
  # Scenario: Editing Event Details
  # ==========================================
  @event-edit @happy-path
  Scenario: User edits event details
    When I navigate to "/event/summer-bbq-2026"
    And I click the "Edit Event" button
    Then I should see the "Edit Event" modal
    When I update the event title to "Summer BBQ Party 2026"
    And I update the location to "Central Park Pavilion"
    And I click the "Save Changes" button
    Then I should see a success toast "Event updated successfully!"
    And I should see the updated title "Summer BBQ Party 2026"
    And I should see the updated location "Central Park Pavilion"

  @event-edit @validation
  Scenario: User cannot save event with empty title
    When I navigate to "/event/summer-bbq-2026"
    And I click the "Edit Event" button
    And I clear the event title field
    And I click the "Save Changes" button
    Then I should see an error toast "Title is required"
    And the modal should remain open

  @event-edit @cancel
  Scenario: User cancels event editing
    When I navigate to "/event/summer-bbq-2026"
    And I click the "Edit Event" button
    And I update the event title to "Changed Title"
    And I click the "Cancel" button
    Then the modal should close
    And I should still see the original title "Summer BBQ Party"

  # ==========================================
  # Scenario: Copying Event Link
  # ==========================================
  @event-share @copy-link
  Scenario: User copies event link to clipboard
    When I navigate to "/event/summer-bbq-2026"
    And I click the "Copy Link" button
    Then I should see a success toast "Link copied to clipboard!"
    And the clipboard should contain the event URL

  @event-share @qr-code
  Scenario: User views and downloads QR code
    When I navigate to "/event/summer-bbq-2026"
    Then I should see the QR code displayed on the page
    When I click the "Download QR Code" button
    Then the QR code image should be downloaded
    And I should see a success toast "QR Code downloaded!"
