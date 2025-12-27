
"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { z } from "zod";
import { useUser, useFirestore, useFirebaseApp } from "@/firebase";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { IssueCategory, GrievancePriority } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { LocateIcon, Search, AlertTriangle } from "lucide-react";

const grievanceSchema = z.object({
  issueType: z.string().min(1, "Issue type is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  latitude: z.number(),
  longitude: z.number(),
  priority: z.enum(["Low", "Medium", "High"]),
  imageUrl: z.string().url().optional(),
});

// Hardcoded categories as a fallback
const issueCategories: IssueCategory[] = [
    { id: "pothole", name: "Pothole" },
    { id: "street-light", name: "Street Light" },
    { id: "garbage", name: "Garbage" },
    { id: "water-leak", name: "Water Leak" },
    { id: "other", name: "Other" },
];

const resolutionDays: Record<string, number> = {
    "Pothole": 5,
    "Street Light": 3,
    "Garbage": 2,
    "Water Leak": 4,
    "Other": 7, // Default for other
};


const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const libraries: ("places" | "core")[] = ["places", "core"];

const PlacesAutocomplete = ({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number) => void}) => {
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

  const handleSelect = ({ description }: {description: string}) => () => {
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
  )
}

export function GrievanceForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [selectedIssueType, setSelectedIssueType] = useState('');
  const [priority, setPriority] = useState<GrievancePriority>('Medium');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: "AIzaSyBnaGNZ1URJs8n3DOxIdcNCiXSUURz2qK8",
    libraries,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const getExpectedResolutionDate = (issueType: string): Date => {
      const days = resolutionDays[issueType] || 7;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !firestore || !firebaseApp) {
      toast({ title: "Error", description: "You must be logged in to submit a grievance.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    
    if (!location) {
        toast({ title: "Error", description: "Please select a location on the map.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
        let imageUrl: string | undefined = undefined;

        if (imageFile) {
            const storage = getStorage(firebaseApp);
            const fileRef = storageRef(storage, `grievances/${user.uid}/${Date.now()}_${imageFile.name}`);
            await uploadBytes(fileRef, imageFile);
            imageUrl = await getDownloadURL(fileRef);
        }
        
        const grievanceDataToValidate = {
            issueType: selectedIssueType,
            description: description,
            latitude: location.lat,
            longitude: location.lng,
            priority: priority,
            ...(imageUrl && { imageUrl }),
        };

        const validatedFields = grievanceSchema.safeParse(grievanceDataToValidate);

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            const errorMessage = Object.values(errors).flat().join(' ');
            toast({ title: "Validation Failed", description: errorMessage, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }

        const createdAt = Timestamp.now();
        const expectedResolutionDate = getExpectedResolutionDate(validatedFields.data.issueType);
        
        const finalGrievanceData = {
            userId: user.uid,
            ...validatedFields.data,
            status: "Pending" as const,
            createdAt: createdAt,
            expectedResolutionDate: Timestamp.fromDate(expectedResolutionDate),
            isOverdue: false,
        };

        const grievancesCollection = collection(firestore, "grievances");
        await addDoc(grievancesCollection, finalGrievanceData);
        
        toast({ title: "Success!", description: "Grievance submitted successfully! It will now appear on the issue map."});
        
        formRef.current?.reset();
        setSelectedIssueType('');
        setDescription('');
        setPriority('Medium');
        setLocation(null);
        setImageFile(null);
        
    } catch (error) {
      console.error("Grievance submission error:", error);
      const grievancesCollection = collection(firestore, "grievances");
      const permissionError = new FirestorePermissionError({
          path: grievancesCollection.path,
          operation: 'create',
      });
      errorEmitter.emit('permission-error', permissionError);
      
      toast({ title: "Submission Error", description: "Could not submit grievance. You may not have the required permissions.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }


  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
        setLocation({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        })
    }
  }

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        mapRef.current?.panTo(newLocation);
        mapRef.current?.setZoom(15);
      },
      () => {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: "Could not get your current location. Please enable location services.",
        });
      }
    );
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    const newLocation = { lat, lng };
    setLocation(newLocation);
    mapRef.current?.panTo(newLocation);
    mapRef.current?.setZoom(15);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Grievance Details</CardTitle>
        <CardDescription>
          Provide issue details and pin its location on the map.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select name="issueType" onValueChange={setSelectedIssueType} value={selectedIssueType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an issue type" />
                    </SelectTrigger>
                    <SelectContent>
                        {issueCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Priority Level</Label>
                 <Select name="priority" onValueChange={(v) => setPriority(v as GrievancePriority)} value={priority}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">🟢 Low</SelectItem>
                        <SelectItem value="Medium">🟡 Medium</SelectItem>
                        <SelectItem value="High">🔴 High (Safety Risk)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Label>Issue Location</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation} className="w-full sm:w-auto">
                    <LocateIcon className="mr-2 h-4 w-4" />
                    Use Current Location
                </Button>
              </div>
              {isLoaded && <PlacesAutocomplete onSelectLocation={handleLocationSelect} />}
              {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={location || { lat: 20.5937, lng: 78.9629 }}
                    zoom={location ? 15 : 5}
                    onClick={handleMapClick}
                    options={{ streetViewControl: false, mapTypeControl: false }}
                    onLoad={(map) => { mapRef.current = map; }}
                >
                   {location && <Marker position={location} />}
                </GoogleMap>
              ) : <Skeleton className="h-[300px] w-full" />}
              {loadError && <p className="text-sm text-destructive">Error loading map. Please try again later.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Image (Optional)</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Grievance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    