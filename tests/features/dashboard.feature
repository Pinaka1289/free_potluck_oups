# Feature: User Dashboard
# PotluckPartys - Manage Events from Dashboard

Feature: User Dashboard
  As a logged-in user
  I want to view and manage all my events from a dashboard
  So that I can easily access and organize my potlucks

  Background:
    Given I am logged in as "user@example.com"
    And I have the following events:
      | Title              | Date       | Location          | Items |
      | Summer BBQ         | 2026-07-15 | Central Park      | 5     |
      | Birthday Party     | 2026-08-20 | My House          | 8     |
      | Holiday Potluck    | 2025-12-25 | Community Center  | 12    |

  # ==========================================
  # Scenario: Viewing Dashboard
  # ==========================================
  @dashboard @view @happy-path
  Scenario: User views their dashboard with events
    When I navigate to "/dashboard"
    Then I should see the dashboard header with my name
    And I should see the "Create New Event" button
    And I should see the "Add by Link" button
    And I should see my events listed

  @dashboard @statistics
  Scenario: User sees event statistics on dashboard
    When I navigate to "/dashboard"
    Then I should see "Total Events" count as "3"
    And I should see "Upcoming" count as "2"
    And I should see "Total Items" count as "25"

  @dashboard @empty
  Scenario: New user sees empty dashboard
    Given I have no events
    When I navigate to "/dashboard"
    Then I should see "No events yet" message
    And I should see "Create Your First Event" button
    And I should see the "Add by Link" button

  # ==========================================
  # Scenario: Event Organization
  # ==========================================
  @dashboard @upcoming-events
  Scenario: Dashboard shows upcoming events section
    When I navigate to "/dashboard"
    Then I should see "Upcoming Events" section
    And "Summer BBQ" should be in the upcoming section
    And "Birthday Party" should be in the upcoming section

  @dashboard @past-events
  Scenario: Dashboard shows past events section
    When I navigate to "/dashboard"
    Then I should see "Past Events" section
    And "Holiday Potluck" should be in the past section

  @dashboard @event-details
  Scenario: Each event shows key information
    When I navigate to "/dashboard"
    Then each event should display:
      | Information |
      | Title       |
      | Date        |
      | Time        |
      | Location    |
      | Item count  |
      | QR code     |

  # ==========================================
  # Scenario: Search Events
  # ==========================================
  @dashboard @search @happy-path
  Scenario: User searches events by title
    When I navigate to "/dashboard"
    And I type "BBQ" in the search field
    Then I should only see "Summer BBQ" in the results
    And "Birthday Party" should not be visible

  @dashboard @search @location
  Scenario: User searches events by location
    When I navigate to "/dashboard"
    And I type "Park" in the search field
    Then I should see "Summer BBQ" in the results

  @dashboard @search @no-results
  Scenario: Search with no matching results
    When I navigate to "/dashboard"
    And I type "Nonexistent Event" in the search field
    Then I should see "No events found matching" message

  @dashboard @search @clear
  Scenario: User clears search to see all events
    Given I have searched for "BBQ"
    When I clear the search field
    Then I should see all my events again

  # ==========================================
  # Scenario: Event Actions
  # ==========================================
  @dashboard @copy-link
  Scenario: User copies event link from dashboard
    When I navigate to "/dashboard"
    And I click the "Copy" button for "Summer BBQ"
    Then I should see a success toast "Link copied to clipboard!"
    And the clipboard should contain the event URL

  @dashboard @view-event
  Scenario: User navigates to event from dashboard
    When I navigate to "/dashboard"
    And I click the "View" button for "Summer BBQ"
    Then I should be redirected to the "Summer BBQ" event page

  @dashboard @click-title
  Scenario: User clicks event title to view
    When I navigate to "/dashboard"
    And I click on the title "Summer BBQ"
    Then I should be redirected to the "Summer BBQ" event page

  # ==========================================
  # Scenario: Delete Events
  # ==========================================
  @dashboard @delete @happy-path
  Scenario: User deletes an owned event
    When I navigate to "/dashboard"
    And I click the delete button for "Birthday Party"
    Then I should see a confirmation dialog "Are you sure you want to delete this event?"
    When I confirm the deletion
    Then I should see a success toast "Event deleted successfully"
    And "Birthday Party" should no longer appear in my events
    And "Total Events" count should be "2"

  @dashboard @delete @cancel
  Scenario: User cancels event deletion
    When I navigate to "/dashboard"
    And I click the delete button for "Summer BBQ"
    And I cancel the deletion
    Then "Summer BBQ" should still appear in my events

  # ==========================================
  # Scenario: QR Code Features
  # ==========================================
  @dashboard @qr-code @display
  Scenario: User sees QR codes for each event
    When I navigate to "/dashboard"
    Then each event card should display a small QR code
    And the QR code should be clickable

  @dashboard @qr-code @enlarge
  Scenario: User enlarges QR code
    When I navigate to "/dashboard"
    And I click on the QR code for "Summer BBQ"
    Then I should see a modal with a larger QR code
    And I should see the event title in the modal
    And I should see "Download" and "Copy Link" buttons

  @dashboard @qr-code @download
  Scenario: User downloads QR code from dashboard
    When I navigate to "/dashboard"
    And I click on the QR code for "Summer BBQ"
    And I click the "Download" button
    Then a PNG image of the QR code should be downloaded
    And I should see a success toast "QR code downloaded!"

  # ==========================================
  # Scenario: Add Event by Link
  # ==========================================
  @dashboard @add-by-link @happy-path
  Scenario: User adds event by pasting full URL
    Given an event exists with slug "friends-dinner"
    When I navigate to "/dashboard"
    And I click the "Add by Link" button
    Then I should see the "Add Event to Dashboard" modal
    When I paste "https://potluckpartys.com/event/friends-dinner"
    And I click "Add Event"
    Then I should see a success toast containing "added to your dashboard"
    And the event should appear in my dashboard with "Saved" badge

  @dashboard @add-by-link @code-only
  Scenario: User adds event by entering just the code
    Given an event exists with slug "office-party"
    When I navigate to "/dashboard"
    And I click the "Add by Link" button
    And I type "office-party" in the input field
    And I click "Add Event"
    Then the event should be added to my dashboard

  @dashboard @add-by-link @not-found
  Scenario: User enters non-existent event code
    When I navigate to "/dashboard"
    And I click the "Add by Link" button
    And I type "non-existent-code" in the input field
    And I click "Add Event"
    Then I should see an error toast "Event not found. Please check the link or code."

  @dashboard @add-by-link @duplicate
  Scenario: User tries to add event already in dashboard
    Given I already have "Summer BBQ" in my dashboard
    When I click the "Add by Link" button
    And I enter the link for "Summer BBQ"
    And I click "Add Event"
    Then I should see an info toast "This event is already in your dashboard"

  @dashboard @add-by-link @cancel
  Scenario: User cancels adding event by link
    When I navigate to "/dashboard"
    And I click the "Add by Link" button
    And I type some text in the input
    And I click "Cancel"
    Then the modal should close
    And no event should be added

  # ==========================================
  # Scenario: Bookmarked Events
  # ==========================================
  @dashboard @bookmarked @display
  Scenario: Bookmarked events show "Saved" badge
    Given I have a bookmarked event "Team Lunch"
    When I navigate to "/dashboard"
    Then "Team Lunch" should show a "Saved" badge
    And it should be distinguishable from owned events

  @dashboard @bookmarked @remove
  Scenario: User removes bookmarked event from dashboard
    Given I have a bookmarked event "Old Event"
    When I navigate to "/dashboard"
    And I click the remove button for "Old Event"
    Then I should see a confirmation "Remove this event from your dashboard?"
    When I confirm
    Then I should see a success toast "Event removed from dashboard"
    And "Old Event" should no longer appear
    But the actual event should still exist for other users

  @dashboard @bookmarked @statistics
  Scenario: Statistics distinguish owned vs bookmarked events
    Given I own 3 events
    And I have bookmarked 2 events
    When I navigate to "/dashboard"
    Then "Total Events" should show "5"
    And I should see "(3 owned, 2 saved)" indicator
