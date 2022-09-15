// External dependencies.
import { UseAccounts } from '../../../../components/UI/AccountSelectorList/hooks/useAccounts/useAccounts.types';
import { AccountPermissionsProps } from '../';
import { Account } from '../../../../components/UI/AccountSelectorList';

/**
 * AccountPermissionsConnected props.
 */
export interface AccountPermissionsConnectedProps
  extends AccountPermissionsProps,
    UseAccounts {
  openConnectMoreAccounts: () => void;
  openRevokePermissions: () => void;
  isLoading?: boolean;
  selectedAddresses: string[];
  onSwitchActiveAccount: ({
    origin,
    address,
  }: {
    origin: string;
    address: string;
  }) => void;
}
