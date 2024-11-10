"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { uploadToCloudinary } from "@/app/utils/cloudinary";

interface SchoolSettings {
  name: string;
  logo: string;
}

interface SchoolSettingsContextType {
  settings: SchoolSettings;
  updateSettings: (
    newSettings: Partial<SchoolSettings>,
    logoFile?: File
  ) => Promise<void>;
}

const SchoolSettingsContext = createContext<
  SchoolSettingsContextType | undefined
>(undefined);

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    throw new Error(
      "useSchoolSettings must be used within a SchoolSettingsProvider"
    );
  }
  return context;
};

interface SchoolSettingsProviderProps {
  children: ReactNode;
}

export const SchoolSettingsProvider: React.FC<SchoolSettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SchoolSettings>({
    name: "Peki Senior High School",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg",
  });

  useEffect(() => {
    // Load settings from localStorage when the app initializes
    const loadedSettings = localStorage.getItem("schoolSettings");
    if (loadedSettings) {
      setSettings(JSON.parse(loadedSettings));
    }
  }, []);

  const updateSettings = async (
    newSettings: Partial<SchoolSettings>,
    logoFile?: File
  ) => {
    let updatedSettings = { ...settings, ...newSettings };

    if (logoFile) {
      try {
        const secureUrl = await uploadToCloudinary(logoFile);
        updatedSettings.logo = secureUrl;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }

    setSettings(updatedSettings);
    localStorage.setItem("schoolSettings", JSON.stringify(updatedSettings));
  };

  return (
    <SchoolSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};
