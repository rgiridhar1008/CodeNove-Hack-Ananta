
"use client";

import { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import type { Grievance } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface IssueMapViewProps {
    issues: Grievance[];
    selectedIssue: Grievance | null;
    onSelectIssue: (issue: Grievance) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// A default center, maybe can be improved with geolocation later
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const libraries: ("places" | "core")[] = ["places", "core"];

export function IssueMapView({ issues, selectedIssue, onSelectIssue }: IssueMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: "AIzaSyBnaGNZ1URJs8n3DOxIdcNCiXSUURz2qK8",
    libraries,
  });

  const center = useMemo(() => {
    if (selectedIssue && selectedIssue.latitude && selectedIssue.longitude) {
        return { lat: selectedIssue.latitude, lng: selectedIssue.longitude };
    }
    if (issues.length > 0 && issues[0].latitude && issues[0].longitude) {
        return { lat: issues[0].latitude, lng: issues[0].longitude };
    }
    return defaultCenter;
  }, [selectedIssue, issues]);


  if (loadError) {
    const isBillingError = loadError.message.includes("BillingNotEnabledMapError");
    const isApiError = loadError.message.includes("ApiProjectMapError");

    return (
        <div className="flex items-center justify-center h-full p-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Google Maps Configuration Error</AlertTitle>
              <AlertDescription>
                {isBillingError ? (
                    <>
                        The map could not be loaded because billing is not enabled for the associated Google Cloud project.
                        <br /><br />
                        <strong>To fix this:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Go to the <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console Billing page</a>.</li>
                            <li>Select your project.</li>
                            <li>Link a billing account or create a new one. The Google Maps Platform has a generous free tier.</li>
                        </ol>
                    </>
                ) : isApiError ? (
                    <>
                        The map could not be loaded. The "Maps JavaScript API" may not be enabled for your project.
                        <br /><br />
                        <strong>To fix this:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Go to the Google Cloud Console.</li>
                            <li>Ensure you have the correct project selected.</li>
                            <li>Search for and enable the <strong>"Maps JavaScript API"</strong>.</li>
                        </ol>
                    </>
                ) : (
                    "An unknown error occurred while loading the map. Please check the browser console for more details."
                )}
              </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={selectedIssue ? 15 : 5}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {issues.map(issue => (
        <Marker
          key={issue.id}
          position={{ lat: issue.latitude, lng: issue.longitude }}
          onClick={() => onSelectIssue(issue)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: issue.id === selectedIssue?.id ? 10 : 7,
            fillColor: issue.id === selectedIssue?.id ? "hsl(var(--primary))" : "#6f81a8",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }}
        />
      ))}
    </GoogleMap>
  );
}
