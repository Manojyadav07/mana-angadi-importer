import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CustomerAddress, METLACHITTAPUR_COORDS } from '@/types';
import { MapPin, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AddressFormProps {
  address?: CustomerAddress;
  onSave: (address: Omit<CustomerAddress, 'id'>) => void;
  onCancel: () => void;
  userId: string;
}

export function AddressForm({ address, onSave, onCancel, userId }: AddressFormProps) {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    label_te: address?.label_te || '',
    label_en: address?.label_en || '',
    landmark_te: address?.landmark_te || '',
    landmark_en: address?.landmark_en || '',
    houseDetails_te: address?.houseDetails_te || '',
    houseDetails_en: address?.houseDetails_en || '',
    area_te: address?.area_te || '',
    area_en: address?.area_en || '',
    deliveryInstructions_te: address?.deliveryInstructions_te || '',
    deliveryInstructions_en: address?.deliveryInstructions_en || '',
    receiverName: address?.receiverName || '',
    phone: address?.phone || '',
    lat: address?.lat,
    lng: address?.lng,
    isDefault: address?.isDefault || false,
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'en' ? 'Geolocation not supported' : 'లొకేషన్ సపోర్ట్ లేదు');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setIsLocating(false);
        toast.success(language === 'en' ? 'Location captured' : 'లొకేషన్ సేవ్ అయింది');
      },
      (error) => {
        console.error('Location error:', error);
        setIsLocating(false);
        toast.error(language === 'en' ? 'Could not get location' : 'లొకేషన్ పొందలేకపోయాము');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.label_te || !formData.label_en) {
      toast.error(language === 'en' ? 'Label is required in both languages' : 'లేబుల్ రెండు భాషల్లో అవసరం');
      return;
    }
    if (!formData.landmark_te || !formData.landmark_en) {
      toast.error(language === 'en' ? 'Landmark is required in both languages' : 'లాండ్‌మార్క్ రెండు భాషల్లో అవసరం');
      return;
    }

    onSave({
      userId,
      label_te: formData.label_te.trim(),
      label_en: formData.label_en.trim(),
      landmark_te: formData.landmark_te.trim(),
      landmark_en: formData.landmark_en.trim(),
      houseDetails_te: formData.houseDetails_te.trim() || undefined,
      houseDetails_en: formData.houseDetails_en.trim() || undefined,
      area_te: formData.area_te.trim() || undefined,
      area_en: formData.area_en.trim() || undefined,
      deliveryInstructions_te: formData.deliveryInstructions_te.trim() || undefined,
      deliveryInstructions_en: formData.deliveryInstructions_en.trim() || undefined,
      receiverName: formData.receiverName.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      village_te: 'మెట్లచిట్టాపూర్',
      village_en: 'Metlachittapur',
      lat: formData.lat ?? METLACHITTAPUR_COORDS.lat,
      lng: formData.lng ?? METLACHITTAPUR_COORDS.lng,
      isDefault: formData.isDefault,
    });
  };

  const labels = {
    title: language === 'en' ? (address ? 'Edit Address' : 'Add Address') : (address ? 'చిరునామా సవరించండి' : 'చిరునామా జోడించండి'),
    labelField: language === 'en' ? 'Label (e.g., Home, Office)' : 'లేబుల్ (ఉదా: ఇల్లు, ఆఫీస్)',
    labelTe: 'తెలుగు లేబుల్',
    labelEn: 'English Label',
    landmarkField: language === 'en' ? 'Landmark (required)' : 'లాండ్‌మార్క్ (అవసరం)',
    landmarkTe: 'తెలుగు లాండ్‌మార్క్',
    landmarkEn: 'English Landmark',
    houseField: language === 'en' ? 'House/Building Details' : 'ఇంటి వివరాలు',
    houseTe: 'తెలుగులో',
    houseEn: 'In English',
    areaField: language === 'en' ? 'Street/Area' : 'వీధి/ఏరియా',
    instructionsField: language === 'en' ? 'Delivery Instructions' : 'డెలివరీ సూచనలు',
    instructionsTe: 'తెలుగులో',
    instructionsEn: 'In English',
    receiverField: language === 'en' ? 'Receiver Name (optional)' : 'రిసీవర్ పేరు (ఐచ్ఛికం)',
    phoneField: language === 'en' ? 'Phone (optional)' : 'ఫోన్ (ఐచ్ఛికం)',
    useLocation: language === 'en' ? 'Use Current Location' : 'ప్రస్తుత లొకేషన్ వాడండి',
    locating: language === 'en' ? 'Getting location...' : 'లొకేషన్ పొందుతోంది...',
    locationCaptured: language === 'en' ? 'Location captured' : 'లొకేషన్ సేవ్ అయింది',
    setDefault: language === 'en' ? 'Set as default address' : 'డిఫాల్ట్ చిరునామాగా సెట్ చేయండి',
    save: language === 'en' ? 'Save Address' : 'చిరునామా సేవ్ చేయండి',
    cancel: t.cancel,
    placeholderLandmarkTe: 'ఉదా: రామాలయం దగ్గర',
    placeholderLandmarkEn: 'e.g., Near Rama Temple',
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-lg text-foreground">{labels.title}</h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Label */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{labels.labelField} *</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={labels.labelTe}
              value={formData.label_te}
              onChange={(e) => handleChange('label_te', e.target.value)}
            />
            <Input
              placeholder={labels.labelEn}
              value={formData.label_en}
              onChange={(e) => handleChange('label_en', e.target.value)}
            />
          </div>
        </div>

        {/* Landmark */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{labels.landmarkField} *</label>
          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder={labels.placeholderLandmarkTe}
              value={formData.landmark_te}
              onChange={(e) => handleChange('landmark_te', e.target.value)}
            />
            <Input
              placeholder={labels.placeholderLandmarkEn}
              value={formData.landmark_en}
              onChange={(e) => handleChange('landmark_en', e.target.value)}
            />
          </div>
        </div>

        {/* House Details */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{labels.houseField}</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={labels.houseTe}
              value={formData.houseDetails_te}
              onChange={(e) => handleChange('houseDetails_te', e.target.value)}
            />
            <Input
              placeholder={labels.houseEn}
              value={formData.houseDetails_en}
              onChange={(e) => handleChange('houseDetails_en', e.target.value)}
            />
          </div>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{labels.areaField}</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={labels.houseTe}
              value={formData.area_te}
              onChange={(e) => handleChange('area_te', e.target.value)}
            />
            <Input
              placeholder={labels.houseEn}
              value={formData.area_en}
              onChange={(e) => handleChange('area_en', e.target.value)}
            />
          </div>
        </div>

        {/* Delivery Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{labels.instructionsField}</label>
          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder={labels.instructionsTe}
              value={formData.deliveryInstructions_te}
              onChange={(e) => handleChange('deliveryInstructions_te', e.target.value)}
            />
            <Input
              placeholder={labels.instructionsEn}
              value={formData.deliveryInstructions_en}
              onChange={(e) => handleChange('deliveryInstructions_en', e.target.value)}
            />
          </div>
        </div>

        {/* Receiver Name & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{labels.receiverField}</label>
            <Input
              placeholder={labels.receiverField}
              value={formData.receiverName}
              onChange={(e) => handleChange('receiverName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{labels.phoneField}</label>
            <Input
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
            <span className="text-sm">
              {isLocating ? labels.locating : labels.useLocation}
            </span>
          </button>
          {formData.lat && formData.lng && (
            <p className="text-xs text-primary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {labels.locationCaptured}
            </p>
          )}
        </div>

        {/* Default Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
          <span className="text-sm text-foreground">{labels.setDefault}</span>
          <Switch
            checked={formData.isDefault}
            onCheckedChange={(checked) => handleChange('isDefault', checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
        >
          {labels.cancel}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          {labels.save}
        </button>
      </div>
    </div>
  );
}
