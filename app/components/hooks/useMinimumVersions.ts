import { useEffect } from 'react';
import { getBuildNumber } from 'react-native-device-info';
import { useAppConfig } from './AppConfig';
import { createUpdateNeededNavDetails } from '../UI/UpdateNeeded/UpdateNeeded';

const useMinimumVersions = (navigation: any) => {
  const minimumValues = useAppConfig();
  const currentBuildNumber = Number(getBuildNumber());
  console.log(currentBuildNumber);
  useEffect(() => {
    if (
      minimumValues.data &&
      minimumValues.data.security.minimumVersions.appMinimumBuild <
        currentBuildNumber
    ) {
      console.log(
        'minimum',
        minimumValues.data.security.minimumVersions.appMinimumBuild >
          currentBuildNumber,
      );
      navigation.navigate(...createUpdateNeededNavDetails());
    }
  });
};

export default useMinimumVersions;
