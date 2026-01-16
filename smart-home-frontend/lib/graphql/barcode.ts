import { gql } from '@apollo/client';

export const LOOKUP_BARCODE = gql`
  mutation LookupBarcode($barcode: String!) {
    lookupBarcode(barcode: $barcode) {
      name
      category
      brand
      description
      image
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
    }
  }
`;

export const GET_BARCODE_HISTORY = gql`
  query GetBarcodeHistory {
    barcodeHistory {
      id
      barcode
      productName
      scannedAt
      createdAt
    }
  }
`;

export const SAVE_BARCODE_SCAN = gql`
  mutation SaveBarcodeScan($barcode: String!, $productName: String!) {
    saveBarcodeScan(barcode: $barcode, productName: $productName) {
      id
      barcode
      productName
      scannedAt
    }
  }
`;