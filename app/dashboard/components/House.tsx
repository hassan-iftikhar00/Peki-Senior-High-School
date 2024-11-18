import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HouseProps {
  gender: string;
  houseId?: string;
  houseName?: string;
  isLoading: boolean;
  error?: string | null;
}

export default function House({
  gender,
  houseId,
  houseName,
  isLoading,
  error,
}: HouseProps) {
  useEffect(() => {
    console.log("House Component - HouseId:", houseId);
    console.log("House Component - HouseName:", houseName);
  }, [houseId, houseName]);

  return (
    <div id="house" className="section">
      <h2>House Assignment</h2>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Assigning house...</span>
        </div>
      ) : (
        <>
          <p className="subtitle flashing-text headings">
            {houseId && houseName
              ? "House has been assigned automatically."
              : "House will be assigned automatically."}
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <input type="text" id="gender" value={gender} required disabled />
            </div>
            <div className="form-group">
              <label htmlFor="houseAssigned">
                House Assigned <span className="required">*</span>
              </label>
              <input
                type="text"
                id="houseAssigned"
                value={houseName || "Not yet assigned"}
                required
                disabled
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
