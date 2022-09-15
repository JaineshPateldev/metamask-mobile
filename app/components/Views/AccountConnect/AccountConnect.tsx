// Third party dependencies.
import React, {
  useCallback,
  useContext,
  useEffect,
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
  AccountConnectProps,
  AccountConnectScreens,
} from './AccountConnect.types';
import AccountConnectSingle from './AccountConnectSingle';
import AccountConnectSingleSelector from './AccountConnectSingleSelector';
import AccountConnectMultiSelector from './AccountConnectMultiSelector';

// Internal dependencies.
import {
  Account,
  useAccounts,
} from '../../../components/UI/AccountSelectorList';
import { isDefaultAccountName } from '../../../util/ENSUtils';
import Logger from '../../../util/Logger';
import AnalyticsV2 from '../../../util/analyticsV2';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { SelectedAccount } from 'app/components/UI/AccountSelectorList/AccountSelectorList.types';
import {
  ToastContext,
  ToastVariant,
} from '../../../component-library/components/Toast';

const AccountConnect = (props: AccountConnectProps) => {
  const Engine = UntypedEngine as any;
  const { hostInfo } = props.route.params;
  const [isLoading, setIsLoading] = useState(false);
  const prevSelectedAddress = useRef();
  const shouldAutoSwitchSelectedAccount = useRef(true);
  const selectedWalletAddress = useSelector(
    (state: any) =>
      state.engine.backgroundState.PreferencesController.selectedAddress,
  );
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([
    selectedWalletAddress,
  ]);
  const sheetRef = useRef<SheetBottomRef>(null);
  const [accountConnectScreen, setAccountConnectScreen] =
    useState<AccountConnectScreens>(AccountConnectScreens.SingleConnect);
  const { accounts, ensByAccountAddress } = useAccounts({
    isLoading,
  });
  const navigation = useNavigation();
  const { toastRef } = useContext(ToastContext);

  const dismissSheet = () => sheetRef?.current?.hide?.();

  const onConnect = useCallback(async () => {
    const { origin } = hostInfo.metadata;
    const selectedAccounts: SelectedAccount[] = selectedAddresses.map(
      (address, index) => ({ address, lastUsed: Date.now() - index }),
    );
    const request = {
      ...hostInfo,
      permissions: { ...hostInfo.permissions },
      approvedAccounts: selectedAccounts,
    };
    const connectedAccountLength = selectedAccounts.length;
    const activeAddress = selectedAccounts[0].address;
    const activeAccount = accounts.find(
      ({ address }) => address === activeAddress,
    );

    try {
      setIsLoading(true);
      await Engine.context.PermissionController.acceptPermissionsRequest(
        request,
      );
      toastRef?.current?.showToast({
        variant: ToastVariant.Account,
        labelOptions: [
          { label: `Connected` },
          { label: ` ${connectedAccountLength}`, isBold: true },
          {
            label: ` account${connectedAccountLength > 1 ? 's' : ''} to`,
          },
          { label: ` ${origin}`, isBold: true },
          { label: `.` },
          { label: `\n${activeAccount?.name}`, isBold: true },
          { label: ` is now active.` },
        ],
        accountAddress: activeAddress,
      });
    } catch (e: any) {
      Logger.error(e, 'Error while trying to connect to a dApp.');
    } finally {
      setIsLoading(false);
      dismissSheet();
    }
  }, [selectedAddresses, hostInfo, accounts]);

  const onCreateAccount = useCallback(async (isMultiSelect?: boolean) => {
    const { KeyringController } = Engine.context;
    try {
      shouldAutoSwitchSelectedAccount.current = !isMultiSelect;
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

  // This useEffect is used for auto selecting the newly created account post account creation.
  useEffect(() => {
    if (isLoading && prevSelectedAddress.current !== selectedWalletAddress) {
      shouldAutoSwitchSelectedAccount.current &&
        setSelectedAddresses([selectedWalletAddress]);
      prevSelectedAddress.current = selectedWalletAddress;
    }
    if (!prevSelectedAddress.current) {
      prevSelectedAddress.current = selectedWalletAddress;
    }
  }, [selectedWalletAddress, isLoading, selectedAddresses]);

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

  const renderSingleConnectScreen = useCallback(() => {
    const selectedAddress = selectedAddresses[0];
    const selectedAccount = accounts.find((account) => {
      return account.address === selectedAddress;
    });
    const ensName = ensByAccountAddress[selectedAddress];
    const defaultSelectedAccount: Account | undefined = !!selectedAccount
      ? {
          ...selectedAccount,
          name:
            isDefaultAccountName(selectedAccount.name) && ensName
              ? ensName
              : selectedAccount.name,
        }
      : undefined;
    return (
      <AccountConnectSingle
        onOpenSingleConnectSelector={() => {
          setAccountConnectScreen(AccountConnectScreens.SingleConnectSelector);
        }}
        openOpenMultiConnectSelector={() => {
          setSelectedAddresses([]);
          setAccountConnectScreen(AccountConnectScreens.MultiConnectSelector);
        }}
        defaultSelectedAccount={defaultSelectedAccount}
        onCancel={dismissSheet}
        onConnect={onConnect}
        isLoading={isLoading}
        {...props}
      />
    );
  }, [accounts, ensByAccountAddress, selectedAddresses, onConnect, isLoading]);

  const renderSingleConnectSelectorScreen = useCallback(() => {
    return (
      <AccountConnectSingleSelector
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        onBack={() =>
          setAccountConnectScreen(AccountConnectScreens.SingleConnect)
        }
        onSelectAccount={(address) => {
          setAccountConnectScreen(AccountConnectScreens.SingleConnect);
          setSelectedAddresses([address]);
        }}
        selectedAddresses={selectedAddresses}
        isLoading={isLoading}
        onCreateAccount={() => onCreateAccount()}
        onOpenImportAccount={onOpenImportAccount}
        onOpenConnectHardwareWallet={onOpenConnectHardwareWallet}
      />
    );
  }, [
    accounts,
    ensByAccountAddress,
    selectedAddresses,
    isLoading,
    onCreateAccount,
    onOpenImportAccount,
    onOpenConnectHardwareWallet,
  ]);

  const renderMultiConnectSelectorScreen = useCallback(() => {
    return (
      <AccountConnectMultiSelector
        onCancel={dismissSheet}
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        selectedAddresses={selectedAddresses}
        onSelectAddress={(addresses) => {
          setSelectedAddresses(addresses);
        }}
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
    onConnect,
    isLoading,
    onCreateAccount,
    onOpenImportAccount,
    onOpenConnectHardwareWallet,
  ]);

  const renderConnectScreens = useCallback(() => {
    switch (accountConnectScreen) {
      case AccountConnectScreens.SingleConnect:
        return renderSingleConnectScreen();
      case AccountConnectScreens.SingleConnectSelector:
        return renderSingleConnectSelectorScreen();
      case AccountConnectScreens.MultiConnectSelector:
        return renderMultiConnectSelectorScreen();
    }
  }, [
    accountConnectScreen,
    renderSingleConnectScreen,
    renderSingleConnectSelectorScreen,
    renderMultiConnectSelectorScreen,
  ]);

  return (
    <SheetBottom reservedMinOverlayHeight={0} ref={sheetRef}>
      {renderConnectScreens()}
    </SheetBottom>
  );
};

export default AccountConnect;
