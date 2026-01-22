# Feature: Homepage
# PotluckPartys - Landing Page and Marketing Content

Feature: Homepage
  As a visitor
  I want to see an informative and attractive homepage
  So that I understand what PotluckPartys offers

  Background:
    Given I am on the PotluckPartys website

  # ==========================================
  # Scenario: Hero Section
  # ==========================================
  @homepage @hero
  Scenario: Hero section displays correctly
    When I navigate to the homepage
    Then I should see the hero section
    And I should see the headline "Plan Perfect Potlucks"
    And I should see a subheadline describing the app
    And I should see "Create Your Event" button
    And I should see "Learn More" button

  @homepage @hero @cta
  Scenario: User clicks Create Your Event button
    When I click "Create Your Event" in the hero section
    Then I should be redirected to "/create"

  @homepage @hero @learn-more
  Scenario: User clicks Learn More button
    When I click "Learn More" in the hero section
    Then the page should scroll to the features section

  # ==========================================
  # Scenario: Features Section
  # ==========================================
  @homepage @features
  Scenario: Features section displays all features
    When I view the features section
    Then I should see "No Sign-up Required" feature
    And I should see "Real-time Updates" feature
    And I should see "Easy Sharing" feature
    And I should see "Smart Organization" feature
    And each feature should have an icon and description

  @homepage @features @icons
  Scenario: Feature cards have visual icons
    When I view the features section
    Then each feature card should display a relevant icon
    And the icons should be visually distinct

  # ==========================================
  # Scenario: How It Works Section
  # ==========================================
  @homepage @how-it-works
  Scenario: How It Works section shows steps
    When I view the "How It Works" section
    Then I should see step 1 "Create Your Event"
    And I should see step 2 "Share the Link"
    And I should see step 3 "Guests Add Items"
    And I should see step 4 "Enjoy Your Potluck"
    And each step should have a number indicator

  @homepage @how-it-works @visual
  Scenario: How It Works has visual flow
    When I view the "How It Works" section
    Then the steps should be visually connected
    And there should be progression indicators between steps

  # ==========================================
  # Scenario: Benefits/Image Section
  # ==========================================
  @homepage @benefits @image
  Scenario: Benefits section shows potluck imagery
    When I scroll to the benefits section
    Then I should see an image of people enjoying a potluck
    And the image should load properly
    And there should be accompanying benefit text

  @homepage @benefits @content
  Scenario: Benefits section highlights key advantages
    When I view the benefits section
    Then I should see benefits like:
      | Benefit                    |
      | Coordinate effortlessly    |
      | No duplicate dishes        |
      | Everyone participates      |
      | Track who's bringing what  |

  # ==========================================
  # Scenario: Call to Action (CTA) Section
  # ==========================================
  @homepage @cta @bottom
  Scenario: Bottom CTA encourages action
    When I scroll to the bottom CTA section
    Then I should see "Ready to Host Your Potluck?" heading
    And I should see "Create Your Event" button
    And the button should be prominently styled

  @homepage @cta @click
  Scenario: Bottom CTA button works
    When I click "Create Your Event" in the bottom CTA
    Then I should be redirected to "/create"

  # ==========================================
  # Scenario: Visual Design
  # ==========================================
  @homepage @design @animations
  Scenario: Homepage has smooth animations
    When I load the homepage
    Then elements should animate in smoothly
    And there should be scroll-triggered animations
    And animations should not cause layout shifts

  @homepage @design @backgrounds
  Scenario: Homepage has attractive backgrounds
    When I view the homepage
    Then I should see gradient backgrounds
    And there should be decorative blur elements
    And the design should feel modern and inviting

  @homepage @design @light-mode
  Scenario: Homepage looks good in light mode
    Given the theme is set to light mode
    When I view the homepage
    Then text should be readable
    And colors should be appropriate for light mode
    And images should be visible

  @homepage @design @dark-mode
  Scenario: Homepage looks good in dark mode
    Given the theme is set to dark mode
    When I view the homepage
    Then text should be readable
    And colors should be appropriate for dark mode
    And images should be visible

  # ==========================================
  # Scenario: Responsive Homepage
  # ==========================================
  @homepage @responsive @mobile
  Scenario: Homepage is mobile-friendly
    Given I am on a mobile device
    When I view the homepage
    Then all sections should be readable
    And buttons should be tap-friendly
    And images should scale appropriately
    And there should be no horizontal scrolling

  @homepage @responsive @tablet
  Scenario: Homepage displays well on tablet
    Given I am on a tablet device
    When I view the homepage
    Then the layout should adapt to tablet width
    And content should be well-proportioned
