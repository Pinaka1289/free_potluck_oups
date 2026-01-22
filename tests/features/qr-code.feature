# Feature: QR Code Functionality
# PotluckPartys - Generate and Share QR Codes for Events

Feature: QR Code Generation and Sharing
  As a user
  I want to generate and share QR codes for my events
  So that guests can easily access the event via mobile devices

  Background:
    Given I am on the PotluckPartys website
    And an event exists with slug "dinner-party" and title "Dinner Party"

  # ==========================================
  # Scenario: QR Code Display on Event Page
  # ==========================================
  @qr-code @event-page @auto-display
  Scenario: QR code is automatically displayed on event page
    When I navigate to "/event/dinner-party"
    Then I should see the QR code displayed in the share section
    And the QR code should be scannable
    And I should see "Scan to share!" text below the QR code

  @qr-code @event-page @scannable
  Scenario: QR code links to correct event URL
    When I navigate to "/event/dinner-party"
    And I scan the displayed QR code
    Then the QR code should decode to the event URL
    And the URL should contain "/event/dinner-party"

  # ==========================================
  # Scenario: QR Code Modal
  # ==========================================
  @qr-code @modal @open
  Scenario: User opens QR code modal for larger view
    When I navigate to "/event/dinner-party"
    And I click the "Download QR Code" button
    Then I should see the QR code modal
    And the modal should display a larger QR code
    And I should see the event title "Dinner Party"

  @qr-code @modal @close
  Scenario: User closes QR code modal
    Given the QR code modal is open
    When I click the close button
    Then the modal should close
    And I should see the event page

  # ==========================================
  # Scenario: QR Code Download
  # ==========================================
  @qr-code @download @png
  Scenario: User downloads QR code as PNG
    When I navigate to "/event/dinner-party"
    And I click "Download QR Code"
    And I click the "Download PNG" button in the modal
    Then a PNG image should be downloaded
    And the filename should contain "dinner-party-qrcode"
    And I should see a success toast "QR Code downloaded!"

  @qr-code @download @quality
  Scenario: Downloaded QR code is high quality
    When I download the QR code for "dinner-party"
    Then the image should be at least 256x256 pixels
    And the QR code should be scannable from the downloaded image

  # ==========================================
  # Scenario: QR Code on Dashboard
  # ==========================================
  @qr-code @dashboard @display
  Scenario: QR codes appear on dashboard event cards
    Given I am logged in with events
    When I navigate to "/dashboard"
    Then each event card should display a small QR code
    And the QR codes should be clickable

  @qr-code @dashboard @click
  Scenario: User clicks QR code on dashboard to enlarge
    Given I am on the dashboard
    When I click on the QR code for "Dinner Party"
    Then I should see the QR code modal
    And the modal should show "Dinner Party" event details
    And I should see "Download" and "Copy Link" buttons

  @qr-code @dashboard @mobile
  Scenario: Mobile users can access QR code via button
    Given I am on a mobile device
    And I am on the dashboard
    When I click the "QR" button for "Dinner Party"
    Then I should see the QR code modal

  # ==========================================
  # Scenario: QR Code Scanning
  # ==========================================
  @qr-code @scan @valid
  Scenario: Scanning QR code opens event page
    Given someone has the QR code for "dinner-party"
    When they scan the QR code with their phone
    Then their browser should open
    And they should be directed to "/event/dinner-party"
    And they should see the event details

  @qr-code @scan @new-visitor
  Scenario: First-time visitor via QR code sees welcome modal
    Given I scan a QR code for "dinner-party"
    And I have never visited this event before
    When the event page loads
    Then I should see the welcome modal
    And I can choose to sign in or continue as guest

  # ==========================================
  # Scenario: QR Code Sharing
  # ==========================================
  @qr-code @share @print
  Scenario: QR code is suitable for printing
    When I download the QR code
    Then the image should have a white background
    And there should be adequate padding around the QR code
    And the image should be print-ready

  @qr-code @share @embed
  Scenario: QR code can be used in invitations
    When I download the QR code for my event
    Then I can embed it in digital invitations
    And I can print it for physical invitations
    And guests scanning it will reach the event page
