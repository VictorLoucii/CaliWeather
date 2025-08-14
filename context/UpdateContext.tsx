// context/UpdateContext.tsx:

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as Application from 'expo-application';


interface UpdateContextType {
  updateAvailable: boolean;
  latestVersion: string | null;
}

const VERSION_CHECK_URL = 'https://gist.githubusercontent.com/VictorLoucii/e473c402d13451c2697c2a593e2ccb35/raw/d165b4ac2b414b59dd670d7cbea825a1393b2b7a/version.json';

export const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export const useUpdate = () => useContext(UpdateContext);

//reliable function to properly compare update version numbers
function isUpdateNeeded(currentVersionStr: string, latestVersionStr: string): boolean {

  console.log(`[isUpdateNeeded] Comparing: current='${currentVersionStr}', latest='${latestVersionStr}'`);


  if (!currentVersionStr || !latestVersionStr) return false;

  const currentParts = currentVersionStr.split('.').map(Number);
  const latestParts = latestVersionStr.split('.').map(Number);

  const maxLength = Math.max(currentParts.length, latestParts.length);

  for (let i = 0; i < maxLength; i++) {
    const current = currentParts[i] || 0;
    const latest = latestParts[i] || 0;

    if (latest > current) {
      console.log("[isUpdateNeeded] Result: true (Newer version found)");
      return true; // A newer version is available
    }
    if (current > latest) {
      return false; // The current version is somehow newer
    }
  }

  return false; // This line is crucial - it means versions are identical
}

// Create the Provider component
export const UpdateProvider = ({ children }: { children: ReactNode }) => {

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        console.log("1. Starting update check..."); // DEBUG 
        const response = await fetch(VERSION_CHECK_URL);
        const data = await response.json();

        console.log("2. Data received from server:", JSON.stringify(data, null, 2)); //DEBUG 

        const fetchedLatestVersion = data.latestVersion;

        setLatestVersion(fetchedLatestVersion); // Store the latest version

        const currentVersion = Application.nativeApplicationVersion;

        const needsUpdate = isUpdateNeeded(currentVersion, fetchedLatestVersion);

        // DEBUG LINE:
        console.log(`3. Final Decision: current='${currentVersion}', latest='${fetchedLatestVersion}', needsUpdate?=${needsUpdate}`);

        // IMPORTANT: Use a reliable version comparison function 
        if (currentVersion && needsUpdate) {
          setUpdateAvailable(true);
        } else {
          // Add this 'else' block to be extra safe
          setUpdateAvailable(false);
        }
      }
      catch (error) {
        console.error("Failed to check for updates:", error);
        // Don't show an update if the check fails
        setUpdateAvailable(false);
      }
    };
    checkForUpdates();
  }, []); // Runs once on app start

  return (
    <UpdateContext.Provider value={{ updateAvailable, latestVersion }}>
      {children}
    </UpdateContext.Provider>
  );
};