# Feature: End-to-End User Journeys
# PotluckPartys - Complete User Flow Scenarios

Feature: End-to-End User Journeys
  As a user
  I want to complete full workflows
  So that I can successfully plan and manage potluck events

  # ==========================================
  # Journey: Guest Creates and Shares Event
  # ==========================================
  @e2e @guest-journey
  Scenario: Complete guest journey - Create, Share, Manage Event
    # Step 1: Guest creates event
    Given I am a first-time visitor to PotluckPartys
    And I am not logged in
    When I navigate to the homepage
    And I click "Create Your Event"
    Then I should be on the create event page

    # Step 2: Fill event details
    When I fill in event title "Neighborhood BBQ"
    And I fill in description "Summer cookout for the block"
    And I select date "2026-07-04"
    And I select time "16:00"
    And I fill in location "456 Oak Street Backyard"
    And I fill in host name "Mike Wilson"
    And I click "Create Event"
    Then I should be redirected to the event page
    And I should see "Neighborhood BBQ" as the title
    And I should see the shareable link

    # Step 3: Copy link to share
    When I click "Copy Link"
    Then the link should be copied to clipboard
    And I should see "Link copied!" toast

    # Step 4: Add initial items
    When I click "Add Item"
    And I fill in item name "Hamburgers"
    And I select category "Main Dish"
    And I check "I'm bringing this"
    And I enter my name "Mike Wilson"
    And I click "Add Item"
    Then I should see "Hamburgers" claimed by "Mike Wilson"

    # Step 5: Add more items for guests
    When I add the following items:
      | Item Name     | Category   |
      | Hot Dogs      | Main Dish  |
      | Coleslaw      | Side Dish  |
      | Lemonade      | Beverage   |
      | Brownies      | Dessert    |
    Then I should see 5 total items
    And 4 items should be available

  # ==========================================
  # Journey: Guest Joins Event via Link
  # ==========================================
  @e2e @guest-joins
  Scenario: Guest receives link and claims items
    Given an event "Birthday Bash" exists with unclaimed items
    And I received the event link via text message

    # Step 1: Open link and view event
    When I open the event link
    Then I should see the welcome modal
    When I click "Continue without signing in"
    Then I should see the event details
    And I should see the list of items

    # Step 2: Claim an item
    When I see "Chips and Salsa" is available
    And I click "Click to Claim"
    And I enter my name "Sarah Johnson"
    And I click "Claim"
    Then "Chips and Salsa" should show "Claimed by Sarah Johnson"

    # Step 3: Add a new item
    When I click "Add Item"
    And I fill in "Guacamole" and category "Appetizer"
    And I check "I'm bringing this"
    And my name "Sarah Johnson" is pre-filled
    And I click "Add Item"
    Then I should see "Guacamole" claimed by "Sarah Johnson"

  # ==========================================
  # Journey: User Signs Up and Manages Events
  # ==========================================
  @e2e @user-journey
  Scenario: Complete registered user journey
    # Step 1: Sign up
    Given I am on the homepage
    When I click "Sign In"
    And I click "Sign Up" tab
    And I fill in my details:
      | Full Name | Email              | Password       |
      | John Doe  | john@example.com   | SecurePass123! |
    And I click "Create Account"
    Then I should see success message about verification

    # Step 2: Verify and sign in (simulated)
    Given my email is verified
    When I sign in with "john@example.com" and "SecurePass123!"
    Then I should be redirected to dashboard
    And I should see "Welcome, John!"

    # Step 3: Create first event
    When I click "Create New Event"
    And I create event "Game Night Potluck"
    Then the event should appear in my dashboard
    And I should see the QR code for the event

    # Step 4: Share event
    When I click "Copy" on the event
    And I share the link with friends
    Then friends should be able to access the event

    # Step 5: View event from dashboard
    When I click "View" on "Game Night Potluck"
    Then I should see my event page
    And I should be able to edit event details

    # Step 6: Add event by link
    When I go back to dashboard
    And I click "Add by Link"
    And I paste a friend's event link
    Then the friend's event should appear in my dashboard
    And it should have the "Saved" badge

  # ==========================================
  # Journey: Multi-User Collaboration
  # ==========================================
  @e2e @collaboration
  Scenario: Multiple users collaborate on same event
    Given User A creates event "Office Lunch"
    And User A shares the link with User B and User C

    # User B joins and claims
    When User B opens the link
    And User B claims "Sandwiches"
    Then User A should see the update in real-time

    # User C joins and adds item
    When User C opens the link
    And User C adds "Fresh Fruit" and claims it
    Then User A and User B should see "Fresh Fruit" appear

    # Verify final state
    Then the event should show:
      | Item        | Claimed By |
      | Sandwiches  | User B     |
      | Fresh Fruit | User C     |
    And participant count should be 2

  # ==========================================
  # Journey: QR Code Sharing Flow
  # ==========================================
  @e2e @qr-sharing
  Scenario: Event shared via QR code at physical location
    Given I created event "Potluck Picnic"
    And I downloaded the QR code

    # Print and display QR
    When I print the QR code
    And I display it at the picnic location

    # Guest scans QR
    When Guest scans the QR code with their phone
    Then they should be directed to the event page
    And they should see the welcome modal
    And they can add or claim items

  # ==========================================
  # Journey: Event with Full Item Lifecycle
  # ==========================================
  @e2e @item-lifecycle
  Scenario: Item goes through complete lifecycle
    Given I am viewing event "Family Reunion"

    # Create item
    When I add item "Grandma's Apple Pie"
    Then it should appear as available

    # Claim item
    When another user claims "Grandma's Apple Pie"
    Then it should show as claimed
    And available count should decrease

    # Unclaim item
    When the user unclaims the item
    Then it should become available again

    # Edit item
    When I edit "Grandma's Apple Pie" to "Grandma's Famous Apple Pie"
    And I add notes "Needs to be refrigerated"
    Then the updated name and notes should display

    # Another user claims
    When a different user claims the item
    Then it should show the new claimer's name

    # Delete item
    When I delete "Grandma's Famous Apple Pie"
    Then it should be removed from the list
    And total items should decrease

  # ==========================================
  # Journey: Password Recovery
  # ==========================================
  @e2e @password-recovery
  Scenario: User recovers forgotten password
    Given I have an account with "forgetful@example.com"
    And I forgot my password

    # Request reset
    When I go to sign in page
    And I click "Forgot password?"
    And I enter "forgetful@example.com"
    And I click "Send Reset Link"
    Then I should see confirmation message

    # Check email and click link
    When I receive the reset email
    And I click the reset link
    Then I should be on the reset password page

    # Set new password
    When I enter new password "NewSecure456!"
    And I confirm the password
    And I click "Set New Password"
    Then I should see success message
    And I should be redirected to dashboard

    # Verify new password works
    When I sign out
    And I sign in with "forgetful@example.com" and "NewSecure456!"
    Then I should be successfully logged in
