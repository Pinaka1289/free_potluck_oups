# Feature: Item Management
# PotluckPartys - Add, Edit, Claim, and Delete Potluck Items

Feature: Item Management
  As a user with access to an event
  I want to manage potluck items
  So that guests can coordinate what to bring

  Background:
    Given I am on the PotluckPartys website
    And an event exists with slug "family-dinner"
    And I navigate to "/event/family-dinner"

  # ==========================================
  # Scenario: Adding Items
  # ==========================================
  @item-add @happy-path
  Scenario: User adds a new item to the potluck
    When I click the "Add Item" button
    Then I should see the "Add New Item" modal
    When I fill in the item name "Homemade Lasagna"
    And I select the category "Main Dish"
    And I set the quantity to "2"
    And I add notes "Family recipe, serves 8"
    And I click the "Add Item" button in the modal
    Then I should see a success toast "Item added successfully!"
    And I should see "Homemade Lasagna" in the items list
    And the item should show category "Main Dish"
    And the item should show quantity "2"

  @item-add @with-claim
  Scenario: User adds an item and claims it immediately
    When I click the "Add Item" button
    And I fill in the item name "Garden Salad"
    And I select the category "Side Dish"
    And I check "I'm bringing this"
    And I fill in my name "Alice Johnson"
    And I click the "Add Item" button in the modal
    Then I should see "Garden Salad" in the items list
    And the item should show "Claimed by Alice Johnson"

  @item-add @minimal
  Scenario: User adds item with only name
    When I click the "Add Item" button
    And I fill in the item name "Surprise Dish"
    And I click the "Add Item" button in the modal
    Then I should see "Surprise Dish" in the items list
    And the item category should be "Other"

  @item-add @validation
  Scenario: User cannot add item without name
    When I click the "Add Item" button
    And I leave the item name empty
    And I click the "Add Item" button in the modal
    Then I should see an error toast "Item name is required"
    And the modal should remain open

  # ==========================================
  # Scenario: Claiming Items
  # ==========================================
  @item-claim @happy-path
  Scenario: User claims an unclaimed item
    Given an unclaimed item "Chips and Dip" exists in the event
    When I click on the "Chips and Dip" item
    And I click "Click to Claim"
    Then I should see the "Claim Item" modal
    When I enter my name "Bob Smith"
    And I click the "Claim" button
    Then I should see a success toast "Item claimed successfully!"
    And the item should show "Claimed by Bob Smith"
    And the "Available" count should decrease by 1
    And the "Claimed" count should increase by 1

  @item-claim @with-name-remembered
  Scenario: User claims multiple items with name remembered
    Given I have previously claimed an item as "Carol Davis"
    And an unclaimed item "Beverages" exists in the event
    When I click "Click to Claim" on "Beverages"
    Then my name "Carol Davis" should be pre-filled
    When I click the "Claim" button
    Then the item should show "Claimed by Carol Davis"

  @item-unclaim @happy-path
  Scenario: User unclaims an item they claimed
    Given I claimed the item "Paper Plates" as "David Lee"
    When I click on the "Paper Plates" item
    And I click the "Unclaim" button
    Then I should see a success toast "Item unclaimed"
    And the item should show as "Available"
    And the "Available" count should increase by 1

  # ==========================================
  # Scenario: Editing Items
  # ==========================================
  @item-edit @happy-path
  Scenario: User edits an existing item
    Given an item "Potato Salad" exists in the event
    When I click the edit button on "Potato Salad"
    Then I should see the "Edit Item" modal
    When I update the item name to "Mom's Potato Salad"
    And I update the quantity to "3"
    And I click the "Save" button
    Then I should see a success toast "Item updated successfully!"
    And I should see "Mom's Potato Salad" in the items list
    And the item should show quantity "3"

  @item-edit @change-category
  Scenario: User changes item category
    Given an item "Mystery Dish" with category "Other" exists
    When I click the edit button on "Mystery Dish"
    And I change the category to "Dessert"
    And I click the "Save" button
    Then the item should show category "Dessert"

  # ==========================================
  # Scenario: Deleting Items
  # ==========================================
  @item-delete @happy-path
  Scenario: User deletes an item
    Given an item "Old Item" exists in the event
    When I click the delete button on "Old Item"
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then I should see a success toast "Item deleted"
    And "Old Item" should no longer appear in the items list
    And the total item count should decrease by 1

  @item-delete @cancel
  Scenario: User cancels item deletion
    Given an item "Keep This" exists in the event
    When I click the delete button on "Keep This"
    And I cancel the deletion
    Then "Keep This" should still appear in the items list

  # ==========================================
  # Scenario: View Modes
  # ==========================================
  @item-view @table-view
  Scenario: User views items in table format (default)
    Given the event has multiple items
    When I navigate to the event page
    Then items should be displayed in table format by default
    And I should see columns for "Item", "Category", "Quantity", "Claimed By", and "Actions"

  @item-view @card-view
  Scenario: User switches to card view
    Given items are displayed in table format
    When I click the "Cards" view button
    Then items should be displayed as cards
    And each card should show item details and actions

  @item-view @toggle-views
  Scenario: User toggles between table and card views
    When I click the "Cards" view button
    Then items should be in card format
    When I click the "Table" view button
    Then items should be in table format

  # ==========================================
  # Scenario: Real-time Updates
  # ==========================================
  @item-realtime @add
  Scenario: Items update in real-time when another user adds
    Given I am viewing the event page
    When another user adds item "Fresh Bread" to the event
    Then I should see "Fresh Bread" appear in the items list without refreshing
    And the total item count should update automatically

  @item-realtime @claim
  Scenario: Claimed status updates in real-time
    Given I am viewing the event page
    And an unclaimed item "Fruit Platter" exists
    When another user claims "Fruit Platter"
    Then I should see the item status change to "Claimed" without refreshing
    And the statistics should update automatically

  @item-realtime @delete
  Scenario: Deleted items disappear in real-time
    Given I am viewing the event page
    And an item "To Be Removed" exists
    When another user deletes "To Be Removed"
    Then the item should disappear from my view without refreshing
