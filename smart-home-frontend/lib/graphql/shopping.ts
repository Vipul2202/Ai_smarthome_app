import { gql } from '@apollo/client';

export const GET_SHOPPING_LISTS = gql`
  query GetShoppingLists($householdId: ID) {
    shoppingLists(householdId: $householdId) {
      id
      name
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
      }
      completed
      total
      color
      urgent
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHOPPING_LIST = gql`
  query GetShoppingList($id: ID!) {
    shoppingList(id: $id) {
      id
      name
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
      }
      completed
      total
      color
      urgent
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SHOPPING_LIST = gql`
  mutation CreateShoppingList($input: ShoppingListInput!) {
    createShoppingList(input: $input) {
      id
      name
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
      }
      completed
      total
      color
      urgent
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SHOPPING_LIST = gql`
  mutation UpdateShoppingList($id: ID!, $input: ShoppingListInput!) {
    updateShoppingList(id: $id, input: $input) {
      id
      name
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
      }
      completed
      total
      color
      urgent
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SHOPPING_LIST = gql`
  mutation DeleteShoppingList($id: ID!) {
    deleteShoppingList(id: $id) {
      success
      message
    }
  }
`;

export const ADD_SHOPPING_ITEM = gql`
  mutation AddShoppingItem($listId: ID!, $input: ShoppingItemInput!) {
    addShoppingItem(listId: $listId, input: $input) {
      id
      name
      quantity
      unit
      completed
      price
      category
    }
  }
`;

export const UPDATE_SHOPPING_ITEM = gql`
  mutation UpdateShoppingItem($id: ID!, $input: ShoppingItemInput!) {
    updateShoppingItem(id: $id, input: $input) {
      id
      name
      quantity
      unit
      completed
      price
      category
    }
  }
`;

export const DELETE_SHOPPING_ITEM = gql`
  mutation DeleteShoppingItem($id: ID!) {
    deleteShoppingItem(id: $id) {
      success
      message
    }
  }
`;

export const GET_SHOPPING_SUGGESTIONS = gql`
  query GetShoppingSuggestions($householdId: ID) {
    shoppingSuggestions(householdId: $householdId) {
      name
      category
      unit
      priority
      reason
    }
  }
`;