import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOOKUP_BARCODE, GET_BARCODE_HISTORY } from '@/lib/graphql/barcode';

interface ProductInfo {
  name: string;
  category: string;
  brand?: string;
  description?: string;
  image?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useBarcode = () => {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);

  const [lookupBarcodeMutation, { loading }] = useMutation(LOOKUP_BARCODE);

  const { data: historyData, refetch: refetchHistory } = useQuery(GET_BARCODE_HISTORY, {
    errorPolicy: 'all',
  });

  const lookupBarcode = async (barcode: string): Promise<ProductInfo | null> => {
    try {
      const { data } = await lookupBarcodeMutation({
        variables: { barcode }
      });

      if (data?.lookupBarcode) {
        // Add to scanned codes history
        setScannedCodes(prev => [barcode, ...prev.filter(code => code !== barcode)].slice(0, 10));
        
        return {
          name: data.lookupBarcode.name,
          category: data.lookupBarcode.category,
          brand: data.lookupBarcode.brand,
          description: data.lookupBarcode.description,
          image: data.lookupBarcode.image,
          nutrition: data.lookupBarcode.nutrition,
        };
      }

      return null;
    } catch (error) {
      console.error('Barcode lookup error:', error);
      throw new Error('Failed to lookup barcode');
    }
  };

  const getRecentScans = () => {
    return historyData?.barcodeHistory || [];
  };

  const clearHistory = () => {
    setScannedCodes([]);
  };

  return {
    lookupBarcode,
    loading,
    scannedCodes,
    getRecentScans,
    clearHistory,
    refetchHistory,
  };
};