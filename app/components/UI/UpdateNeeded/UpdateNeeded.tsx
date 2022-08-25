import React from 'react';
import { SafeAreaView, View, Image } from 'react-native';
import { createStyles } from './styles';
import { strings } from '../../../../locales/i18n';
import Text, { TextVariant } from '../../../component-library/components/Text';
import StyledButton from '../StyledButton';
import { createNavigationDetails } from '../../../util/navigation/navUtils';
import Routes from '../../../constants/navigation/Routes';
import { useTheme } from '../../../util/theme';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const onboardingDeviceImage = require('../../../images/swaps_onboard_device.png');

export const createUpdateNeededNavDetails = createNavigationDetails(
  Routes.MODAL.ROOT_MODAL_FLOW,
  Routes.MODAL.UPDATE_NEEDED,
);

const UpdateNeeded = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.images}>
          <Image source={onboardingDeviceImage} />
          <Text variant={TextVariant.lHeadingLG}>
            {strings('update_needed.title')}
          </Text>
          <Text variant={TextVariant.sBodyMD} style={styles.description}>
            {strings('update_needed.description')}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtonWrapper}>
        <StyledButton type="confirm" containerStyle={styles.actionButton}>
          {strings('update_needed.primary_action')}
        </StyledButton>
      </View>
    </SafeAreaView>
  );
};

export default React.memo(UpdateNeeded);
