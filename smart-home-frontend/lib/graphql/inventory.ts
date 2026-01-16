import { gql } from '@apollo/client';

export const GET_INVENTORY_ITEMS = gql`
  query GetInventoryItems($kitchenId: ID) {
    inventoryItems(kitchenId: $kitchenId) {
      id
      name
      category
      quantity
      unit
      expiryDate
      status
      barcode
      image
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVENTORY_ITEM = gql`
  query GetInventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      name
      category
      quantity
      unit
      expiryDate
      status
      barcode
      image
      createdAt
      updatedAt
    }
  }
`;

export const ADD_INVENTORY_ITEM = gql`
  mutation AddInventoryItem($input: InventoryItemInput!) {
    addInventoryItem(input: $input) {
      id
      name
      category
      quantity
      unit
      expiryDate
      status
      barcode
      image
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_INVENTORY_ITEM = gql`
  mutation UpdateInventoryItem($id: ID!, $input: InventoryItemInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
      name
      category
      quantity
      unit
      expiryDate
      status
      barcode
      image
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_INVENTORY_ITEM = gql`
  mutation DeleteInventoryItem($id: ID!) {
    deleteInventoryItem(id: $id) {
      success
      message
    }
  }
`;

export const SEARCH_INVENTORY_ITEMS = gql`
  query SearchInventoryItems($query: String!, $kitchenId: ID) {
    searchInventoryItems(query: $query, kitchenId: $kitchenId) {
      id
      name
      category
      quantity
      unit
      expiryDate
      status
      barcode
      image
      createdAt
      updatedAt
    }
  }
`;