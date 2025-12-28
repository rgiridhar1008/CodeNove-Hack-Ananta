
"use client";

import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlacesAutocompleteProps {
    onSelectLocation: (lat: number, lng: number) => void;
}

export function PlacesAutocomplete({ onSelectLocation }: PlacesAutocompleteProps) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { /* Define search scope here */ },
    debounce: 300,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = ({ description }: { description: string }) => () => {
    setValue(description, false);
    clearSuggestions();

    getGeocode({ address: description }).then((results) => {
      const { lat, lng } = getLatLng(results[0]);
      onSelectLocation(lat, lng);
    });
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} onClick={handleSelect(suggestion)} className="p-2 hover:bg-muted cursor-pointer">
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div className="relative">
      <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Search for a location or address"
            className="pl-10"
          />
      </div>

      {status === 'OK' && <ul className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg">{renderSuggestions()}</ul>}
    </div>
  );
}
