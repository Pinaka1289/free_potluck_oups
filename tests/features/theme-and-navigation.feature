# Feature: Theme and Navigation
# PotluckPartys - Light/Dark Mode and Site Navigation

Feature: Theme and Navigation
  As a user
  I want to navigate the site easily and customize the theme
  So that I have a pleasant browsing experience

  Background:
    Given I am on the PotluckPartys website

  # ==========================================
  # Scenario: Light/Dark Theme Toggle
  # ==========================================
  @theme @toggle @light-to-dark
  Scenario: User switches from light to dark mode
    Given the theme is set to light mode
    When I click the theme toggle button
    Then the theme should switch to dark mode
    And the background should be dark
    And the text should be light colored
    And the toggle icon should show "sun" icon

  @theme @toggle @dark-to-light
  Scenario: User switches from dark to light mode
    Given the theme is set to dark mode
    When I click the theme toggle button
    Then the theme should switch to light mode
    And the background should be light
    And the text should be dark colored
    And the toggle icon should show "moon" icon

  @theme @persistence
  Scenario: Theme preference is remembered
    Given I set the theme to dark mode
    When I close and reopen the browser
    And I navigate to the website
    Then the theme should still be dark mode

  @theme @system-preference
  Scenario: Theme defaults to system preference
    Given I have never visited the site before
    And my system is set to dark mode
    When I navigate to the homepage
    Then the theme should default to dark mode

  # ==========================================
  # Scenario: Header Navigation
  # ==========================================
  @navigation @header @links
  Scenario: Header shows navigation links
    When I view the page header
    Then I should see the "PotluckPartys" logo
    And I should see "Home" link
    And I should see "Create Event" link
    And I should see the theme toggle button

  @navigation @header @logo
  Scenario: Logo links to homepage
    Given I am on any page
    When I click the "PotluckPartys" logo
    Then I should be redirected to the homepage

  @navigation @header @active-link
  Scenario: Current page is highlighted in navigation
    When I am on the "Create Event" page
    Then the "Create Event" link should be highlighted
    And the "Home" link should not be highlighted

  @navigation @header @scroll
  Scenario: Header becomes opaque on scroll
    When I am at the top of the page
    Then the header should be transparent
    When I scroll down the page
    Then the header should become opaque with blur effect

  # ==========================================
  # Scenario: User Menu (Logged In)
  # ==========================================
  @navigation @user-menu @display
  Scenario: Logged-in user sees profile menu
    Given I am logged in as "user@example.com"
    When I view the header
    Then I should see my email "user@example.com"
    And I should see a profile icon

  @navigation @user-menu @dropdown
  Scenario: User opens profile dropdown
    Given I am logged in
    When I click on my profile in the header
    Then I should see a dropdown menu
    And the dropdown should contain "Dashboard" link
    And the dropdown should contain "Sign Out" button

  @navigation @user-menu @close
  Scenario: User closes profile dropdown
    Given the profile dropdown is open
    When I click outside the dropdown
    Then the dropdown should close

  # ==========================================
  # Scenario: Sign In Button (Logged Out)
  # ==========================================
  @navigation @signin-button
  Scenario: Logged-out user sees Sign In button
    Given I am not logged in
    When I view the header
    Then I should see "Sign In" button
    When I click "Sign In"
    Then I should be redirected to the auth page

  # ==========================================
  # Scenario: Mobile Navigation
  # ==========================================
  @navigation @mobile @hamburger
  Scenario: Mobile menu toggle
    Given I am on a mobile device (screen width < 768px)
    When I view the header
    Then I should see the hamburger menu icon
    And I should NOT see the desktop navigation links

  @navigation @mobile @open-menu
  Scenario: User opens mobile menu
    Given I am on a mobile device
    When I click the hamburger menu icon
    Then the mobile menu should slide open
    And I should see "Home" link
    And I should see "Create Event" link
    And I should see "Sign In" link (if logged out)

  @navigation @mobile @close-menu
  Scenario: User closes mobile menu
    Given the mobile menu is open
    When I click the close (X) icon
    Then the mobile menu should close

  @navigation @mobile @navigate
  Scenario: User navigates via mobile menu
    Given the mobile menu is open
    When I click "Create Event"
    Then I should be redirected to the Create Event page
    And the mobile menu should close

  # ==========================================
  # Scenario: Footer
  # ==========================================
  @navigation @footer
  Scenario: Footer displays correct information
    When I scroll to the footer
    Then I should see the "PotluckPartys" branding
    And I should see copyright information
    And I should see the current year

  # ==========================================
  # Scenario: Responsive Design
  # ==========================================
  @responsive @desktop
  Scenario: Desktop layout displays correctly
    Given my screen width is 1280px or more
    When I view any page
    Then content should be centered with max-width
    And navigation should be horizontal
    And event cards should display in multi-column grid

  @responsive @tablet
  Scenario: Tablet layout displays correctly
    Given my screen width is between 768px and 1024px
    When I view any page
    Then content should adjust to tablet width
    And navigation may be horizontal or hamburger
    And event cards should display in 2-column grid

  @responsive @mobile
  Scenario: Mobile layout displays correctly
    Given my screen width is less than 768px
    When I view any page
    Then content should be full-width with padding
    And navigation should use hamburger menu
    And event cards should stack vertically
