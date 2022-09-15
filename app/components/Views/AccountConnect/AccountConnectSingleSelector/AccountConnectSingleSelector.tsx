// Third party dependencies.
import React, { useCallback } from 'react';

// External dependencies.
import SheetActions from '../../../../component-library/components-temp/SheetActions';
import SheetHeader from '../../../../component-library/components/Sheet/SheetHeader';
import AccountSelectorList from '../../../../components/UI/AccountSelectorList';
import { strings } from '../../../../../locales/i18n';

// Internal dependencies.
import { AccountConnectSingleSelectorProps } from './AccountConnectSingleSelector.types';

const AccountConnectSingleSelector = ({
  accounts,
  ensByAccountAddress,
  onBack,
  onSelectAccount,
  selectedAddresses,
  isLoading,
  onCreateAccount,
  onOpenImportAccount,
  onOpenConnectHardwareWallet,
}: AccountConnectSingleSelectorProps) => {
  const renderSheetActions = useCallback(
    () => (
      <SheetActions
        actions={[
          {
            label: strings('accounts.create_new_account'),
            onPress: onCreateAccount,
            isLoading,
          },
          {
            label: strings('accounts.import_account'),
            onPress: onOpenImportAccount,
            disabled: isLoading,
          },
          {
            label: strings('accounts.connect_hardware'),
            onPress: onOpenConnectHardwareWallet,
            disabled: isLoading,
          },
        ]}
      />
    ),
    [
      isLoading,
      onCreateAccount,
      onOpenImportAccount,
      onOpenConnectHardwareWallet,
    ],
  );

  return (
    <>
      <SheetHeader onBack={onBack} title={strings('accounts.accounts_title')} />
      <AccountSelectorList
        onSelectAccount={onSelectAccount}
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        isLoading={isLoading}
        selectedAddresses={selectedAddresses}
      />
      {renderSheetActions()}
    </>
  );
};

export default AccountConnectSingleSelector;
