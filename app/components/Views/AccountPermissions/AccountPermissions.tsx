// Third party dependencies.
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// External dependencies.
import SheetBottom, {
  SheetBottomRef,
} from '../../../component-library/components/Sheet/SheetBottom';
import UntypedEngine from '../../../core/Engine';
import {
  AccountPermissionsProps,
  AccountPermissionsScreens,
} from './AccountPermissions.types';
import AccountPermissionsConnected from './AccountPermissionsConnected';
import AccountPermissionsRevoke from './AccountPermissionsRevoke';

// Internal dependencies.
import {
  Account,
  useAccounts,
} from '../../../components/UI/AccountSelectorList';
import Logger from '../../../util/Logger';
import AnalyticsV2 from '../../../util/analyticsV2';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import {
  addPermittedAccounts,
  getPermittedAccountsByOrigin,
} from '../../../core/Permissions';
import AccountConnectMultiSelector from '../AccountConnect/AccountConnectMultiSelector';
import { SelectedAccount } from '../../../components/UI/AccountSelectorList/AccountSelectorList.types';
import { switchActiveAccounts } from '../../../core/Permissions';
import {
  ToastContext,
  ToastVariant,
} from '../../../component-library/components/Toast';

const AccountPermissions = (props: AccountPermissionsProps) => {
  const Engine = UntypedEngine as any;
  const {
    hostInfo: {
      metadata: { origin },
    },
  } = props.route.params;
  const [isLoading, setIsLoading] = useState(false);
  const prevSelectedAddress = useRef();
  const permittedAccountsList = useSelector(
    (state: any) => state.engine.backgroundState.PermissionController,
  );
  const permittedAccountsByOrigin = getPermittedAccountsByOrigin(
    permittedAccountsList,
    origin,
  );
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const sheetRef = useRef<SheetBottomRef>(null);
  const [permissionsScreen, setPermissionsScreen] =
    useState<AccountPermissionsScreens>(AccountPermissionsScreens.Connected);
  const { accounts, ensByAccountAddress } = useAccounts({
    isLoading,
  });
  const navigation = useNavigation();
  const { toastRef } = useContext(ToastContext);
  const activeAddress: string = permittedAccountsByOrigin[0];

  const dismissSheet = () => sheetRef?.current?.hide?.();

  const accountsFilteredByPermissions = useMemo(() => {
    const accountsByPermittedStatus: Record<
      'permitted' | 'unpermitted',
      Account[]
    > = {
      permitted: [],
      unpermitted: [],
    };

    accounts.forEach((account) => {
      if (permittedAccountsByOrigin.includes(account.address)) {
        accountsByPermittedStatus.permitted.push(account);
      } else {
        accountsByPermittedStatus.unpermitted.push(account);
      }
    });

    return accountsByPermittedStatus;
  }, [accounts, permittedAccountsList]);

  const onConnect = useCallback(async () => {
    try {
      setIsLoading(true);
      const newActiveAddress = await addPermittedAccounts(
        origin,
        selectedAddresses,
      );
      const newActiveAccount = accounts.find(
        ({ address }) => address === newActiveAddress,
      );
      const connectedAccountLength = selectedAddresses.length;
      toastRef?.current?.showToast({
        variant: ToastVariant.Account,
        labelOptions: [
          { label: `Connected` },
          { label: ` ${connectedAccountLength}`, isBold: true },
          {
            label: ` more account${connectedAccountLength > 1 ? 's' : ''} to.`,
          },
          { label: ` ${origin}`, isBold: true },
          { label: `.` },
          { label: `\nSwitched to account` },
          { label: ` ${newActiveAccount?.name}`, isBold: true },
          { label: '.' },
        ],
        accountAddress: newActiveAddress,
      });
    } catch (e: any) {
      Logger.error(e, 'Error while trying to connect to a dApp.');
    } finally {
      setIsLoading(false);
      dismissSheet();
    }
  }, [selectedAddresses, accounts]);

  const onCreateAccount = useCallback(async (isMultiSelect?: boolean) => {
    const { KeyringController } = Engine.context;
    try {
      setIsLoading(true);
      await KeyringController.addNewAccount();
      AnalyticsV2.trackEvent(ANALYTICS_EVENT_OPTS.ACCOUNTS_ADDED_NEW_ACCOUNT);
    } catch (e: any) {
      Logger.error(e, 'error while trying to add a new account');
    } finally {
      setIsLoading(false);
    }
    /* eslint-disable-next-line */
  }, []);

  const onOpenImportAccount = useCallback(() => {
    sheetRef.current?.hide(() => {
      navigation.navigate('ImportPrivateKeyView');
      // Is this where we want to track importing an account or within ImportPrivateKeyView screen?
      AnalyticsV2.trackEvent(
        ANALYTICS_EVENT_OPTS.ACCOUNTS_IMPORTED_NEW_ACCOUNT,
      );
    });
  }, [navigation]);

  const onOpenConnectHardwareWallet = useCallback(() => {
    sheetRef.current?.hide(() => {
      navigation.navigate('ConnectQRHardwareFlow');
      // Is this where we want to track connecting a hardware wallet or within ConnectQRHardwareFlow screen?
      AnalyticsV2.trackEvent(
        AnalyticsV2.ANALYTICS_EVENTS.CONNECT_HARDWARE_WALLET,
      );
    });
  }, [navigation]);

  const renderConnectedScreen = useCallback(() => {
    return (
      <AccountPermissionsConnected
        isLoading={isLoading}
        openConnectMoreAccounts={() => {
          setSelectedAddresses([]);
          setPermissionsScreen(AccountPermissionsScreens.Connect);
        }}
        openRevokePermissions={() =>
          setPermissionsScreen(AccountPermissionsScreens.Revoke)
        }
        onSwitchActiveAccount={({ origin, address }) => {
          if (address !== activeAddress) {
            switchActiveAccounts(origin, address);
          }
          dismissSheet();
          const newActiveAccount = accounts.find(
            ({ address: accAddress }) => address === accAddress,
          );
          toastRef?.current?.showToast({
            variant: ToastVariant.Account,
            labelOptions: [
              { label: `Switched to account` },
              { label: ` ${newActiveAccount?.name}`, isBold: true },
              { label: '.' },
            ],
            accountAddress: address,
          });
        }}
        accounts={accountsFilteredByPermissions.permitted}
        ensByAccountAddress={ensByAccountAddress}
        selectedAddresses={[activeAddress]}
        {...props}
      />
    );
  }, [
    accounts,
    ensByAccountAddress,
    selectedAddresses,
    activeAddress,
    isLoading,
    permittedAccountsList,
    origin,
    accountsFilteredByPermissions,
  ]);

  const renderConnectScreen = useCallback(() => {
    return (
      <AccountConnectMultiSelector
        onCancel={dismissSheet}
        accounts={accountsFilteredByPermissions.unpermitted}
        ensByAccountAddress={ensByAccountAddress}
        selectedAddresses={selectedAddresses}
        onSelectAddress={setSelectedAddresses}
        onConnect={onConnect}
        isLoading={isLoading}
        onCreateAccount={() => onCreateAccount(true)}
        onOpenImportAccount={onOpenImportAccount}
        onOpenConnectHardwareWallet={onOpenConnectHardwareWallet}
        {...props}
      />
    );
  }, [
    accounts,
    ensByAccountAddress,
    selectedAddresses,
    isLoading,
    onConnect,
    onCreateAccount,
    onOpenImportAccount,
    onOpenConnectHardwareWallet,
    accountsFilteredByPermissions,
  ]);

  const renderRevokeScreen = useCallback(() => {
    return (
      <AccountPermissionsRevoke
        accounts={accountsFilteredByPermissions.permitted}
        onBack={() => setPermissionsScreen(AccountPermissionsScreens.Connected)}
        ensByAccountAddress={ensByAccountAddress}
        permittedAddresses={permittedAccountsByOrigin}
        isLoading={isLoading}
        onRevokeAll={() => {
          dismissSheet();
          toastRef?.current?.showToast({
            variant: ToastVariant.Plain,
            labelOptions: [
              { label: `Disconnected all accounts from ${origin}.` },
            ],
          });
        }}
        {...props}
      />
    );
  }, [
    accounts,
    ensByAccountAddress,
    selectedAddresses,
    isLoading,
    permittedAccountsList,
    origin,
    accountsFilteredByPermissions,
  ]);

  const renderPermissionsScreens = useCallback(() => {
    switch (permissionsScreen) {
      case AccountPermissionsScreens.Connected:
        return renderConnectedScreen();
      case AccountPermissionsScreens.Connect:
        return renderConnectScreen();
      case AccountPermissionsScreens.Revoke:
        return renderRevokeScreen();
    }
  }, [
    permissionsScreen,
    renderConnectedScreen,
    renderConnectScreen,
    renderRevokeScreen,
  ]);

  return (
    <SheetBottom reservedMinOverlayHeight={0} ref={sheetRef}>
      {renderPermissionsScreens()}
    </SheetBottom>
  );
};

export default AccountPermissions;
