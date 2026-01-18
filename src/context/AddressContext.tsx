import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CustomerAddress, METLACHITTAPUR_COORDS } from '@/types';

interface AddressContextType {
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  getSelectedAddress: () => CustomerAddress | undefined;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => CustomerAddress;
  updateAddress: (id: string, updates: Partial<CustomerAddress>) => void;
  deleteAddress: (id: string) => void;
  setSelectedAddress: (id: string) => void;
  getDefaultAddress: () => CustomerAddress | undefined;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

// Default address for demo
const defaultAddresses: CustomerAddress[] = [
  {
    id: 'addr_1',
    userId: 'user_demo',
    label_te: 'ఇల్లు',
    label_en: 'Home',
    village_te: 'మెట్లచిట్టాపూర్',
    village_en: 'Metlachittapur',
    landmark_te: 'రామాలయం దగ్గర',
    landmark_en: 'Near Rama Temple',
    houseDetails_te: 'హౌస్ నం 45',
    houseDetails_en: 'House No 45',
    lat: METLACHITTAPUR_COORDS.lat,
    lng: METLACHITTAPUR_COORDS.lng,
    isDefault: true,
  },
];

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>('addr_1');

  const getSelectedAddress = useCallback(() => {
    return addresses.find(a => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const getDefaultAddress = useCallback(() => {
    return addresses.find(a => a.isDefault) || addresses[0];
  }, [addresses]);

  const addAddress = useCallback((address: Omit<CustomerAddress, 'id'>): CustomerAddress => {
    const newAddress: CustomerAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };

    // If this is default, unset others
    if (newAddress.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })));
    }

    setAddresses(prev => [...prev, newAddress]);
    return newAddress;
  }, []);

  const updateAddress = useCallback((id: string, updates: Partial<CustomerAddress>) => {
    setAddresses(prev =>
      prev.map(a => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        // If setting this as default, unset others
        if (updates.isDefault && a.id !== id) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }
  }, [selectedAddressId]);

  const setSelectedAddress = useCallback((id: string) => {
    setSelectedAddressId(id);
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        getSelectedAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setSelectedAddress,
        getDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}
