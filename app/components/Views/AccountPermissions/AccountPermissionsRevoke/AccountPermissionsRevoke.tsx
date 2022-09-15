// Third party dependencies.
import React, { useCallback, useContext, useMemo } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// External dependencies.
import SheetActions from '../../../../component-library/components-temp/SheetActions';
import SheetHeader from '../../../../component-library/components/Sheet/SheetHeader';
import { strings } from '../../../../../locales/i18n';
import TagUrl from '../../../../component-library/components/Tags/TagUrl';
import Text from '../../../../component-library/components/Text';
import { getHost } from '../../../../util/browser';
import { useStyles } from '../../../../component-library/hooks';
import ButtonSecondary, {
  ButtonSecondaryVariant,
} from '../../../../component-library/components/Buttons/ButtonSecondary';
import { ButtonBaseSize } from '../../../../component-library/components/Buttons/ButtonBase';

// Internal dependencies.
import { AccountPermissionsRevokeProps } from './AccountPermissionsRevoke.types';
import styleSheet from './AccountPermissionsRevoke.styles';
import AccountSelectorList from '../../../../components/UI/AccountSelectorList';
import { ButtonTertiaryVariant } from '../../../../component-library/components/Buttons/ButtonTertiary';
import { removePermittedAccount } from '../../../../core/Permissions';
import UntypedEngine from '../../../../core/Engine';
import Logger from '../../../../util/Logger';
import Routes from '../../../../constants/navigation/Routes';
import { ModalConfirmationVariant } from '../../../../component-library/components/Modals/ModalConfirmation';
import { formatAddress } from '../../../../util/address';
import {
  ToastContext,
  ToastVariant,
} from '../../../../component-library/components/Toast';
import { ToastOptions } from '../../../../component-library/components/Toast';

const AccountPermissionsRevoke = ({
  route,
  ensByAccountAddress,
  accounts,
  onBack,
  isLoading,
  permittedAddresses,
  onRevokeAll,
}: AccountPermissionsRevokeProps) => {
  const {
    hostInfo: {
      metadata: { origin },
    },
  } = route.params;
  const Engine = UntypedEngine as any;
  const { styles } = useStyles(styleSheet, {});
  const navigation = useNavigation();
  const activeAddress = permittedAddresses[0];
  const { toastRef } = useContext(ToastContext);

  /**
   * Get image url from favicon api.
   */
  const getFavicon: ImageSourcePropType = useMemo(() => {
    const iconUrl = `https://api.faviconkit.com/${getHost(origin)}/64`;
    return { uri: iconUrl };
  }, [origin]);

  const revokeAllAccounts = async () => {
    try {
      await Engine.context.PermissionController.revokeAllPermissions(origin);
      onRevokeAll();
    } catch (e) {
      Logger.log(`Failed to revoke all accounts for ${origin}`, e);
    }
  };

  const renderSheetAction = useCallback(
    () => (
      <View style={styles.sheetActionContainer}>
        <SheetActions
          actions={[
            {
              label: strings('accounts.disconnect_all_accounts'),
              onPress: revokeAllAccounts,
              disabled: isLoading,
              variant: ButtonTertiaryVariant.Danger,
            },
          ]}
        />
      </View>
    ),
    [revokeAllAccounts, isLoading],
  );

  return (
    <>
      <SheetHeader
        title={strings('accounts.connected_accounts_title')}
        onBack={onBack}
      />
      <View style={styles.body}>
        <TagUrl imageSource={getFavicon} label={origin} />
        <Text style={styles.description}>
          {strings('accounts.connect_description')}
        </Text>
      </View>
      <AccountSelectorList
        renderRightAccessory={(address, name) => (
          <ButtonSecondary
            variant={ButtonSecondaryVariant.Danger}
            onPress={() => {
              if (permittedAddresses.length === 1) {
                // Dismiss and show toast
                revokeAllAccounts();
              } else {
                const labelOptions: ToastOptions['labelOptions'] = [
                  { label: `Disconnected account` },
                  { label: ` ${name}`, isBold: true },
                  { label: ` from ${origin}.` },
                ];
                if (activeAddress === address) {
                  const nextActiveAddress = permittedAddresses[1];
                  const newActiveAccount = accounts.find(
                    ({ address }) => address === nextActiveAddress,
                  );
                  // Prompt user of auto account switch
                  removePermittedAccount(origin, address);
                  labelOptions.push(
                    { label: `\nSwitched to account` },
                    { label: ` ${newActiveAccount?.name}`, isBold: true },
                    { label: '.' },
                  );
                  toastRef?.current?.showToast({
                    variant: ToastVariant.Account,
                    labelOptions,
                    accountAddress: nextActiveAddress,
                  });
                } else {
                  // Just disconnect
                  removePermittedAccount(origin, address);
                  toastRef?.current?.showToast({
                    variant: ToastVariant.Plain,
                    labelOptions,
                  });
                }
              }
            }}
            label={strings('accounts.disconnect')}
            size={ButtonBaseSize.Sm}
            style={{ alignSelf: 'center' }}
          />
        )}
        isSelectionDisabled
        selectedAddresses={[]}
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        isLoading={isLoading}
      />
      {renderSheetAction()}
    </>
  );
};

export default AccountPermissionsRevoke;
