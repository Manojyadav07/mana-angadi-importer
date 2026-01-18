import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAddress } from '@/context/AddressContext';
import { useApp } from '@/context/AppContext';
import { CustomerAddress } from '@/types';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { Plus, X, Lock } from 'lucide-react';

interface AddressPickerProps {
  onClose: () => void;
  onSelect: (address: CustomerAddress) => void;
}

export function AddressPicker({ onClose, onSelect }: AddressPickerProps) {
  const { language } = useLanguage();
  const { user } = useApp();
  const { addresses, selectedAddressId, addAddress, updateAddress, setSelectedAddress } = useAddress();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | undefined>();

  const labels = {
    title: language === 'en' ? 'Delivery Address' : 'డెలివరీ చిరునామా',
    addNew: language === 'en' ? 'Add New Address' : 'కొత్త చిరునామా జోడించండి',
    privacyNote: language === 'en' ? 'Your address is private' : 'మీ చిరునామా గోప్యంగా ఉంటుంది',
    noAddresses: language === 'en' ? 'No saved addresses' : 'సేవ్ చేసిన చిరునామాలు లేవు',
  };

  const handleAddressSelect = (address: CustomerAddress) => {
    setSelectedAddress(address.id);
    onSelect(address);
    onClose();
  };

  const handleSaveAddress = (addressData: Omit<CustomerAddress, 'id'>) => {
    if (editingAddress) {
      updateAddress(editingAddress.id, addressData);
      setEditingAddress(undefined);
    } else {
      const newAddress = addAddress(addressData);
      setSelectedAddress(newAddress.id);
      onSelect(newAddress);
      onClose();
    }
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md max-h-[90vh]">
          <AddressForm
            address={editingAddress}
            userId={user?.id || 'guest'}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">{labels.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="px-4 py-2 bg-primary/5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{labels.privacyNote}</span>
        </div>

        {/* Address List */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {addresses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{labels.noAddresses}</p>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={address.id === selectedAddressId}
                onSelect={() => handleAddressSelect(address)}
                onEdit={() => {
                  setEditingAddress(address);
                  setShowForm(true);
                }}
              />
            ))
          )}
        </div>

        {/* Add New Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              setEditingAddress(undefined);
              setShowForm(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">{labels.addNew}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
