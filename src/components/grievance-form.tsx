
"use client";

import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { useUser, useFirestore, useFirebaseApp } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, Timestamp, setDoc } from "firebase/firestore";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { IssueCategory, GrievancePriority } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { LocateIcon } from "lucide-react";
import { PlacesAutocomplete } from "./places-autocomplete";

const grievanceSchema = z.object({
  issueType: z.string().min(1, "Issue type is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  latitude: z.number(),
  longitude: z.number(),
  priority: z.enum(["Low", "Medium", "High"]),
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


export function GrievanceForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [selectedIssueType, setSelectedIssueType] = useState('');
  const [priority, setPriority] = useState<GrievancePriority>('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const resetForm = () => {
    formRef.current?.reset();
    setSelectedIssueType('');
    setDescription('');
    setPriority('Medium');
    setLocation(null);
  }

  const getExpectedResolutionDate = (issueType: string): Date => {
      const days = resolutionDays[issueType] || 7;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !firestore) {
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
        const grievanceDataToValidate = {
            issueType: selectedIssueType,
            description: description,
            latitude: location.lat,
            longitude: location.lng,
            priority: priority,
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
        
        const grievanceRef = doc(collection(firestore, "grievances"));
        const grievanceId = grievanceRef.id;

        const finalGrievanceData = {
            id: grievanceId,
            userId: user.uid,
            ...validatedFields.data,
            imageUrl: null,
            status: "Pending" as const,
            createdAt: createdAt,
            expectedResolutionDate: Timestamp.fromDate(expectedResolutionDate),
            isOverdue: false,
        };
        
        await setDoc(grievanceRef, finalGrievanceData).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: grievanceRef.path,
                operation: 'create',
                requestResourceData: finalGrievanceData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw error;
        });
        
        toast({ title: "Success!", description: "Grievance submitted successfully! It will now appear on the issue map."});
        resetForm();
        
    } catch (error: any) {
      console.error("Grievance submission error:", error);
      toast({ title: "Submission Error", description: error.message || "Could not submit grievance. You may not have permission.", variant: "destructive"});
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
                <Select name="issueType" onValueChange={setSelectedIssueType} value={selectedIssueType} disabled={isSubmitting}>
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
                 <Select name="priority" onValueChange={(v) => setPriority(v as GrievancePriority)} value={priority} disabled={isSubmitting}>
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
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Label>Issue Location</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation} className="w-full sm:w-auto" disabled={isSubmitting || !isLoaded}>
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
                    options={{ streetViewControl: false, mapTypeControl: false, clickableIcons: false }}
                    onLoad={(map) => { mapRef.current = map; }}
                >
                   {location && <Marker position={location} />}
                </GoogleMap>
              ) : <Skeleton className="h-[300px] w-full" />}
              {loadError && <p className="text-sm text-destructive">Error loading map. Please try again later.</p>}
          </div>

          <div className="space-y-2">
            <Label>Upload Image (Optional)</Label>
            <Input type="file" disabled={isSubmitting} accept="image/png, image/jpeg" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting Grievance..." : "Submit Grievance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
